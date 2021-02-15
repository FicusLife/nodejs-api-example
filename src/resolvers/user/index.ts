import {
  ResolverFn,
  MutationUpdateUserArgs,
  LoginResult,
  MutationSimpleLoginArgs,
  MutationGoogleLoginArgs,
  LogOutResult,
  User,
  RegistrationType,
  LoginErrorCode,
  LogOutErrorCode,
  UpdateUserSuccess,
  UpdateUserError,
} from '../../generated/graphql';
import { WithDataSourcesContext, ResolverContext } from '../types';
import uuid from 'uuid';
import { userDataToUser, authorized } from '../../utils/helpers';
import { validateGoogleUser } from '../../auth';

export const updateUserResolver = authorized<
  UpdateUserSuccess,
  UpdateUserError,
  {},
  MutationUpdateUserArgs
>(async (_, { input: { id, ...params } }, { models, authTrx }) => {
  const updatedUser = await authTrx(tx =>
    params.password
      ? models.user.updateWithPassword(id, { ...params, password: params.password }, tx)
      : models.user.update(id, params, tx),
  );
  return { user: userDataToUser(updatedUser) };
});

export const simpleLoginResolver: ResolverFn<
  LoginResult,
  {},
  WithDataSourcesContext & ResolverContext,
  MutationSimpleLoginArgs
> = async (_obj, { input }, { kx, models, setAuth }) => {
  const userMatched = await models.user.getWhere({ email: input.email });

  if (!input.register) {
    if (!userMatched) {
      return {
        errorCodes: [LoginErrorCode.UserNotFound],
      };
    }

    if (userMatched.source !== RegistrationType.Email) {
      return {
        errorCodes: [LoginErrorCode.WrongSource],
      };
    }

    if (!(await models.user.comparePassword(input.password, userMatched.password || ''))) {
      return {
        errorCodes: [LoginErrorCode.InvalidCredentials],
      };
    }

    await setAuth({ uid: userMatched.id, userRole: userMatched.userRole });
    return { me: userDataToUser(userMatched) };
  } else {
    if (userMatched)
      return {
        errorCodes: [LoginErrorCode.UserAlreadyExists],
      };

    const createdUser = await models.user.createWithPassword({
      source: input.source,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      password: input.password,
      createdAt: new Date(),
    });

    await setAuth({ uid: createdUser.id, userRole: createdUser.userRole });
    return {
      newUser: true,
      me: userDataToUser(createdUser),
    };
  }
};

export const anonymousLoginResolver: ResolverFn<
  LoginResult,
  {},
  WithDataSourcesContext,
  {}
> = async (_, __, { models, setAuth }) => {
  const createdUser = await models.user.create({
    source: RegistrationType.Anonymous,
    email: `${uuid.v4()}@anonymous`,
  });

  await setAuth({ uid: createdUser.id });

  return {
    me: userDataToUser(createdUser),
    newUser: true,
  };
};

export const googleLoginResolver: ResolverFn<
  LoginResult,
  {},
  WithDataSourcesContext,
  MutationGoogleLoginArgs
> = async (_obj, { input }, { kx, models, setAuth }) => {
  const userData = await validateGoogleUser(input.authCode, input.register);
  if (!userData || !userData.email || !userData.id)
    return { errorCodes: [LoginErrorCode.AuthFailed] };

  let authorizedUser;

  const userMatched = await models.user.getWhere({ email: userData.email });
  if (userMatched) {
    authorizedUser = userMatched;
  } else {
    authorizedUser = await models.user.create({
      source: RegistrationType.Google,
      firstName: userData.given_name,
      lastName: userData.family_name,
      email: userData.email,
      picture: userData.picture,
      googleId: userData.id,
    });
  }

  await setAuth({ uid: authorizedUser.id, userRole: userMatched?.userRole });
  
  return { me: userDataToUser(authorizedUser), newUser: !userMatched };
};

export const logOutResolver: ResolverFn<LogOutResult, {}, WithDataSourcesContext, {}> = (
  _,
  __,
  { claims, clearAuth },
) => {
  try {
    if (claims?.uid) clearAuth();
    return { message: 'User successfully logged out!' };
  } catch (error) {
    console.error(error);
    return { errorCodes: [LogOutErrorCode.LogOutFailed] };
  }
};

export const GetUserResolver: ResolverFn<
  User | undefined,
  {},
  WithDataSourcesContext,
  unknown
> = async (_obj, __, { models, claims }) =>
  claims?.uid ? userDataToUser(await models.user.get(claims.uid)) : undefined;


