import 'reflect-metadata';
import 'dotenv/config';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

/**
 * Single source of truth for TypeORM connection options.
 * Reads from process.env (populated by dotenv here for the CLI, and by
 * @nestjs/config at runtime). Used both by the Nest TypeOrmModule and by the
 * TypeORM CLI for migrations.
 */
export function buildDataSourceOptions(): DataSourceOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'words_app',
    entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
    migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
    synchronize: false,
  };
}

// Single DataSource export consumed by the TypeORM CLI (migration:generate/run/revert).
export const dataSource = new DataSource(buildDataSourceOptions());
