import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoalsScreenProps } from '@/navigation/types';
import { Header } from '@/components/common/Header';

export const GoalsScreen: React.FC<GoalsScreenProps> = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Metas" subtitle="Progreso de ahorro fluido" />
      <View style={styles.content}>
        <Text style={styles.placeholder}>Metas de ahorro y visualizador de fluido en Fase 5</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    fontSize: 15,
    color: '#8E8E93',
  },
});
