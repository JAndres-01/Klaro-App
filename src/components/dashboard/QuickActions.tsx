import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useHaptics } from '@/hooks/useHaptics';

interface QuickActionsProps {
  onNavigateSubscriptions: () => void;
  onNavigateGoals: () => void;
  onNavigateMetrics: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onNavigateSubscriptions,
  onNavigateGoals,
  onNavigateMetrics,
}) => {
  const { triggerSelection } = useHaptics();

  const handlePress = (callback: () => void) => {
    triggerSelection();
    callback();
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => handlePress(onNavigateSubscriptions)}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonText}>Suscripciones</Text>
      </Pressable>

      <Pressable
        onPress={() => handlePress(onNavigateGoals)}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonText}>Metas</Text>
      </Pressable>

      <Pressable
        onPress={() => handlePress(onNavigateMetrics)}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonText}>Métricas</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#000000',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#141414',
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: '#1C1C1E',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
});
