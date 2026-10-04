import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SubscriptionsScreenProps } from '@/navigation/types';
import { Header } from '@/components/common/Header';
import { BottomNavBar, NavTab } from '@/components/common/BottomNavBar';

export const SubscriptionsScreen: React.FC<SubscriptionsScreenProps> = ({ navigation }) => {
  const handleSelectTab = (tab: NavTab) => {
    if (tab === 'home') {
      navigation.navigate('Home');
    } else if (tab === 'goals') {
      navigation.navigate('Goals');
    } else if (tab === 'metrics') {
      navigation.navigate('Metrics');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Suscripciones"
        subtitle="Control de cobros recurrentes"
        rightActionLabel="← Volver"
        onRightAction={() => navigation.navigate('Home')}
      />
      <View style={styles.content}>
        <Text style={styles.placeholder}>Listado y detector de fugas en Fase 4</Text>
      </View>
      <BottomNavBar
        activeTab="subscriptions"
        onSelectTab={handleSelectTab}
      />
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
