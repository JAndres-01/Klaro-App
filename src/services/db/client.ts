import * as SQLite from 'expo-sqlite';
import {
  CREATE_TRANSACTIONS_TABLE,
  CREATE_SUBSCRIPTIONS_TABLE,
  CREATE_GOALS_TABLE,
  CREATE_INDEXES,
} from './schema';

const DB_NAME = 'klaro.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync(DB_NAME);
    initDatabase(dbInstance);
  }
  return dbInstance;
}

function initDatabase(db: SQLite.SQLiteDatabase): void {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    ${CREATE_TRANSACTIONS_TABLE}
    ${CREATE_SUBSCRIPTIONS_TABLE}
    ${CREATE_GOALS_TABLE}
    ${CREATE_INDEXES}
  `);
}
