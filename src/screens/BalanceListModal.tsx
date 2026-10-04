import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Balance } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { useHaptics } from '@/hooks/useHaptics';

interface BalanceListModalProps {
  balances: Balance[];
  selectedBalanceId: string;
  onSelectBalance: (balanceId: string) => void;
  onClose: () => void;
}

export const BalanceListModal: React.FC<BalanceListModalProps> = ({
  balances,
  selectedBalanceId,
  onSelectBalance,
  onClose,
}) => {
  const { triggerSelection } = useHaptics();

  const handleSelect = (id: string) => {
    triggerSelection();
    onSelectBalance(id);
    onClose();
  };

  const renderItem = ({ item }: { item: Balance }) => {
    const isSelected = item.id === selectedBalanceId;
    const isGoal = item.type === 'goal';

    return (
      <Pressable
        onPress={() => handleSelect(item.id)}
        style={({ pressed }) => [
          styles.itemContainer,
          pressed && styles.itemPressed,
        ]}
      >
        <View style={styles.itemLeft}>
          <View
            style={[
              styles.colorIndicator,
              { backgroundColor: item.accentColor || '#FFFFFF' },
            ]}
          />
          <View style={styles.itemDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              {isGoal && (
                <View style={styles.goalTag}>
                  <Text style={styles.goalTagText}>Meta</Text>
                </View>
              )}
            </View>
            <Text style={styles.itemType}>
              {isGoal ? 'Meta de ahorro' : 'Saldo principal'}
            </Text>
          </View>
        </View>

        <View style={styles.itemRight}>
          <Text style={styles.itemAmount}>
            {formatCurrency(item.amount, { currencySymbol: item.currency || '$' })}
          </Text>
          {isSelected && (
            <Ionicons
              name="checkmark-circle"
              size={18}
              color="#FFFFFF"
              style={styles.checkIcon}
            />
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.handleBar} />
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Tus Saldos</Text>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
            hitSlop={8}
          >
            <Ionicons name="close" size={22} color="#8E8E93" />
          </Pressable>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={balances}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1C1C1E',
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2C2C2E',
    marginBottom: 14,
  },
  headerTitleRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  closeBtn: {
    padding: 4,
  },
  pressed: {
    opacity: 0.6,
  },
  listContent: {
    paddingVertical: 12,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#0D0D0D',
  },
  itemPressed: {
    backgroundColor: '#141414',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 14,
  },
  itemDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  goalTag: {
    marginLeft: 6,
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderCurve: 'continuous',
  },
  goalTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8E8E93',
    textTransform: 'uppercase',
  },
  itemType: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  checkIcon: {
    marginLeft: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#1C1C1E',
    marginLeft: 46,
  },
});
