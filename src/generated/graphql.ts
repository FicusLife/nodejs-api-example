import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { ResolverContext } from '../resolvers/types';
export type Maybe<T> = T | null;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
  Date: any,
};


export type GoogleLoginInput = {
  authCode: Scalars['String'],
  /** Set to true to register new user, otherwise login */
  register?: Maybe<Scalars['Boolean']>,
};

export type LoginError = {
   __typename?: 'LoginError',
  errorCodes: Array<LoginErrorCode>,
};

export enum LoginErrorCode {
  /** Authorization failed due to 3rd party errors */
  AuthFailed = 'AUTH_FAILED',
  /** User already exists */
  UserAlreadyExists = 'USER_ALREADY_EXISTS',
  /** Invalid credentials provided */
  InvalidCredentials = 'INVALID_CREDENTIALS',
  /** User not found */
  UserNotFound = 'USER_NOT_FOUND',
  /** Mismatching source */
  WrongSource = 'WRONG_SOURCE'
}

/** Mutations: googleLogin, simpleLogin */
export type LoginResult = LoginSuccess | LoginError;

export type LoginSuccess = {
   __typename?: 'LoginSuccess',
  me: User,
  newUser?: Maybe<Scalars['Boolean']>,
};

export type LogOutError = {
   __typename?: 'LogOutError',
  errorCodes: Array<LogOutErrorCode>,
};

export enum LogOutErrorCode {
  LogOutFailed = 'LOG_OUT_FAILED'
}

/** Mutation: logOut */
export type LogOutResult = LogOutSuccess | LogOutError;

export type LogOutSuccess = {
   __typename?: 'LogOutSuccess',
  message?: Maybe<Scalars['String']>,
};

/** Mutations */
export type Mutation = {
   __typename?: 'Mutation',
  simpleLogin: LoginResult,
  anonymousLogin: LoginResult,
  googleLogin: LoginResult,
  logOut: LogOutResult,
  updateUser: UpdateUserResult,
};


/** Mutations */
export type MutationSimpleLoginArgs = {
  input: SimpleLoginInput
};


/** Mutations */
export type MutationGoogleLoginArgs = {
  input: GoogleLoginInput
};


/** Mutations */
export type MutationUpdateUserArgs = {
  input: UpdateUserInput
};

/** Queries */
export type Query = {
   __typename?: 'Query',
  hello?: Maybe<Scalars['String']>,
  me?: Maybe<User>,
};

export enum RegistrationType {
  Email = 'EMAIL',
  Google = 'GOOGLE',
  Facebook = 'FACEBOOK',
  Anonymous = 'ANONYMOUS',
  Import = 'IMPORT'
}

export type SimpleLoginInput = {
  email: Scalars['String'],
  password: Scalars['String'],
  source: RegistrationType,
  firstName?: Maybe<Scalars['String']>,
  lastName?: Maybe<Scalars['String']>,
  /** Set to true to register new user, otherwise login */
  register?: Maybe<Scalars['Boolean']>,
};

export type UpdateUserError = {
   __typename?: 'UpdateUserError',
  errorCodes: Array<UpdateUserErrorCode>,
};

export enum UpdateUserErrorCode {
  BadData = 'BAD_DATA',
  UserAlreadyExists = 'USER_ALREADY_EXISTS',
  Unauthorized = 'UNAUTHORIZED'
}

export type UpdateUserInput = {
  id: Scalars['ID'],
  email?: Maybe<Scalars['String']>,
  source?: Maybe<RegistrationType>,
  firstName?: Maybe<Scalars['String']>,
  lastName?: Maybe<Scalars['String']>,
  password?: Maybe<Scalars['String']>,
  phone?: Maybe<Scalars['String']>,
  picture?: Maybe<Scalars['String']>,
  orgId?: Maybe<Scalars['ID']>,
  orgRole?: Maybe<Scalars['String']>,
  userRole?: Maybe<Scalars['String']>,
};

/** Mutation: createUser */
export type UpdateUserResult = UpdateUserSuccess | UpdateUserError;

export type UpdateUserSuccess = {
   __typename?: 'UpdateUserSuccess',
  user: User,
};

/** User */
export type User = {
   __typename?: 'User',
  id: Scalars['ID'],
  firstName: Scalars['String'],
  lastName: Scalars['String'],
  source: RegistrationType,
  email: Scalars['String'],
  phone?: Maybe<Scalars['String']>,
  picture?: Maybe<Scalars['String']>,
  googleId?: Maybe<Scalars['String']>,
  password?: Maybe<Scalars['String']>,
  orgId?: Maybe<Scalars['ID']>,
  orgRole?: Maybe<Scalars['String']>,
  userRole?: Maybe<Scalars['String']>,
  createdAt: Scalars['Date'],
};



export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;


export type StitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Query: ResolverTypeWrapper<{}>,
  String: ResolverTypeWrapper<Scalars['String']>,
  User: ResolverTypeWrapper<User>,
  ID: ResolverTypeWrapper<Scalars['ID']>,
  RegistrationType: RegistrationType,
  Date: ResolverTypeWrapper<Scalars['Date']>,
  Mutation: ResolverTypeWrapper<{}>,
  SimpleLoginInput: SimpleLoginInput,
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
  LoginResult: ResolversTypes['LoginSuccess'] | ResolversTypes['LoginError'],
  LoginSuccess: ResolverTypeWrapper<LoginSuccess>,
  LoginError: ResolverTypeWrapper<LoginError>,
  LoginErrorCode: LoginErrorCode,
  GoogleLoginInput: GoogleLoginInput,
  LogOutResult: ResolversTypes['LogOutSuccess'] | ResolversTypes['LogOutError'],
  LogOutSuccess: ResolverTypeWrapper<LogOutSuccess>,
  LogOutError: ResolverTypeWrapper<LogOutError>,
  LogOutErrorCode: LogOutErrorCode,
  UpdateUserInput: UpdateUserInput,
  UpdateUserResult: ResolversTypes['UpdateUserSuccess'] | ResolversTypes['UpdateUserError'],
  UpdateUserSuccess: ResolverTypeWrapper<UpdateUserSuccess>,
  UpdateUserError: ResolverTypeWrapper<UpdateUserError>,
  UpdateUserErrorCode: UpdateUserErrorCode,
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Query: {},
  String: Scalars['String'],
  User: User,
  ID: Scalars['ID'],
  RegistrationType: RegistrationType,
  Date: Scalars['Date'],
  Mutation: {},
  SimpleLoginInput: SimpleLoginInput,
  Boolean: Scalars['Boolean'],
  LoginResult: ResolversParentTypes['LoginSuccess'] | ResolversParentTypes['LoginError'],
  LoginSuccess: LoginSuccess,
  LoginError: LoginError,
  LoginErrorCode: LoginErrorCode,
  GoogleLoginInput: GoogleLoginInput,
  LogOutResult: ResolversParentTypes['LogOutSuccess'] | ResolversParentTypes['LogOutError'],
  LogOutSuccess: LogOutSuccess,
  LogOutError: LogOutError,
  LogOutErrorCode: LogOutErrorCode,
  UpdateUserInput: UpdateUserInput,
  UpdateUserResult: ResolversParentTypes['UpdateUserSuccess'] | ResolversParentTypes['UpdateUserError'],
  UpdateUserSuccess: UpdateUserSuccess,
  UpdateUserError: UpdateUserError,
  UpdateUserErrorCode: UpdateUserErrorCode,
};

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date'
}

export type LoginErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['LoginError'] = ResolversParentTypes['LoginError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['LoginErrorCode']>, ParentType, ContextType>,
};

export type LoginResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['LoginResult'] = ResolversParentTypes['LoginResult']> = {
  __resolveType: TypeResolveFn<'LoginSuccess' | 'LoginError', ParentType, ContextType>
};

export type LoginSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['LoginSuccess'] = ResolversParentTypes['LoginSuccess']> = {
  me?: Resolver<ResolversTypes['User'], ParentType, ContextType>,
  newUser?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>,
};

export type LogOutErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['LogOutError'] = ResolversParentTypes['LogOutError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['LogOutErrorCode']>, ParentType, ContextType>,
};

export type LogOutResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['LogOutResult'] = ResolversParentTypes['LogOutResult']> = {
  __resolveType: TypeResolveFn<'LogOutSuccess' | 'LogOutError', ParentType, ContextType>
};

export type LogOutSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['LogOutSuccess'] = ResolversParentTypes['LogOutSuccess']> = {
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
};

export type MutationResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  simpleLogin?: Resolver<ResolversTypes['LoginResult'], ParentType, ContextType, RequireFields<MutationSimpleLoginArgs, 'input'>>,
  anonymousLogin?: Resolver<ResolversTypes['LoginResult'], ParentType, ContextType>,
  googleLogin?: Resolver<ResolversTypes['LoginResult'], ParentType, ContextType, RequireFields<MutationGoogleLoginArgs, 'input'>>,
  logOut?: Resolver<ResolversTypes['LogOutResult'], ParentType, ContextType>,
  updateUser?: Resolver<ResolversTypes['UpdateUserResult'], ParentType, ContextType, RequireFields<MutationUpdateUserArgs, 'input'>>,
};

export type QueryResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  hello?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>,
};

export type UpdateUserErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateUserError'] = ResolversParentTypes['UpdateUserError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['UpdateUserErrorCode']>, ParentType, ContextType>,
};

export type UpdateUserResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateUserResult'] = ResolversParentTypes['UpdateUserResult']> = {
  __resolveType: TypeResolveFn<'UpdateUserSuccess' | 'UpdateUserError', ParentType, ContextType>
};

export type UpdateUserSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateUserSuccess'] = ResolversParentTypes['UpdateUserSuccess']> = {
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>,
};

export type UserResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  source?: Resolver<ResolversTypes['RegistrationType'], ParentType, ContextType>,
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  phone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  picture?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  googleId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  password?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  orgId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>,
  orgRole?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  userRole?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>,
};

export type Resolvers<ContextType = ResolverContext> = {
  Date?: GraphQLScalarType,
  LoginError?: LoginErrorResolvers<ContextType>,
  LoginResult?: LoginResultResolvers,
  LoginSuccess?: LoginSuccessResolvers<ContextType>,
  LogOutError?: LogOutErrorResolvers<ContextType>,
  LogOutResult?: LogOutResultResolvers,
  LogOutSuccess?: LogOutSuccessResolvers<ContextType>,
  Mutation?: MutationResolvers<ContextType>,
  Query?: QueryResolvers<ContextType>,
  UpdateUserError?: UpdateUserErrorResolvers<ContextType>,
  UpdateUserResult?: UpdateUserResultResolvers,
  UpdateUserSuccess?: UpdateUserSuccessResolvers<ContextType>,
  User?: UserResolvers<ContextType>,
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
*/
export type IResolvers<ContextType = ResolverContext> = Resolvers<ContextType>;
