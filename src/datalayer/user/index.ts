import { CreateSet, keys as modelKeys, UpdateSet, UserData } from './model';
import DataModel from '../model';
import Knex from 'knex';
import bcrypt from 'bcryptjs';

class UserModel extends DataModel<UserData, CreateSet, UpdateSet> {
  public tableName = 'app.user';
  protected modelKeys = modelKeys;
  constructor(kx: Knex, cache = true) {
    super(kx, cache);
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async getWhere(
    params: { email?: UserData['email'] },
    tx = this.kx,
  ): Promise<UserData | null> {
    const row: UserData | null = await tx(this.tableName)
      .select(this.modelKeys)
      .where(params)
      .first();
    if (!row) return null;
    this.loader.prime(row.id, row);
    return row;
  }

  async createWithPassword(
    { password, ...data }: CreateSet & { password: string },
    tx = this.kx,
  ): Promise<UserData> {
    const [row]: UserData[] = await tx(this.tableName)
      .insert({
        ...data,
        password: await this.hashPassword(password),
      })
      .returning(this.modelKeys);
    this.loader.prime(row.id, row);
    return row;
  }

  async updateWithPassword(
    id: string,
    { password, ...data }: UpdateSet & { password: string },
    tx: Knex.Transaction,
  ): Promise<UserData> {
    const [row]: UserData[] = await tx(this.tableName)
      .update({
        ...data,
        password: await this.hashPassword(password),
      })
      .where({ id })
      .returning(this.modelKeys);
    this.loader.prime(id, row);
    return row;
  }

  async create(set: CreateSet, tx?: Knex.Transaction): Promise<UserData> {
    if (tx) {
      return super.create(set, tx);
    }
    return this.kx.transaction(tx => super.create(set, tx));
  }
}

export default UserModel;
