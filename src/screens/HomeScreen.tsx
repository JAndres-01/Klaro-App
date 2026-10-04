import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/common/Header';
import { BalanceCarousel, TransactionRow } from '@/components/dashboard';
import { BalanceListModal } from '@/screens/BalanceListModal';
import { Skeleton } from '@/components/common/Skeleton';
import { useTransactions } from '@/hooks/useTransactions';
import { useHaptics } from '@/hooks/useHaptics';
import { BalanceRepository } from '@/services/db';
import { Balance, Transaction } from '@/types';

interface HomeScreenProps {
  onOpenAdd?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenAdd }) => {
  const [balances, setBalances] = useState<Balance[]>(() => {
    try {
      return BalanceRepository.getAll();
    } catch {
      return [];
    }
  });

  const [activeBalanceIndex, setActiveBalanceIndex] = useState<number>(0);
  const [isBalanceModalVisible, setIsBalanceModalVisible] = useState<boolean>(false);
  const [isPulling, setIsPulling] = useState<boolean>(false);

  const activeBalance = balances[activeBalanceIndex] || balances[0] || {
    id: 'main',
    name: 'Cuenta Principal',
    amount: 0,
    currency: '$',
    accentColor: '#FFFFFF',
    type: 'main' as const,
    createdAt: Date.now(),
  };

  const {
    transactions,
    balanceSummary,
    isLoading,
    refresh: refreshTransactions,
  } = useTransactions(activeBalance.id);

  const { triggerKeypadTap, triggerSelection } = useHaptics();
  const insets = useSafeAreaInsets();

  const refreshBalances = useCallback(() => {
    try {
      const allBalances = BalanceRepository.getAll();
      setBalances(allBalances);
    } catch (e) {
      console.error('Error refreshing balances:', e);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setIsPulling(true);
    triggerSelection();
    refreshBalances();
    refreshTransactions();
    setTimeout(() => {
      setIsPulling(false);
    }, 400);
  }, [refreshBalances, refreshTransactions, triggerSelection]);

  const handleOpenAdd = () => {
    triggerKeypadTap();
    onOpenAdd?.();
  };

  const handleSelectBalance = (balanceId: string) => {
    const targetIndex = balances.findIndex((b) => b.id === balanceId);
    if (targetIndex >= 0) {
      setActiveBalanceIndex(targetIndex);
    }
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <BalanceCarousel
        balances={balances}
        activeBalanceIndex={activeBalanceIndex}
        onBalanceChange={setActiveBalanceIndex}
        onOpenBalanceList={() => setIsBalanceModalVisible(true)}
        safeToSpendDaily={balanceSummary.safeToSpendDaily}
      />
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {activeBalance.name} • Movimientos
        </Text>
        <Pressable
          onPress={handleOpenAdd}
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          hitSlop={8}
        >
          <Text style={styles.addButtonText}>+ Agregar</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: Transaction }) => (
    <TransactionRow transaction={item} />
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <Skeleton width="100%" height={48} borderRadius={12} style={{ marginBottom: 12 }} />
          <Skeleton width="100%" height={48} borderRadius={12} style={{ marginBottom: 12 }} />
          <Skeleton width="100%" height={48} borderRadius={12} />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Sin movimientos en este saldo</Text>
        <Text style={styles.emptySubtext}>Toca + para registrar una transacción en {activeBalance.name}</Text>
      </View>
    );
  };

  const bottomPadding = insets.bottom + 90;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Klaro"
        rightActionLabel="+"
        onRightAction={handleOpenAdd}
      />

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isPulling}
            onRefresh={handleRefresh}
            tintColor="#FFFFFF"
            colors={['#FFFFFF']}
          />
        }
      />

      {/* Modal formSheet de lista de saldos */}
      <Modal
        visible={isBalanceModalVisible}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setIsBalanceModalVisible(false)}
      >
        <BalanceListModal
          balances={balances}
          selectedBalanceId={activeBalance.id}
          onSelectBalance={handleSelectBalance}
          onClose={() => setIsBalanceModalVisible(false)}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  listContent: {
    paddingBottom: 110,
  },
  listHeader: {
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1C1C1E',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.6,
  },
  emptyContainer: {
    paddingHorizontal: 20,
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
