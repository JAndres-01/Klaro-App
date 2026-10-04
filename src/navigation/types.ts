import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  AddTransaction: { initialType?: 'expense' | 'income' } | undefined;
  Metrics: undefined;
  Subscriptions: undefined;
  Goals: undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type AddTransactionModalProps = NativeStackScreenProps<RootStackParamList, 'AddTransaction'>;
export type MetricsScreenProps = NativeStackScreenProps<RootStackParamList, 'Metrics'>;
export type SubscriptionsScreenProps = NativeStackScreenProps<RootStackParamList, 'Subscriptions'>;
export type GoalsScreenProps = NativeStackScreenProps<RootStackParamList, 'Goals'>;
