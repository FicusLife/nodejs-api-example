import {  RegistrationType, ResolverFn } from '../generated/graphql';
import { Claims, WithDataSourcesContext } from '../resolvers/types';
import { UserData } from '../datalayer/user/model';


export function authorized<
  TSuccess,
  TError extends { errorCodes: string[] },
  TParent = {},
  TArgs = {}
>(
  resolver: ResolverFn<
    TSuccess | TError,
    TParent,
    WithDataSourcesContext & { claims: Claims },
    TArgs
  >,
): ResolverFn<TSuccess | TError, TParent, WithDataSourcesContext, TArgs> {
  return (parent, args, ctx, info) => {
    const { claims } = ctx;
    if (claims?.uid) {
      return resolver(parent, args, { ...ctx, claims }, info);
    }
    return { errorCodes: ['UNAUTHORIZED'] } as TError;
  };
}

export const userDataToUser = (
  user: UserData,
): {
  id: string;
  firstName: string;
  lastName: string;
  source: RegistrationType;
  email: string;
  phone?: string | null;
  picture?: string | null;
  googleId?: string | null;
  password?: string | null;
  orgId?: string | null;
  orgRole?: string | null;
  userRole?: string | null;
  createdAt: Date;
  resetPasswordCode?: string | null;
  isAnonymous: boolean;
} => ({
  ...user,
  password: undefined,
  firstName: user.firstName || '',
  lastName: user.lastName || '',
  source: user.source as RegistrationType,
  createdAt: user.createdAt || new Date(),
  isAnonymous: user.source === RegistrationType.Anonymous,
});
