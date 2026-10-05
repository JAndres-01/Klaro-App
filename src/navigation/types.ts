import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Main: undefined;
  AddTransaction: { initialType?: 'expense' | 'income'; balanceId?: string } | undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type MainScreenProps = NativeStackScreenProps<RootStackParamList, 'Main'>;
export type AddTransactionModalProps = NativeStackScreenProps<RootStackParamList, 'AddTransaction'>;
