import DataLoader from 'dataloader';
import Knex from 'knex';

export enum DataModelError {
  NotFound = 'NOT_FOUND',
}

abstract class DataModel<ModelData extends { id: string }, CreateSet, UpdateSet> {
  protected loader: DataLoader<string, ModelData>;
  public tableName!: string;
  protected modelKeys!: readonly (keyof ModelData)[];
  kx: Knex;
  get: DataLoader<string, ModelData>['load'];
  getMany: DataLoader<string, ModelData>['loadMany'];

  /**
   * @param kx - DB connection
   * @param userId - user id to use when executing data loader queries
   * */
  constructor(kx: Knex, cache = true) {
    this.kx = kx;
    this.loader = new DataLoader(
      async keys =>
      {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rows: ModelData[] = await this.kx(this.tableName)
            .select(this.modelKeys)
            .whereIn('id', keys);

          const keyMap: Record<string, ModelData> = {};
          for (const row of rows) {
            if (row.id in keyMap) continue;
            keyMap[row.id] = row;
          }
          const result = keys.map(key => keyMap[key]);
          if (result.length !== keys.length) {
            console.error('DataModel error: count mismatch ', keys, result);
          }
          return result;
        } catch (e) {
          console.error('DataModel error: ', e);
          throw e;
        }
      },
      { cache },
    );
    this.get = this.loader.load.bind(this.loader);
    this.getMany = this.loader.loadMany.bind(this.loader);
  }

  async getWhereIn<K extends keyof ModelData>(
    field: K,
    values: ModelData[K][],
    tx = this.kx,
  ): Promise<ModelData[]> {
    const rows: ModelData[] = await tx(this.tableName)
      .select(this.modelKeys)
      .whereIn(field, values)
      .orderBy('created_at', 'desc');
    for (const row of rows) {
      this.loader.prime(row.id, row);
    }
    return rows;
  }

  async getAll(tx = this.kx): Promise<ModelData[]> {
    const rows: ModelData[] = await tx(this.tableName)
      .select(this.modelKeys)
      .orderBy('created_at', 'desc');
    for (const row of rows) {
      this.loader.prime(row.id, row);
    }
    return rows;
  }

  async create(data: CreateSet, tx: Knex.Transaction): Promise<ModelData> {
    const [row]: ModelData[] = await tx(this.tableName)
      .insert(data)
      .returning(this.modelKeys as string[]);
    this.loader.prime(row.id, row);
    return row;
  }

  async createMany(data: CreateSet[], tx: Knex.Transaction): Promise<ModelData[]> {
    const rows: ModelData[] = await tx
      .batchInsert(this.tableName, data)
      .returning(this.modelKeys as string[]);
    for (const row of rows) {
      this.loader.prime(row.id, row);
    }
    return rows;
  }

  async update(id: string, data: UpdateSet, tx: Knex.Transaction): Promise<ModelData> {
    const [row]: ModelData[] = await tx(this.tableName)
      .update(data)
      .where({ id })
      .returning(this.modelKeys as string[]);
    this.loader.prime(id, row);
    return row;
  }

  async delete(id: string, tx: Knex.Transaction): Promise<ModelData | { error: DataModelError }> {
    const [row]: ModelData[] = await tx(this.tableName)
      .where({ id })
      .delete()
      .returning(this.modelKeys as string[]);

    if (!row) return { error: DataModelError.NotFound };

    this.loader.clear(id);
    return row;
  }

  async deleteWhereIn<K extends keyof ModelData>(
    params: Record<K, ModelData[K][]>,
    tx: Knex.Transaction,
  ): Promise<ModelData[]> {
    const rows: ModelData[] = await tx(this.tableName)
      .where(builder => {
        for (const field in params) {
          builder.whereIn(field, params[field]);
        }
      })
      .delete()
      .returning(this.modelKeys as string[]);

    for (const row of rows) {
      this.loader.clear(row.id);
    }
    return rows;
  }
}

export default DataModel;
