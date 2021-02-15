import gql from 'graphql-tag';

const schema = gql`
  # Scalars

  scalar Date

  # User
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    source: RegistrationType!
    email: String!
    phone: String
    picture: String
    googleId: String
    password: String
    orgId: ID
    orgRole: String
    userRole: String
    createdAt: Date!
  }

  enum RegistrationType {
    EMAIL
    GOOGLE
    FACEBOOK
    ANONYMOUS
    IMPORT
  }

  # Mutations: googleLogin, simpleLogin
  union LoginResult = LoginSuccess | LoginError
  type LoginSuccess {
    me: User!
    newUser: Boolean
  }
  type LoginError {
    errorCodes: [LoginErrorCode!]!
  }
  enum LoginErrorCode {
    # Authorization failed due to 3rd party errors
    AUTH_FAILED
    # User already exists
    USER_ALREADY_EXISTS
    # Invalid credentials provided
    INVALID_CREDENTIALS
    # User not found
    USER_NOT_FOUND
    # Mismatching source
    WRONG_SOURCE
  }
  input GoogleLoginInput {
    authCode: String!
    # Set to true to register new user, otherwise login
    register: Boolean
  }
  input SimpleLoginInput {
    email: String!
    password: String!
    source: RegistrationType!
    firstName: String
    lastName: String
    # Set to true to register new user, otherwise login
    register: Boolean
  }

  # Mutation: createUser
  union UpdateUserResult = UpdateUserSuccess | UpdateUserError
  input UpdateUserInput {
    id: ID!
    email: String
    source: RegistrationType
    firstName: String
    lastName: String
    password: String
    phone: String
    picture: String
    orgId: ID
    orgRole: String
    userRole: String
  }
  enum UpdateUserErrorCode {
    BAD_DATA
    USER_ALREADY_EXISTS
    UNAUTHORIZED
  }
  type UpdateUserError {
    errorCodes: [UpdateUserErrorCode!]!
  }
  type UpdateUserSuccess {
    user: User!
  }

  # Mutation: logOut
  union LogOutResult = LogOutSuccess | LogOutError

  enum LogOutErrorCode {
    LOG_OUT_FAILED
  }
  type LogOutError {
    errorCodes: [LogOutErrorCode!]!
  }
  type LogOutSuccess {
    message: String
  }

  # Mutations
  type Mutation {
    simpleLogin(input: SimpleLoginInput!): LoginResult!
    anonymousLogin: LoginResult!
    googleLogin(input: GoogleLoginInput!): LoginResult!
    logOut: LogOutResult!
    updateUser(input: UpdateUserInput!): UpdateUserResult!
  }

  # Queries
  type Query {
    hello: String
    me: User
  }
`;

export default schema;
