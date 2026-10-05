import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { BottomNavBar, NavTab } from '@/components/common/BottomNavBar';
import { HomeScreen } from './HomeScreen';
import { SubscriptionsScreen } from './SubscriptionsScreen';
import { GoalsScreen } from './GoalsScreen';
import { MetricsScreen } from './MetricsScreen';

type MainScreenProps = NativeStackScreenProps<RootStackParamList, 'Main'>;

export const MainScreen: React.FC<MainScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  const handleOpenAdd = (balanceId?: string) => {
    navigation.navigate('AddTransaction', { balanceId });
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>
        <View style={[styles.tabContent, { display: activeTab === 'home' ? 'flex' : 'none' }]}>
          <HomeScreen onOpenAdd={handleOpenAdd} />
        </View>
        <View style={[styles.tabContent, { display: activeTab === 'subscriptions' ? 'flex' : 'none' }]}>
          <SubscriptionsScreen />
        </View>
        <View style={[styles.tabContent, { display: activeTab === 'goals' ? 'flex' : 'none' }]}>
          <GoalsScreen />
        </View>
        <View style={[styles.tabContent, { display: activeTab === 'metrics' ? 'flex' : 'none' }]}>
          <MetricsScreen />
        </View>
      </View>
      <BottomNavBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  screenContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
});
