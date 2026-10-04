import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoalsScreenProps } from '@/navigation/types';
import { Header } from '@/components/common/Header';
import { BottomNavBar, NavTab } from '@/components/common/BottomNavBar';

export const GoalsScreen: React.FC<GoalsScreenProps> = ({ navigation }) => {
  const handleSelectTab = (tab: NavTab) => {
    if (tab === 'home') {
      navigation.navigate('Home');
    } else if (tab === 'subscriptions') {
      navigation.navigate('Subscriptions');
    } else if (tab === 'metrics') {
      navigation.navigate('Metrics');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Metas"
        subtitle="Progreso de ahorro fluido"
        rightActionLabel="← Volver"
        onRightAction={() => navigation.navigate('Home')}
      />
      <View style={styles.content}>
        <Text style={styles.placeholder}>Metas de ahorro y visualizador de fluido en Fase 5</Text>
      </View>
      <BottomNavBar
        activeTab="goals"
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
