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

  // Sembrar cuentas iniciales si la tabla de balances está vacía
  try {
    const balanceCount = db.getFirstSync<{ count: number }>(`SELECT COUNT(*) as count FROM balances;`);
    if (!balanceCount || balanceCount.count === 0) {
      const now = Date.now();
      db.runSync(
        `INSERT INTO balances (id, name, amount, currency, accentColor, type, createdAt)
         VALUES ('main', 'Cuenta Principal', 4850.00, '$', '#FFFFFF', 'main', ?)`,
        [now]
      );
      db.runSync(
        `INSERT INTO balances (id, name, amount, currency, accentColor, type, targetAmount, streakCount, createdAt)
         VALUES ('goal_emergency', 'Fondo de Emergencia', 12500.00, '$', '#30D158', 'goal', 20000.00, 4, ?)`,
        [now]
      );
      db.runSync(
        `INSERT INTO balances (id, name, amount, currency, accentColor, type, targetAmount, streakCount, createdAt)
         VALUES ('goal_travel', 'Ahorro Viaje', 950.00, '$', '#0A84FF', 'goal', 3000.00, 2, ?)`,
        [now]
      );

      // Sembrar transacciones de ejemplo asociadas a cada saldo
      db.runSync(
        `INSERT INTO transactions (id, amount, type, category, note, date, balanceId, createdAt)
         VALUES 
          ('tx_1', 3200.00, 'income', 'Nómina', 'Salario mensual', '${new Date().toISOString()}', 'main', ${now}),
          ('tx_2', 145.50, 'expense', 'Supermercado', 'Compras de la semana', '${new Date().toISOString()}', 'main', ${now - 3600000}),
          ('tx_3', 25.00, 'expense', 'Café', 'Espresso y snack', '${new Date().toISOString()}', 'main', ${now - 7200000}),
          ('tx_4', 1500.00, 'income', 'Aporte Ahorro', 'Transferencia automática', '${new Date().toISOString()}', 'goal_emergency', ${now}),
          ('tx_5', 300.00, 'income', 'Depósito Viaje', 'Apartado quincenal', '${new Date().toISOString()}', 'goal_travel', ${now});`
      );
    }
  } catch {
    // Ignorar
  }
}
