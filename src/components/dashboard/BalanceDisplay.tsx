import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BalanceSummary } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { Skeleton } from '@/components/common/Skeleton';

interface BalanceDisplayProps {
  summary: BalanceSummary;
  isLoading?: boolean;
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  summary,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Skeleton width={110} height={14} borderRadius={4} />
        <Skeleton width="75%" height={58} borderRadius={12} style={{ marginVertical: 10 }} />
        <Skeleton width={190} height={24} borderRadius={12} />
      </View>
    );
  }

  const isPositive = summary.currentBalance >= 0;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Saldo actual</Text>
      <Text
        style={[
          styles.balanceAmount,
          !isPositive && styles.negativeBalance,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {formatCurrency(summary.currentBalance)}
      </Text>

      <View style={styles.safeToSpendBadge}>
        <Text style={styles.safeToSpendLabel}>Safe to Spend:</Text>
        <Text style={styles.safeToSpendValue}>
          {formatCurrency(summary.safeToSpendDaily, { showDecimals: false })}/día
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  balanceAmount: {
    fontSize: 54,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1.6,
    marginVertical: 6,
    textAlign: 'center',
  },
  negativeBalance: {
    color: '#FF453A',
  },
  safeToSpendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141414',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: '#1C1C1E',
    marginTop: 6,
  },
  safeToSpendLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginRight: 6,
    fontWeight: '400',
  },
  safeToSpendValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
