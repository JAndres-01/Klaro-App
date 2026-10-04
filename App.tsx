import React from 'react';
import { StyleSheet, View, Text, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Skeleton } from '@/components/common/Skeleton';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.content}>
          <Text style={styles.title}>Klaro</Text>
          <Text style={styles.subtitle}>Fase 1: Capa de datos inicializada</Text>
          <View style={styles.skeletonContainer}>
            <Skeleton width="100%" height={24} borderRadius={12} />
            <Skeleton width="60%" height={16} borderRadius={8} style={{ marginTop: 12 }} />
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 6,
  },
  skeletonContainer: {
    marginTop: 32,
  },
});
