import { getDatabase } from './client';
import {
  Transaction,
  Subscription,
  Goal,
  BalanceSummary,
  SubscriptionLeak,
  TransactionType,
  BillingCycle,
} from '@/types';

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
    createdAt: row.createdAt,
  };
}

export const TransactionRepository = {
  create(tx: Omit<Transaction, 'createdAt'> & { createdAt?: number }): Transaction {
    const db = getDatabase();
    const createdAt = tx.createdAt ?? Date.now();
    db.runSync(
      `INSERT INTO transactions (id, amount, type, category, note, date, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        tx.id,
        tx.amount,
        tx.type,
        tx.category,
        tx.note ?? null,
        tx.date,
        createdAt,
      ]
    );
    return {
      ...tx,
      createdAt,
    };
  },

  getAll(limit: number = 50, offset: number = 0): Transaction[] {
    const db = getDatabase();
    const rows = db.getAllSync<DBTransactionRow>(
      `SELECT * FROM transactions ORDER BY date DESC, createdAt DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows.map(mapTransaction);
  },

  getByDateRange(startDate: string, endDate: string): Transaction[] {
    const db = getDatabase();
    const rows = db.getAllSync<DBTransactionRow>(
      `SELECT * FROM transactions WHERE date >= ? AND date <= ? ORDER BY date DESC`,
      [startDate, endDate]
    );
    return rows.map(mapTransaction);
  },

  delete(id: string): void {
    const db = getDatabase();
    db.runSync(`DELETE FROM transactions WHERE id = ?`, [id]);
  },

  getBalanceSummary(): BalanceSummary {
    const db = getDatabase();
    const result = db.getFirstSync<{
      income: number | null;
      expenses: number | null;
    }>(
      `SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
       FROM transactions`
    );

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
// GOALS REPOSITORY
// ==========================================

interface DBGoalRow {
  id: string;
  title: string;
  targetAmount: number | null;
  currentAmount: number;
  targetDate: string | null;
  streakCount: number;
  isCompleted: number;
  createdAt: number;
}

function mapGoal(row: DBGoalRow): Goal {
  return {
    id: row.id,
    title: row.title,
    targetAmount: row.targetAmount,
    currentAmount: row.currentAmount,
    targetDate: row.targetDate,
    streakCount: row.streakCount,
    isCompleted: Boolean(row.isCompleted),
    createdAt: row.createdAt,
  };
}

export const GoalRepository = {
  create(goal: Omit<Goal, 'createdAt'> & { createdAt?: number }): Goal {
    const db = getDatabase();
    const createdAt = goal.createdAt ?? Date.now();
    db.runSync(
      `INSERT INTO goals (id, title, targetAmount, currentAmount, targetDate, streakCount, isCompleted, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        goal.id,
        goal.title,
        goal.targetAmount,
        goal.currentAmount,
        goal.targetDate,
        goal.streakCount,
        goal.isCompleted ? 1 : 0,
        createdAt,
      ]
    );
    return {
      ...goal,
      createdAt,
    };
  },

  getAll(): Goal[] {
    const db = getDatabase();
    const rows = db.getAllSync<DBGoalRow>(
      `SELECT * FROM goals ORDER BY isCompleted ASC, createdAt DESC`
    );
    return rows.map(mapGoal);
  },

  addFunds(id: string, amount: number): Goal | null {
    const db = getDatabase();
    const goalRow = db.getFirstSync<DBGoalRow>(
      `SELECT * FROM goals WHERE id = ?`,
      [id]
    );
    if (!goalRow) return null;

    const newAmount = goalRow.currentAmount + amount;
    const isCompleted =
      goalRow.targetAmount !== null && newAmount >= goalRow.targetAmount ? 1 : 0;
    const newStreak = goalRow.streakCount + 1;

    db.runSync(
      `UPDATE goals SET currentAmount = ?, isCompleted = ?, streakCount = ? WHERE id = ?`,
      [newAmount, isCompleted, newStreak, id]
    );

    return {
      ...mapGoal(goalRow),
      currentAmount: newAmount,
      isCompleted: Boolean(isCompleted),
      streakCount: newStreak,
    };
  },

  delete(id: string): void {
    const db = getDatabase();
    db.runSync(`DELETE FROM goals WHERE id = ?`, [id]);
  },
};
