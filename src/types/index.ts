export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  note?: string;
  date: string; // ISO 8601 YYYY-MM-DDTHH:mm:ss.sssZ
  createdAt: number;
}

export type BillingCycle = 'monthly' | 'yearly' | 'weekly';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  billingDay: number; // 1-31 for monthly, 1-7 for weekly, etc.
  nextBillingDate: string; // ISO 8601
  category: string;
  isActive: boolean;
  reminderEnabled: boolean;
  createdAt: number;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number | null; // null for open-ended or streak goals
  currentAmount: number;
  targetDate: string | null;
  streakCount: number;
  isCompleted: boolean;
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
