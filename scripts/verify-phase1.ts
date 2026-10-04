/**
 * Phase 1 Verification Script
 * Validates TypeScript models, SQLite Schema contracts, and data transformation logic.
 */
import {
  Transaction,
  Subscription,
  Goal,
  BalanceSummary,
  SubscriptionLeak,
} from '../src/types';
import {
  CREATE_TRANSACTIONS_TABLE,
  CREATE_SUBSCRIPTIONS_TABLE,
  CREATE_GOALS_TABLE,
  CREATE_INDEXES,
} from '../src/services/db/schema';
import { formatCurrency } from '../src/utils/currency';
import { formatDateLabel, getDaysRemainingInMonth } from '../src/utils/dates';

function runVerification() {
  console.log('--- Verificando Fase 1: Capa de Datos y Modelos ---');

  // 1. Validar schemas SQL
  if (
    !CREATE_TRANSACTIONS_TABLE.includes('CREATE TABLE IF NOT EXISTS transactions') ||
    !CREATE_SUBSCRIPTIONS_TABLE.includes('CREATE TABLE IF NOT EXISTS subscriptions') ||
    !CREATE_GOALS_TABLE.includes('CREATE TABLE IF NOT EXISTS goals') ||
    !CREATE_INDEXES.includes('CREATE INDEX')
  ) {
    throw new Error('Error en la definición del schema SQL');
  }
  console.log('✓ SQL Schemas e Índices validados');

  // 2. Validar tipos e interfaces
  const testTx: Transaction = {
    id: 'tx_1',
    amount: 1500.5,
    type: 'expense',
    category: 'Alimentación',
    note: 'Supermercado semanal',
    date: new Date().toISOString(),
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
    title: 'Fondo de Emergencia',
    targetAmount: 50000,
    currentAmount: 12500,
    targetDate: '2026-12-31',
    streakCount: 5,
    isCompleted: false,
    createdAt: Date.now(),
  };

  console.log('✓ Modelos de Transaction, Subscription y Goal tipados correctamente');

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

  console.log('--- Todas las validaciones de Fase 1 fueron exitosas ---');
}

runVerification();
