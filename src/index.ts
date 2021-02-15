import { ContextFunction } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import axios from 'axios';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import Knex, { Transaction } from 'knex';
import knexStringcase from 'knex-stringcase';
import { promisify } from 'util';
import winston from 'winston';
import {
  generateGoogleLoginURL,
  googleAuth
} from './auth';
import UserModel from './datalayer/user';
import { env } from './env';
import {
  ResolverFn,
  SubscriptionResolverObject
} from './generated/graphql';
import {
  anonymousLoginResolver,
  GetUserResolver,
  googleLoginResolver,
  logOutResolver,
  simpleLoginResolver,
  updateUserResolver
} from './resolvers';
import { Claims, ClaimsToSet, ResolverContext } from './resolvers/types';
import ScalarResolvers from './scalars';
import typeDefs from './schema';
import { SetClaimsRole } from './utils/dictionary';

dotenv.config();

const kx = Knex(
  knexStringcase({
    client: 'pg',
    connection: {
      host: env.pg.host,
      user: env.pg.userName,
      password: env.pg.password,
      database: env.pg.dbName,
    },
    pool: {
      max: env.pg.pool.max,
      acquireTimeoutMillis: 40000,
    },
  }),
);

type ResultResolveType = {
  [x: string]: {
    __resolveType: (obj: { errorCodes: string[] | undefined }) => string;
  };
};

const resultResolveTypeResolver = (resolverName: string): ResultResolveType => ({
  [`${resolverName}Result`]: {
    __resolveType: obj => (obj.errorCodes ? `${resolverName}Error` : `${resolverName}Success`),
  },
});


const functionalResolvers: {
  [rootKey: string]: {
    [fieldKey: string]:
      | ResolverFn<any, any, any, any>
      | SubscriptionResolverObject<any, any, any, any>;
  };
} = {
  Mutation: {
    anonymousLogin: anonymousLoginResolver,
    googleLogin: googleLoginResolver,
    simpleLogin: simpleLoginResolver,
    logOut: logOutResolver,
    updateUser: updateUserResolver,
  },
  Query: {
    hello: () => {
     return "Hello world!";
    },
    me: GetUserResolver,
  },
  ...resultResolveTypeResolver('Login'),
  ...resultResolveTypeResolver('LogOut'),
  ...resultResolveTypeResolver('UpdateUser'),
};

const resolvers = {
  ...functionalResolvers,
  ...ScalarResolvers,
};


let logger: winston.Logger;

const signToken = promisify(jwt.sign);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initModels = (kx: Knex, cache = true) => ({
  user: new UserModel(kx, cache),
});

const verifyAuthToken = (token: string): Claims | undefined => {
  try {
    return jwt.verify(token, env.server.jwtSecret) as Claims;
  } catch {
    return undefined;
  }
};

const contextFunc: ContextFunction<ExpressContext, ResolverContext> = async ({
  req,
  res,
  connection,
}) => {
  let claims: Claims | undefined;
  const isSubscription = !!connection;
  if (req && req.cookies && req.cookies['auth']) {
    claims = verifyAuthToken(req.cookies.auth);
    if (claims) {
      claims.superAdminEnabled = req.cookies['superAdminEnabled'] === 'true';
    }
  } else if (connection && connection.context.cookies) {
    const wsToken = connection.context.cookies.auth;
    if (wsToken) {
      claims = verifyAuthToken(wsToken);
    }
  }

  async function setClaims(tx: Transaction, uuid?: string, userRole?: string): Promise<void> {
    const uid = (claims && claims.uid) || uuid || '00000000-0000-0000-0000-000000000000';
    const dbRole = userRole === SetClaimsRole.ADMIN ? 'admin' : 'user';
    return tx.raw('SELECT * from app.set_claims(?, ?)', [uid, dbRole]);
  }

  const ctx = {
    log: logger,
    claims,

    kx,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    models: initModels(kx, !isSubscription),
    clearAuth: () => {
      res.clearCookie('auth');
    },
    setAuth: async (claims: ClaimsToSet, secret: string = env.server.jwtSecret) => {
      const token = await signToken(claims, secret);
      res.cookie('auth', token, {
        httpOnly: true,
        expires: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
      });
    },
    setClaims,
    authTrx: <TResult>(
      cb: (tx: Knex.Transaction) => TResult,
      userRole?: string,
    ): Promise<TResult> =>
      kx.transaction(async tx => {
        await setClaims(tx, undefined, userRole);
        return cb(tx);
      }),
  };

  if (connection) {
    return {
      ...connection.context,
      ...ctx,
      userRole: claims?.userRole,
      uid: claims ? claims.uid : null,
    };
  }
  return ctx;
};

const PORT = process.env.PORT || 4000;

export const corsConfig = {
  credentials: true,
  origin: [
    env.server.url,
    'http://localhost:3000',
  ],
};

const main = async (): Promise<void> => {
  const app = express();

  logger = winston.createLogger({
      transports: [new winston.transports.Console({ format: winston.format.simple() })],
    });

  app.use(cookieParser());
  app.use(bodyParser());

  const apollo = new ApolloServer({
    context: contextFunc,
    resolvers,
    typeDefs,
    formatError: () => {
      // hide error messages from frontend on prod
      return new Error('Unexpected server error');
    },
  });

  const httpServer = createServer(app);

  apollo.applyMiddleware({
    app,
    cors: corsConfig,
  });

  apollo.installSubscriptionHandlers(httpServer);

  const gAuth = googleAuth();


  app.get('/auth/google-redirect/register', async (req, res) => {
    const state = JSON.stringify({
      redirect_uri: req.query.redirect_uri,
    });
    res.redirect(generateGoogleLoginURL(gAuth, '/auth/google-login/signup', state));
  });


  app.get('/auth/google-redirect/login', async (req, res) => {
    const state = JSON.stringify({
      redirect_uri: req.query.redirect_uri,
    });
    res.redirect(generateGoogleLoginURL(gAuth, '/auth/google-login/login', state));
  });

  app.get('/auth/google-login/:action', async (req, res) => {
    const registerUser = req.params.action === 'signup' ? 'true' : 'false';
    const { code } = req.query;
    const query = `
    mutation googleLogin{
      googleLogin(input: {
        authCode: "${code}",
        register: ${registerUser}
      }) {
        __typename
        ... on LoginError { errorCodes }
        ... on LoginSuccess { 
          me {
            id
            source
            picture
            firstName
            lastName
            email
            orgRole
            userRole
            createdAt
          }
          newUser
        }
      }
    }`;

    try {
      const result = await axios.post(env.server.gateway_url + apollo.graphqlPath, { query });
      const { data } = result.data;

      if (data.googleLogin.__typename === 'LoginError') {
        const errorCodes = data.googleLogin.errorCodes.join(',');

        return res.redirect(`${env.client.url}/${req.params.action}?errorCodes=${errorCodes}`);
      }

      res.setHeader('set-cookie', result.headers['set-cookie']);
      const redirectUri = JSON.parse(req.query.state as string).redirect_uri;
  
      const redirect: Function = function(res: express.Response) {
        if (redirectUri) {
          res.redirect(`${env.client.url}${redirectUri}`);
        } else {
          res.redirect(`${env.client.url}`);
        }
      };

      redirect(res);

    } catch (error) {
      console.error(error);
      res.redirect(`${env.client.url}/${req.params.action}?errorCodes=AUTH_FAILED`);
    }
  });


 httpServer.listen({ port: PORT }, () => {
    logger.info(`🚀 Server ready at ${apollo.graphqlPath}`);
  });
};

main();
