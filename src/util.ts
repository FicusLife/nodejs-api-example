import dotenv from 'dotenv';
import os from 'os';
dotenv.config();

interface BackendEnv {
  pg: {
    host: string;
    userName: string;
    password: string;
    dbName: string;
    pool: {
      max: number;
    };
  };
  server: {
    jwtSecret: string;
    url: string;
    gateway_url: string;
    apiEnv: string;
    instanceId: string;
  };
  client: {
    url: string;
  };
  googleAuth: {
    clientId: string;
    secret: string;
    projectId: string;
  };
}

const nullableEnvVars = [
  'GAE_INSTANCE',
  'GOOGLE_PROJECT_ID',
]; // Allow some vars to be null/empty

const envParser = (env: { [key: string]: string | undefined }) => (varName: string): string => {
  const value = env[varName];
  if (typeof value === 'string') {
    return value;
  } else if (nullableEnvVars.includes(varName)) {
    return '';
  }
  throw new Error(`Missing ${varName} in process environment`);
};

export function getEnv(): BackendEnv {
  const parse = envParser(process.env);
  const pg = {
    host: parse('PG_HOST'),
    userName: parse('PG_USER'),
    password: parse('PG_PASSWORD'),
    dbName: parse('PG_DB'),
    pool: {
      max: parseInt(parse('PG_POOL_MAX'), 10),
    },
  };
  const server = {
    jwtSecret: parse('JWT_SECRET'),
    url: parse('SERVER_URL'),
    gateway_url: parse('GATEWAY_URL'),
    apiEnv: parse('API_ENV'),
    instanceId: parse('GAE_INSTANCE') || `x${os.userInfo().username}_${os.hostname()}`,
  };
  const client = {
    url: parse('CLIENT_URL'),
  };
  const googleAuth = {
    clientId: parse('GAUTH_CLIENT_ID'),
    secret: parse('GAUTH_SECRET'),
    projectId: parse('GOOGLE_PROJECT_ID'),
  };

  return {
    pg,
    client,
    server,
    googleAuth,
  };
}

export type Merge<Target extends Record<string, any>, Part extends Record<string, any>> = Omit<
  Target,
  keyof Part
> &
  Part;

/**
 * Make all properties in T optional
 * This is similar to TS's Partial type, but it also allows null
 */
export type Partialize<T> = {
  [P in keyof T]?: T[P] | null;
};

export function exclude<A extends readonly any[], B extends readonly any[]>(
  a: A,
  b: B,
): readonly Exclude<A[number], B[number]>[] {
  return a.filter(x => b.includes(x)) as any;
}

export type PickTuple<A, B extends readonly any[]> = Pick<A, B[number]>;
