export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  note?: string;
  date: string; // ISO 8601 YYYY-MM-DDTHH:mm:ss.sssZ
  balanceId: string; // ID del saldo/cuenta asociada ('main' o ID de meta)
  createdAt: number;
}

export type BalanceType = 'main' | 'goal';

export interface Balance {
  id: string;
  name: string;
  amount: number;
  currency: string;
  accentColor: string;
  type: BalanceType;
  targetAmount?: number | null; // Opcional para metas
  targetDate?: string | null;
  streakCount?: number;
  isCompleted?: boolean;
  createdAt: number;
}

// Alias para compatibilidad con módulos de metas
export type Goal = Balance;

export type BillingCycle = 'monthly' | 'yearly' | 'weekly';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  billingDay: number; // 1-31 para mensual, 1-7 para semanal, etc.
  nextBillingDate: string; // ISO 8601
  category: string;
  isActive: boolean;
  reminderEnabled: boolean;
  createdAt: number;
}

export interface BalanceSummary {
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  safeToSpendDaily: number;
}

export interface SubscriptionLeak {
  monthlyTotal: number;
  yearlyTotal: number;
  activeCount: number;
}

export interface DayBreakdown {
  date: string;
  total: number;
  transactions: Transaction[];
}

export interface MetricPeriod {
  period: 'week' | 'month' | 'year';
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  days: DayBreakdown[];
}
