import { exclude, Partialize, PickTuple } from '../../util';

/**
 * ```
 *         Column        |           Type           | Collation  |   Nullable  |       Default
 *  ---------------------+--------------------------+------------+-------------+----------------------
 *   id                  | uuid                     |            | not null    | uuid_generate_v1mc()
 *   first_name          | text                     |            |             |
 *   last_name           | text                     |            |             |
 *   source              | text                     |            | not null    |
 *   email               | text                     |            | not null    |
 *   phone               | text                     |            |             |
 *   picture             | text                     |            |             |
 *   google_id           | text                     |            |             |
 *   password            | text                     |            |             |
 *   org_id              | uuid                     |            |             |
 *   org_role            | text                     |            |             |
 *   created_at          | timestamp with time zone |            |             |
 *   user_role           | text                     |            |             |
 * 
 * ```
 * */
export interface UserData {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  source: string;
  email: string;
  phone?: string | null;
  picture?: string | null;
  googleId?: string | null;
  password?: string | null;
  orgId?: string | null;
  orgRole?: string | null;
  createdAt?: Date | null;
  userRole?: string | null;
}

export const keys = [
  'id',
  'firstName',
  'lastName',
  'source',
  'email',
  'phone',
  'picture',
  'googleId',
  'password',
  'orgId',
  'orgRole',
  'createdAt',
  'userRole',
] as const;

export const defaultedKeys = ['id'] as const;

type DefaultedSet = PickTuple<UserData, typeof defaultedKeys>;

export const createKeys = exclude(keys, defaultedKeys);

export type CreateSet = PickTuple<UserData, typeof createKeys> & Partialize<DefaultedSet>;

export const updateKeys = [
  'firstName',
  'lastName',
  'phone',
  'picture',
  'password',
  'orgId',
  'orgRole',
  'createdAt',
  'userRole',
] as const;

export type UpdateSet = PickTuple<UserData, typeof updateKeys>;
