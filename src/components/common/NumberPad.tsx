import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';

export interface NumberPadProps {
  onPressDigit: (digit: string) => void;
  onPressDecimal?: () => void;
  onPressDelete: () => void;
  onLongPressDelete?: () => void;
  disabled?: boolean;
}

interface PadKey {
  type: 'digit' | 'decimal' | 'delete' | 'empty';
  label?: string;
  value?: string;
}

const KEYS_LAYOUT: PadKey[][] = [
  [
    { type: 'digit', label: '1', value: '1' },
    { type: 'digit', label: '2', value: '2' },
    { type: 'digit', label: '3', value: '3' },
  ],
  [
    { type: 'digit', label: '4', value: '4' },
    { type: 'digit', label: '5', value: '5' },
    { type: 'digit', label: '6', value: '6' },
  ],
  [
    { type: 'digit', label: '7', value: '7' },
    { type: 'digit', label: '8', value: '8' },
    { type: 'digit', label: '9', value: '9' },
  ],
  [
    { type: 'decimal', label: '.', value: '.' },
    { type: 'digit', label: '0', value: '0' },
    { type: 'delete' },
  ],
];

export const NumberPad: React.FC<NumberPadProps> = ({
  onPressDigit,
  onPressDecimal,
  onPressDelete,
  onLongPressDelete,
  disabled = false,
}) => {
  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignorar en entornos sin soporte háptico
    }
  };

  const handleKeyTap = (key: PadKey) => {
    if (disabled) return;
    triggerHaptic();

    switch (key.type) {
      case 'digit':
        if (key.value) {
          onPressDigit(key.value);
        }
        break;
      case 'decimal':
        if (onPressDecimal) {
          onPressDecimal();
        } else if (key.value) {
          onPressDigit(key.value);
        }
        break;
      case 'delete':
        onPressDelete();
        break;
      case 'empty':
        break;
    }
  };

  const handleLongPress = (key: PadKey) => {
    if (disabled) return;
    if (key.type === 'delete' && onLongPressDelete) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        // Ignorar
      }
      onLongPressDelete();
    }
  };

  return (
    <View style={styles.container}>
      {KEYS_LAYOUT.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((key, keyIndex) => {
            const isDelete = key.type === 'delete';
            const isEmpty = key.type === 'empty';

            if (isEmpty) {
              return <View key={`key-${rowIndex}-${keyIndex}`} style={styles.keyContainer} />;
            }

            return (
              <Pressable
                key={`key-${rowIndex}-${keyIndex}`}
                onPress={() => handleKeyTap(key)}
                onLongPress={() => handleLongPress(key)}
                delayLongPress={400}
                disabled={disabled}
                style={({ pressed }) => [
                  styles.keyContainer,
                  pressed && !disabled && styles.keyPressed,
                ]}
                hitSlop={4}
              >
                {isDelete ? (
                  <Ionicons name="backspace-outline" size={24} color="#FFFFFF" />
                ) : (
                  <Text style={[styles.keyText, key.type === 'decimal' && styles.decimalText]}>
                    {key.label}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000000',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: 4,
  },
  keyContainer: {
    flex: 1,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  keyPressed: {
    opacity: 0.35,
  },
  keyText: {
    fontSize: 26,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  decimalText: {
    fontSize: 28,
    fontWeight: '600',
    marginTop: -4,
  },
});
