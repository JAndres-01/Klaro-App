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

  const handleOpenAdd = () => {
    navigation.navigate('AddTransaction');
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onOpenAdd={handleOpenAdd} />;
      case 'subscriptions':
        return <SubscriptionsScreen />;
      case 'goals':
        return <GoalsScreen />;
      case 'metrics':
        return <MetricsScreen />;
      default:
        return <HomeScreen onOpenAdd={handleOpenAdd} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>
        {renderActiveScreen()}
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
});
