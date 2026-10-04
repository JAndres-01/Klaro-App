import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Transaction } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatDateLabel, formatTime } from '@/utils/dates';

interface TransactionRowProps {
  transaction: Transaction;
  onPress?: (tx: Transaction) => void;
  showDivider?: boolean;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  onPress,
  showDivider = true,
}) => {
  const isIncome = transaction.type === 'income';

  return (
    <Pressable
      onPress={() => onPress?.(transaction)}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      disabled={!onPress}
    >
      <View style={styles.content}>
        <View style={styles.leftColumn}>
          <Text style={styles.category} numberOfLines={1}>
            {transaction.category}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {transaction.note ? `${transaction.note} • ` : ''}
            {formatDateLabel(transaction.date)} {formatTime(transaction.date)}
          </Text>
        </View>

        <View style={styles.rightColumn}>
          <Text
            style={[
              styles.amount,
              isIncome ? styles.incomeAmount : styles.expenseAmount,
            ]}
          >
            {isIncome ? '+' : '-'}
            {formatCurrency(transaction.amount)}
          </Text>
        </View>
      </View>

      {showDivider && <View style={styles.divider} />}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  pressed: {
    backgroundColor: '#0D0D0D',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  leftColumn: {
    flex: 1,
    marginRight: 16,
  },
  category: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  meta: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  rightColumn: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  incomeAmount: {
    color: '#30D158',
  },
  expenseAmount: {
    color: '#FFFFFF',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#1C1C1E',
    marginLeft: 0,
  },
});
