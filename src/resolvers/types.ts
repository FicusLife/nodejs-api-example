import { Context as ApolloContext } from 'apollo-server-core';
import winston from 'winston';
import Knex from 'knex';
import UserModel from '../datalayer/user';

export interface Claims {
  uid: string;
  iat: number;
  userRole?: string;
  superAdminEnabled?: boolean;
}

export type ClaimsToSet = {
  uid: string;
  userRole?: string | null;
};

export type DataModels = {
  user: UserModel;
};

export type DataSources = {
};

export interface RequestContext {
  log: winston.Logger;
  claims: Claims | undefined;
  kx: Knex;
  models: DataModels;
  dataSources: DataSources;
  setAuth: (claims: ClaimsToSet, secret?: string) => Promise<void>;
  clearAuth: () => void;
  setClaims: (tx: Knex.Transaction, uuid?: string | undefined) => Promise<void>;
  authTrx: <TResult>(cb: (tx: Knex.Transaction) => TResult, userRole?: string) => Promise<TResult>;
}

export type ResolverContext = ApolloContext<RequestContext>;

export type WithDataSourcesContext = {
  uid: string;
} & ResolverContext;
