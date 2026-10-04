/**
 * Phase 1 Verification Script
 * Validates TypeScript models, SQLite Schema contracts, and data transformation logic.
 */
import {
  Transaction,
  Balance,
  Subscription,
  Goal,
  BalanceSummary,
  SubscriptionLeak,
} from '../src/types';
import {
  CREATE_TRANSACTIONS_TABLE,
  CREATE_BALANCES_TABLE,
  CREATE_SUBSCRIPTIONS_TABLE,
  CREATE_GOALS_TABLE,
  CREATE_INDEXES,
} from '../src/services/db/schema';
import { formatCurrency } from '../src/utils/currency';
import { formatDateLabel, getDaysRemainingInMonth } from '../src/utils/dates';

function runVerification() {
  console.log('--- Verificando Capa de Datos y Modelos Refactorizados ---');

  // 1. Validar schemas SQL
  if (
    !CREATE_TRANSACTIONS_TABLE.includes('CREATE TABLE IF NOT EXISTS transactions') ||
    !CREATE_BALANCES_TABLE.includes('CREATE TABLE IF NOT EXISTS balances') ||
    !CREATE_SUBSCRIPTIONS_TABLE.includes('CREATE TABLE IF NOT EXISTS subscriptions') ||
    !CREATE_INDEXES.includes('CREATE INDEX')
  ) {
    throw new Error('Error en la definición del schema SQL');
  }
  console.log('✓ SQL Schemas e Índices validados');

  // 2. Validar tipos e interfaces
  const testBalance: Balance = {
    id: 'main',
    name: 'Cuenta Principal',
    amount: 15420.0,
    currency: '$',
    accentColor: '#FFFFFF',
    type: 'main',
    createdAt: Date.now(),
  };

  const testTx: Transaction = {
    id: 'tx_1',
    amount: 1500.5,
    type: 'expense',
    category: 'Alimentación',
    note: 'Supermercado semanal',
    date: new Date().toISOString(),
    balanceId: 'main',
    createdAt: Date.now(),
  };

  const testSub: Subscription = {
    id: 'sub_1',
    name: 'iCloud+',
    amount: 2.99,
    billingCycle: 'monthly',
    billingDay: 15,
    nextBillingDate: '2026-10-15T00:00:00.000Z',
    category: 'Cloud',
    isActive: true,
    reminderEnabled: true,
    createdAt: Date.now(),
  };

  const testGoal: Goal = {
    id: 'goal_1',
    name: 'Fondo de Emergencia',
    amount: 12500,
    currency: '$',
    accentColor: '#30D158',
    type: 'goal',
    targetAmount: 50000,
    targetDate: '2026-12-31',
    streakCount: 5,
    isCompleted: false,
    createdAt: Date.now(),
  };

  console.log('✓ Modelos de Transaction (con balanceId) y Balance/Goal validados correctamente');

  // 3. Validar utilidades
  const formatted = formatCurrency(testTx.amount);
  if (formatted !== '$1,500.50') {
    throw new Error(`Currency formatting failed: got ${formatted}`);
  }
  console.log(`✓ Currency formatter: ${formatted}`);

  const dateLabel = formatDateLabel(new Date().toISOString());
  if (dateLabel !== 'Hoy') {
    throw new Error(`Date formatting failed: got ${dateLabel}`);
  }
  console.log(`✓ Date formatter: ${dateLabel}`);

  const daysLeft = getDaysRemainingInMonth();
  console.log(`✓ Días restantes en el mes calculados: ${daysLeft}`);

  console.log('--- Todas las validaciones de modelos fueron exitosas ---');
}

runVerification();
