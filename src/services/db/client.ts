import * as SQLite from 'expo-sqlite';
import {
  CREATE_TRANSACTIONS_TABLE,
  CREATE_BALANCES_TABLE,
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
    ${CREATE_BALANCES_TABLE}
    ${CREATE_SUBSCRIPTIONS_TABLE}
    ${CREATE_GOALS_TABLE}
    ${CREATE_INDEXES}
  `);

  // Migration: verificar si la columna balanceId existe en transactions
  try {
    const tableInfo = db.getAllSync<{ name: string }>(`PRAGMA table_info(transactions);`);
    const hasBalanceId = tableInfo.some((col) => col.name === 'balanceId');
    if (!hasBalanceId) {
      db.execSync(`ALTER TABLE transactions ADD COLUMN balanceId TEXT NOT NULL DEFAULT 'main';`);
    }
  } catch {
    // Ignorar si ya existe
  }

  // Sembrar cuenta principal por defecto si no existe
  try {
    const mainBalance = db.getFirstSync<{ id: string }>(`SELECT id FROM balances WHERE id = 'main';`);
    if (!mainBalance) {
      db.runSync(
        `INSERT INTO balances (id, name, amount, currency, accentColor, type, createdAt)
         VALUES ('main', 'Principal', 0, '$', '#FFFFFF', 'main', ?)`,
        [Date.now()]
      );
    }
  } catch {
    // Ignorar
  }
}
