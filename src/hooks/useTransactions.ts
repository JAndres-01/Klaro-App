import { useState, useCallback, useEffect } from 'react';
import { Transaction, BalanceSummary } from '@/types';
import { TransactionRepository } from '@/services/db';

export function useTransactions(balanceId?: string) {
  // Inicialización síncrona desde SQLite local para arranque instantáneo (<1ms)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      return TransactionRepository.getAll(100, 0, balanceId);
    } catch {
      return [];
    }
  });

  const [balanceSummary, setBalanceSummary] = useState<BalanceSummary>(() => {
    try {
      return TransactionRepository.getBalanceSummary(balanceId);
    } catch {
      return {
        currentBalance: 0,
        totalIncome: 0,
        totalExpenses: 0,
        safeToSpendDaily: 0,
      };
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refresh = useCallback(() => {
    try {
      const txs = TransactionRepository.getAll(100, 0, balanceId);
      const summary = TransactionRepository.getBalanceSummary(balanceId);
      setTransactions(txs);
      setBalanceSummary(summary);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [balanceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addTransaction = useCallback(
    (tx: Omit<Transaction, 'createdAt' | 'balanceId'> & { createdAt?: number; balanceId?: string }) => {
      const newTx = TransactionRepository.create({
        ...tx,
        balanceId: tx.balanceId ?? balanceId ?? 'main',
      });
      refresh();
      return newTx;
    },
    [balanceId, refresh]
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      TransactionRepository.delete(id);
      refresh();
    },
    [refresh]
  );

  return {
    transactions,
    balanceSummary,
    isLoading,
    refresh,
    addTransaction,
    deleteTransaction,
  };
}
