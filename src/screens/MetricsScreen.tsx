import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/common/Header';

export const MetricsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Métricas"
        subtitle="Desglose semanal y mensual"
      />
      <View style={styles.content}>
        <Text style={styles.placeholder}>Métricas y análisis de flujo en Fase 6</Text>
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
    paddingBottom: 100,
  },
  placeholder: {
    fontSize: 15,
    color: '#8E8E93',
  },
});
