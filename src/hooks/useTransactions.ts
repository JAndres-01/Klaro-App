import { useState, useEffect, useCallback } from 'react';
import { Transaction, BalanceSummary } from '@/types';
import { TransactionRepository } from '@/services/db';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balanceSummary, setBalanceSummary] = useState<BalanceSummary>({
    currentBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    safeToSpendDaily: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refresh = useCallback(() => {
    try {
      const txs = TransactionRepository.getAll(100);
      const summary = TransactionRepository.getBalanceSummary();
      setTransactions(txs);
      setBalanceSummary(summary);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addTransaction = useCallback(
    (tx: Omit<Transaction, 'createdAt'> & { createdAt?: number }) => {
      const newTx = TransactionRepository.create(tx);
      refresh();
      return newTx;
    },
    [refresh]
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
