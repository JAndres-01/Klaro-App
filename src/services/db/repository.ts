import { getDatabase } from './client';
import {
  Transaction,
  Balance,
  Subscription,
  Goal,
  BalanceSummary,
  SubscriptionLeak,
  TransactionType,
  BalanceType,
  BillingCycle,
} from '@/types';

// ==========================================
// BALANCES REPOSITORY (CUENTAS / SALDOS / METAS)
// ==========================================

interface DBBalanceRow {
  id: string;
  name: string;
  amount: number;
  currency: string;
  accentColor: string;
  type: string;
  targetAmount: number | null;
  targetDate: string | null;
  streakCount: number;
  isCompleted: number;
  createdAt: number;
}

function mapBalance(row: DBBalanceRow): Balance {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount,
    currency: row.currency,
    accentColor: row.accentColor,
    type: row.type as BalanceType,
    targetAmount: row.targetAmount,
    targetDate: row.targetDate,
    streakCount: row.streakCount,
    isCompleted: Boolean(row.isCompleted),
    createdAt: row.createdAt,
  };
}

export const BalanceRepository = {
  create(balance: Omit<Balance, 'createdAt'> & { createdAt?: number }): Balance {
    const db = getDatabase();
    const createdAt = balance.createdAt ?? Date.now();
    db.runSync(
      `INSERT INTO balances (id, name, amount, currency, accentColor, type, targetAmount, targetDate, streakCount, isCompleted, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        balance.id,
        balance.name,
        balance.amount,
        balance.currency || '$',
        balance.accentColor || '#FFFFFF',
        balance.type,
        balance.targetAmount ?? null,
        balance.targetDate ?? null,
        balance.streakCount ?? 0,
        balance.isCompleted ? 1 : 0,
        createdAt,
      ]
    );
    return {
      ...balance,
      currency: balance.currency || '$',
      accentColor: balance.accentColor || '#FFFFFF',
      createdAt,
    };
  },

  getAll(): Balance[] {
    const db = getDatabase();
    const rows = db.getAllSync<DBBalanceRow>(
      `SELECT * FROM balances ORDER BY CASE WHEN type = 'main' THEN 0 ELSE 1 END, createdAt ASC`
    );
    return rows.map(mapBalance);
  },

  getById(id: string): Balance | null {
    const db = getDatabase();
    const row = db.getFirstSync<DBBalanceRow>(
      `SELECT * FROM balances WHERE id = ?`,
      [id]
    );
    return row ? mapBalance(row) : null;
  },

  getMain(): Balance {
    const db = getDatabase();
    const row = db.getFirstSync<DBBalanceRow>(
      `SELECT * FROM balances WHERE type = 'main' LIMIT 1`
    );
    if (row) return mapBalance(row);

    // Si no existe, crear la cuenta principal por defecto
    return BalanceRepository.create({
      id: 'main',
      name: 'Principal',
      amount: 0,
      currency: '$',
      accentColor: '#FFFFFF',
      type: 'main',
    });
  },

  getGoals(): Balance[] {
    const db = getDatabase();
    const rows = db.getAllSync<DBBalanceRow>(
      `SELECT * FROM balances WHERE type = 'goal' ORDER BY isCompleted ASC, createdAt DESC`
    );
    return rows.map(mapBalance);
  },

  update(id: string, updates: Partial<Balance>): Balance | null {
    const db = getDatabase();
    const current = BalanceRepository.getById(id);
    if (!current) return null;

    const updated: Balance = {
      ...current,
      ...updates,
    };

    db.runSync(
      `UPDATE balances SET 
        name = ?, amount = ?, currency = ?, accentColor = ?, 
        targetAmount = ?, targetDate = ?, streakCount = ?, isCompleted = ?
       WHERE id = ?`,
      [
        updated.name,
        updated.amount,
        updated.currency,
        updated.accentColor,
        updated.targetAmount ?? null,
        updated.targetDate ?? null,
        updated.streakCount ?? 0,
        updated.isCompleted ? 1 : 0,
        id,
      ]
    );

    return updated;
  },

  addFunds(id: string, amount: number): Balance | null {
    const current = BalanceRepository.getById(id);
    if (!current) return null;

    const newAmount = current.amount + amount;
    const isCompleted =
      current.targetAmount !== null && current.targetAmount !== undefined && newAmount >= current.targetAmount;
    const newStreak = (current.streakCount ?? 0) + 1;

    return BalanceRepository.update(id, {
      amount: newAmount,
      isCompleted,
      streakCount: newStreak,
    });
  },

  delete(id: string): void {
    const db = getDatabase();
    // No permitir borrar el saldo principal
    if (id === 'main') return;
    db.runSync(`DELETE FROM balances WHERE id = ?`, [id]);
    db.runSync(`DELETE FROM transactions WHERE balanceId = ?`, [id]);
  },
};

// ==========================================
// TRANSACTIONS REPOSITORY
// ==========================================

interface DBTransactionRow {
  id: string;
  amount: number;
  type: string;
  category: string;
  note: string | null;
  date: string;
  balanceId: string;
  createdAt: number;
}

function mapTransaction(row: DBTransactionRow): Transaction {
  return {
    id: row.id,
    amount: row.amount,
    type: row.type as TransactionType,
    category: row.category,
    note: row.note ?? undefined,
    date: row.date,
    balanceId: row.balanceId || 'main',
    createdAt: row.createdAt,
  };
}

export const TransactionRepository = {
  create(tx: Omit<Transaction, 'createdAt'> & { createdAt?: number; balanceId?: string }): Transaction {
    const db = getDatabase();
    const createdAt = tx.createdAt ?? Date.now();
    const balanceId = tx.balanceId ?? 'main';

    db.runSync(
      `INSERT INTO transactions (id, amount, type, category, note, date, balanceId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tx.id,
        tx.amount,
        tx.type,
        tx.category,
        tx.note ?? null,
        tx.date,
        balanceId,
        createdAt,
      ]
    );

    // Actualizar el monto en la tabla balances asociada
    try {
      const balance = BalanceRepository.getById(balanceId);
      if (balance) {
        const delta = tx.type === 'income' ? tx.amount : -tx.amount;
        BalanceRepository.update(balanceId, {
          amount: balance.amount + delta,
        });
      }
    } catch {
      // Ignorar si falla la sincronización secundaria
    }

    return {
      ...tx,
      balanceId,
      createdAt,
    };
  },

  getAll(limit: number = 50, offset: number = 0, balanceId?: string): Transaction[] {
    const db = getDatabase();
    if (balanceId) {
      const rows = db.getAllSync<DBTransactionRow>(
        `SELECT * FROM transactions WHERE balanceId = ? ORDER BY date DESC, createdAt DESC LIMIT ? OFFSET ?`,
        [balanceId, limit, offset]
      );
      return rows.map(mapTransaction);
    }

    const rows = db.getAllSync<DBTransactionRow>(
      `SELECT * FROM transactions ORDER BY date DESC, createdAt DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows.map(mapTransaction);
  },

  getByDateRange(startDate: string, endDate: string, balanceId?: string): Transaction[] {
    const db = getDatabase();
    if (balanceId) {
      const rows = db.getAllSync<DBTransactionRow>(
        `SELECT * FROM transactions WHERE date >= ? AND date <= ? AND balanceId = ? ORDER BY date DESC`,
        [startDate, endDate, balanceId]
      );
      return rows.map(mapTransaction);
    }

    const rows = db.getAllSync<DBTransactionRow>(
      `SELECT * FROM transactions WHERE date >= ? AND date <= ? ORDER BY date DESC`,
      [startDate, endDate]
    );
    return rows.map(mapTransaction);
  },

  delete(id: string): void {
    const db = getDatabase();
    const txRow = db.getFirstSync<DBTransactionRow>(
      `SELECT * FROM transactions WHERE id = ?`,
      [id]
    );

    if (txRow) {
      // Revertir el impacto en balances
      try {
        const balance = BalanceRepository.getById(txRow.balanceId);
        if (balance) {
          const delta = txRow.type === 'income' ? -txRow.amount : txRow.amount;
          BalanceRepository.update(txRow.balanceId, {
            amount: balance.amount + delta,
          });
        }
      } catch {
        // Ignorar
      }
    }

    db.runSync(`DELETE FROM transactions WHERE id = ?`, [id]);
  },

  getBalanceSummary(balanceId?: string): BalanceSummary {
    const db = getDatabase();
    let query = `
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
      FROM transactions
    `;
    const params: unknown[] = [];

    if (balanceId) {
      query += ` WHERE balanceId = ?`;
      params.push(balanceId);
    }

    const result = db.getFirstSync<{
      income: number | null;
      expenses: number | null;
    }>(query, params as (string | number)[]);

    const totalIncome = result?.income ?? 0;
    const totalExpenses = result?.expenses ?? 0;
    const currentBalance = totalIncome - totalExpenses;

    // Calcular Safe to Spend diario restante en el mes actual
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const remainingDays = Math.max(1, daysInMonth - now.getDate() + 1);
    const safeToSpendDaily = currentBalance > 0 ? currentBalance / remainingDays : 0;

    return {
      currentBalance,
      totalIncome,
      totalExpenses,
      safeToSpendDaily,
    };
  },
};

// ==========================================
// SUBSCRIPTIONS REPOSITORY
// ==========================================

interface DBSubscriptionRow {
  id: string;
  name: string;
  amount: number;
  billingCycle: string;
  billingDay: number;
  nextBillingDate: string;
  category: string;
  isActive: number;
  reminderEnabled: number;
  createdAt: number;
}

function mapSubscription(row: DBSubscriptionRow): Subscription {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount,
    billingCycle: row.billingCycle as BillingCycle,
    billingDay: row.billingDay,
    nextBillingDate: row.nextBillingDate,
    category: row.category,
    isActive: Boolean(row.isActive),
    reminderEnabled: Boolean(row.reminderEnabled),
    createdAt: row.createdAt,
  };
}

export const SubscriptionRepository = {
  create(sub: Omit<Subscription, 'createdAt'> & { createdAt?: number }): Subscription {
    const db = getDatabase();
    const createdAt = sub.createdAt ?? Date.now();
    db.runSync(
      `INSERT INTO subscriptions 
       (id, name, amount, billingCycle, billingDay, nextBillingDate, category, isActive, reminderEnabled, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sub.id,
        sub.name,
        sub.amount,
        sub.billingCycle,
        sub.billingDay,
        sub.nextBillingDate,
        sub.category,
        sub.isActive ? 1 : 0,
        sub.reminderEnabled ? 1 : 0,
        createdAt,
      ]
    );
    return {
      ...sub,
      createdAt,
    };
  },

  getAll(): Subscription[] {
    const db = getDatabase();
    const rows = db.getAllSync<DBSubscriptionRow>(
      `SELECT * FROM subscriptions ORDER BY billingDay ASC, name ASC`
    );
    return rows.map(mapSubscription);
  },

  toggleActive(id: string, isActive: boolean): void {
    const db = getDatabase();
    db.runSync(`UPDATE subscriptions SET isActive = ? WHERE id = ?`, [
      isActive ? 1 : 0,
      id,
    ]);
  },

  delete(id: string): void {
    const db = getDatabase();
    db.runSync(`DELETE FROM subscriptions WHERE id = ?`, [id]);
  },

  getLeakMetrics(): SubscriptionLeak {
    const db = getDatabase();
    const rows = db.getAllSync<DBSubscriptionRow>(
      `SELECT * FROM subscriptions WHERE isActive = 1`
    );

    let monthlyTotal = 0;
    let yearlyTotal = 0;

    for (const row of rows) {
      if (row.billingCycle === 'monthly') {
        monthlyTotal += row.amount;
        yearlyTotal += row.amount * 12;
      } else if (row.billingCycle === 'yearly') {
        monthlyTotal += row.amount / 12;
        yearlyTotal += row.amount;
      } else if (row.billingCycle === 'weekly') {
        monthlyTotal += row.amount * 4.33;
        yearlyTotal += row.amount * 52;
      }
    }

    return {
      monthlyTotal,
      yearlyTotal,
      activeCount: rows.length,
    };
  },
};

// ==========================================
// GOALS REPOSITORY (Mapeado sobre Balances)
// ==========================================

export const GoalRepository = {
  create(goal: Omit<Goal, 'createdAt'> & { createdAt?: number }): Goal {
    return BalanceRepository.create({
      ...goal,
      type: 'goal',
    });
  },

  getAll(): Goal[] {
    return BalanceRepository.getGoals();
  },

  addFunds(id: string, amount: number): Goal | null {
    return BalanceRepository.addFunds(id, amount);
  },

  delete(id: string): void {
    BalanceRepository.delete(id);
  },
};
