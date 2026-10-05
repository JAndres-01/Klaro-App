import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AddTransactionModalProps } from '@/navigation/types';
import { NumberPad } from '@/components/common/NumberPad';
import { useHaptics } from '@/hooks/useHaptics';
import { BalanceRepository, TransactionRepository, GoalRepository } from '@/services/db';
import { TransactionType, Balance } from '@/types';
import { formatCurrency } from '@/utils/currency';

const EXPENSE_CATEGORIES = [
  'Alimentación',
  'Transporte',
  'Servicios',
  'Compras',
  'Entretenimiento',
  'Salud',
  'Vivienda',
  'Otros',
];

const INCOME_CATEGORIES = [
  'Salario',
  'Rendimientos',
  'Transferencia',
  'Venta',
  'Otros',
];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  route,
  navigation,
}) => {
  const initialType: TransactionType = route.params?.initialType ?? 'expense';
  const initialBalanceId: string = route.params?.balanceId ?? 'main';

  const [type, setType] = useState<TransactionType>(initialType);
  const [amountStr, setAmountStr] = useState<string>('0');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]
  );
  const [note, setNote] = useState<string>('');
  const [selectedBalanceId, setSelectedBalanceId] = useState<string>(initialBalanceId);
  const [enableSpareChangeRounding, setEnableSpareChangeRounding] = useState<boolean>(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  const { triggerKeypadTap, triggerSuccess, triggerSelection } = useHaptics();

  const balances: Balance[] = useMemo(() => {
    try {
      return BalanceRepository.getAll();
    } catch {
      return [];
    }
  }, []);

  const goals: Balance[] = useMemo(() => {
    try {
      return GoalRepository.getAll().filter((g) => !g.isCompleted);
    } catch {
      return [];
    }
  }, []);

  const currentBalance = useMemo(() => {
    return balances.find((b) => b.id === selectedBalanceId) || balances[0] || {
      id: 'main',
      name: 'Cuenta Principal',
      amount: 0,
      currency: '$',
      accentColor: '#FFFFFF',
      type: 'main' as const,
      createdAt: Date.now(),
    };
  }, [balances, selectedBalanceId]);

  const numericAmount = useMemo(() => {
    const parsed = parseFloat(amountStr);
    return isNaN(parsed) ? 0 : parsed;
  }, [amountStr]);

  // Cálculo de redondeo al entero más cercano hacia arriba (ej. $14.30 -> redondeo $15.00, sobrante $0.70)
  const roundingData = useMemo(() => {
    if (type !== 'expense' || numericAmount <= 0) {
      return null;
    }
    const ceil = Math.ceil(numericAmount);
    const spare = Math.round((ceil - numericAmount) * 100) / 100;
    if (spare > 0 && spare < 1) {
      return {
        roundedAmount: ceil,
        spareChange: spare,
      };
    }
    return null;
  }, [type, numericAmount]);

  const handleTypeChange = (newType: TransactionType) => {
    if (type === newType) return;
    triggerSelection();
    setType(newType);
    setSelectedCategory(newType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
    if (newType === 'income') {
      setEnableSpareChangeRounding(false);
    }
  };

  const handlePressDigit = (digit: string) => {
    if (amountStr.length >= 10) return;

    if (amountStr === '0') {
      setAmountStr(digit);
      return;
    }

    if (amountStr.includes('.')) {
      const [, decimals] = amountStr.split('.');
      if (decimals && decimals.length >= 2) return;
    }

    setAmountStr((prev) => prev + digit);
  };

  const handlePressDecimal = () => {
    if (amountStr.includes('.')) return;
    setAmountStr((prev) => prev + '.');
  };

  const handlePressDelete = () => {
    if (amountStr.length <= 1) {
      setAmountStr('0');
      return;
    }
    setAmountStr((prev) => prev.slice(0, -1));
  };

  const handleLongPressDelete = () => {
    setAmountStr('0');
  };

  const handleCategorySelect = (category: string) => {
    triggerSelection();
    setSelectedCategory(category);
  };

  const handleBalanceSelect = (balanceId: string) => {
    triggerSelection();
    setSelectedBalanceId(balanceId);
  };

  const handleToggleRounding = () => {
    triggerSelection();
    setEnableSpareChangeRounding((prev) => {
      const nextState = !prev;
      if (nextState && !selectedGoalId && goals.length > 0) {
        setSelectedGoalId(goals[0].id);
      }
      return nextState;
    });
  };

  const handleSave = () => {
    if (numericAmount <= 0) return;

    const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    // Crear la transacción principal
    TransactionRepository.create({
      id: txId,
      amount: numericAmount,
      type,
      category: selectedCategory,
      note: note.trim() ? note.trim() : undefined,
      date: nowIso,
      balanceId: currentBalance.id,
    });

    // Lógica de redondeo / micro-ahorro hacia meta
    if (
      type === 'expense' &&
      enableSpareChangeRounding &&
      roundingData &&
      selectedGoalId
    ) {
      // Deducir el sobrante de la cuenta actual y abonarlo a la meta
      const spareTxId = `spare_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      TransactionRepository.create({
        id: spareTxId,
        amount: roundingData.spareChange,
        type: 'expense',
        category: 'Ahorro Redondeo',
        note: `Redondeo de gasto #${txId.slice(-4)} a meta`,
        date: nowIso,
        balanceId: currentBalance.id,
      });

      GoalRepository.addFunds(selectedGoalId, roundingData.spareChange);
    }

    triggerSuccess();
    navigation.goBack();
  };

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const isSaveDisabled = numericAmount <= 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Cabecera del modal */}
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
            hitSlop={8}
          >
            <Ionicons name="close" size={24} color="#8E8E93" />
          </Pressable>

          <Text style={styles.headerTitle}>
            {type === 'expense' ? 'Registrar Gasto' : 'Registrar Ingreso'}
          </Text>

          <Pressable
            onPress={handleSave}
            disabled={isSaveDisabled}
            style={({ pressed }) => [
              styles.headerButton,
              styles.saveButton,
              isSaveDisabled && styles.saveButtonDisabled,
              pressed && !isSaveDisabled && styles.pressed,
            ]}
            hitSlop={8}
          >
            <Text
              style={[
                styles.saveButtonText,
                isSaveDisabled && styles.saveButtonTextDisabled,
              ]}
            >
              Guardar
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Selector de Tipo (Gasto / Ingreso) */}
          <View style={styles.typeSelectorContainer}>
            <Pressable
              onPress={() => handleTypeChange('expense')}
              style={[
                styles.typeOption,
                type === 'expense' && styles.typeOptionActive,
              ]}
            >
              <Text
                style={[
                  styles.typeOptionText,
                  type === 'expense' && styles.typeOptionTextActive,
                ]}
              >
                Gasto
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleTypeChange('income')}
              style={[
                styles.typeOption,
                type === 'income' && styles.typeOptionActive,
              ]}
            >
              <Text
                style={[
                  styles.typeOptionText,
                  type === 'income' && styles.typeOptionTextActive,
                ]}
              >
                Ingreso
              </Text>
            </Pressable>
          </View>

          {/* Selector de Saldo / Cuenta destino */}
          {balances.length > 1 && (
            <View style={styles.balancesContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.balancesScroll}
              >
                {balances.map((b) => {
                  const isSelected = b.id === currentBalance.id;
                  return (
                    <Pressable
                      key={b.id}
                      onPress={() => handleBalanceSelect(b.id)}
                      style={[
                        styles.balanceChip,
                        isSelected && styles.balanceChipSelected,
                      ]}
                    >
                      <View
                        style={[
                          styles.balanceDot,
                          { backgroundColor: b.accentColor || '#FFFFFF' },
                        ]}
                      />
                      <Text
                        style={[
                          styles.balanceChipText,
                          isSelected && styles.balanceChipTextSelected,
                        ]}
                      >
                        {b.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Display Principal de Monto */}
          <View style={styles.amountDisplay}>
            <Text style={styles.currencySymbol}>{currentBalance.currency || '$'}</Text>
            <Text style={styles.amountValue}>
              {amountStr}
            </Text>
          </View>

          {/* Selector de Categorías (Lista plana horizontal) */}
          <View style={styles.categorySection}>
            <Text style={styles.sectionLabel}>Categoría</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {categories.map((cat) => {
                const isSelected = cat === selectedCategory;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => handleCategorySelect(cat)}
                    style={[
                      styles.categoryChip,
                      isSelected && styles.categoryChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected && styles.categoryChipTextSelected,
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Nota opcional */}
          <View style={styles.noteSection}>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Nota opcional..."
              placeholderTextColor="#636366"
              style={styles.noteInput}
              maxLength={60}
              returnKeyType="done"
            />
          </View>

          {/* Opción de Redondeo a Meta (Task 3.4) */}
          {type === 'expense' && roundingData && goals.length > 0 && (
            <View style={styles.roundingCard}>
              <Pressable
                onPress={handleToggleRounding}
                style={styles.roundingHeader}
              >
                <View style={styles.roundingInfo}>
                  <Text style={styles.roundingTitle}>
                    Redondear sobrante a {formatCurrency(roundingData.roundedAmount, { currencySymbol: currentBalance.currency })}
                  </Text>
                  <Text style={styles.roundingSubtitle}>
                    Abonar +{formatCurrency(roundingData.spareChange, { currencySymbol: currentBalance.currency })} a una meta
                  </Text>
                </View>
                <View
                  style={[
                    styles.checkbox,
                    enableSpareChangeRounding && styles.checkboxActive,
                  ]}
                >
                  {enableSpareChangeRounding && (
                    <Ionicons name="checkmark" size={14} color="#000000" />
                  )}
                </View>
              </Pressable>

              {enableSpareChangeRounding && (
                <View style={styles.goalsSelectorContainer}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.goalsScroll}
                  >
                    {goals.map((g) => {
                      const isGoalSelected = g.id === (selectedGoalId || goals[0].id);
                      return (
                        <Pressable
                          key={g.id}
                          onPress={() => {
                            triggerSelection();
                            setSelectedGoalId(g.id);
                          }}
                          style={[
                            styles.goalChip,
                            isGoalSelected && styles.goalChipSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.goalChipText,
                              isGoalSelected && styles.goalChipTextSelected,
                            ]}
                          >
                            🎯 {g.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Teclado numérico sobrio */}
        <View style={styles.padWrapper}>
          <NumberPad
            onPressDigit={handlePressDigit}
            onPressDecimal={handlePressDecimal}
            onPressDelete={handlePressDelete}
            onLongPressDelete={handleLongPressDelete}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1C1C1E',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  saveButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  saveButtonDisabled: {
    backgroundColor: '#1C1C1E',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  saveButtonTextDisabled: {
    color: '#636366',
  },
  pressed: {
    opacity: 0.6,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  typeSelectorContainer: {
    flexDirection: 'row',
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  typeOptionActive: {
    backgroundColor: '#2C2C2E',
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  typeOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  balancesContainer: {
    marginBottom: 12,
  },
  balancesScroll: {
    gap: 8,
  },
  balanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#1C1C1E',
  },
  balanceChipSelected: {
    backgroundColor: '#242426',
    borderColor: '#3A3A3C',
  },
  balanceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  balanceChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
  },
  balanceChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  amountDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginVertical: 14,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '500',
    color: '#8E8E93',
    marginRight: 4,
    marginTop: 6,
  },
  amountValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  categorySection: {
    marginVertical: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#636366',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  categoriesScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#1C1C1E',
  },
  categoryChipSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
  },
  categoryChipTextSelected: {
    color: '#000000',
    fontWeight: '600',
  },
  noteSection: {
    marginTop: 10,
    marginBottom: 8,
  },
  noteInput: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#1C1C1E',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#FFFFFF',
  },
  roundingCard: {
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#1C1C1E',
  },
  roundingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roundingInfo: {
    flex: 1,
    marginRight: 10,
  },
  roundingTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  roundingSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#636366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  goalsSelectorContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#1C1C1E',
  },
  goalsScroll: {
    gap: 8,
  },
  goalChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
  },
  goalChipSelected: {
    backgroundColor: '#2C2C2E',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  goalChipText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  goalChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  padWrapper: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#1C1C1E',
    paddingBottom: 4,
    backgroundColor: '#000000',
  },
});
