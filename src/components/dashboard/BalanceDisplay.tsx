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
        <Skeleton width={100} height={14} borderRadius={4} />
        <Skeleton width="80%" height={52} borderRadius={10} style={{ marginVertical: 8 }} />
        <Skeleton width={180} height={20} borderRadius={6} />
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

      <View style={styles.metricsRow}>
        <View style={styles.safeToSpendBadge}>
          <Text style={styles.safeToSpendLabel}>Safe to Spend:</Text>
          <Text style={styles.safeToSpendValue}>
            {formatCurrency(summary.safeToSpendDaily, { showDecimals: false })}/día
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#000000',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  balanceAmount: {
    fontSize: 46,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1.2,
    marginVertical: 4,
  },
  negativeBalance: {
    color: '#FF453A',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  safeToSpendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: '#1C1C1E',
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
