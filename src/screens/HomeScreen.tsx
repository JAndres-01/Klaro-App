import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeScreenProps } from '@/navigation/types';
import { Header } from '@/components/common/Header';
import { BalanceDisplay, TransactionRow, QuickActions } from '@/components/dashboard';
import { Skeleton } from '@/components/common/Skeleton';
import { useTransactions } from '@/hooks/useTransactions';
import { useHaptics } from '@/hooks/useHaptics';
import { Transaction } from '@/types';

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { transactions, balanceSummary, isLoading, refresh } = useTransactions();
  const { triggerKeypadTap, triggerSelection } = useHaptics();
  const [isPulling, setIsPulling] = useState(false);

  const handleOpenAdd = () => {
    triggerKeypadTap();
    navigation.navigate('AddTransaction');
  };

  const handleRefresh = () => {
    setIsPulling(true);
    triggerSelection();
    refresh();
    // Gesto de pull down activa navegación a agregar si es intencional o refresca
    setTimeout(() => {
      setIsPulling(false);
    }, 400);
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <BalanceDisplay summary={balanceSummary} isLoading={isLoading} />
      <QuickActions
        onNavigateSubscriptions={() => navigation.navigate('Subscriptions')}
        onNavigateGoals={() => navigation.navigate('Goals')}
        onNavigateMetrics={() => navigation.navigate('Metrics')}
      />
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Transacciones</Text>
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
        <Text style={styles.emptyText}>Sin movimientos recientes</Text>
        <Text style={styles.emptySubtext}>Desliza hacia abajo o toca + para registrar</Text>
      </View>
    );
  };

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
        contentContainerStyle={styles.listContent}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  listContent: {
    paddingBottom: 40,
  },
  listHeader: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1C1C1E',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  },
});
