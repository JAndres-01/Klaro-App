export const CREATE_TRANSACTIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
    category TEXT NOT NULL,
    note TEXT,
    date TEXT NOT NULL,
    createdAt INTEGER NOT NULL
  );
`;

export const CREATE_SUBSCRIPTIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    billingCycle TEXT NOT NULL CHECK(billingCycle IN ('monthly', 'yearly', 'weekly')),
    billingDay INTEGER NOT NULL,
    nextBillingDate TEXT NOT NULL,
    category TEXT NOT NULL,
    isActive INTEGER NOT NULL DEFAULT 1,
    reminderEnabled INTEGER NOT NULL DEFAULT 1,
    createdAt INTEGER NOT NULL
  );
`;

export const CREATE_GOALS_TABLE = `
  CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    targetAmount REAL,
    currentAmount REAL NOT NULL DEFAULT 0,
    targetDate TEXT,
    streakCount INTEGER NOT NULL DEFAULT 0,
    isCompleted INTEGER NOT NULL DEFAULT 0,
    createdAt INTEGER NOT NULL
  );
`;

export const CREATE_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
  CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
  CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(isActive);
  CREATE INDEX IF NOT EXISTS idx_goals_completed ON goals(isCompleted);
`;
