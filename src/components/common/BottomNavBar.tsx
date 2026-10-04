import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHaptics } from '@/hooks/useHaptics';

export type NavTab = 'home' | 'subscriptions' | 'goals' | 'metrics';

interface BottomNavBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

interface TabConfig {
  key: NavTab;
  label: string;
}

const TABS: TabConfig[] = [
  { key: 'home', label: 'Inicio' },
  { key: 'subscriptions', label: 'Suscrip.' },
  { key: 'goals', label: 'Metas' },
  { key: 'metrics', label: 'Métricas' },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const insets = useSafeAreaInsets();
  const { triggerSelection } = useHaptics();

  const handlePress = (tab: NavTab) => {
    if (tab !== activeTab) {
      triggerSelection();
      onSelectTab(tab);
    }
  };

  const bottomOffset = insets.bottom > 0 ? insets.bottom + 6 : 20;

  return (
    <View style={[styles.outerContainer, { bottom: bottomOffset }]}>
      <View style={styles.floatingBar}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <Pressable
              key={tab.key}
              onPress={() => handlePress(tab.key)}
              style={({ pressed }) => [
                styles.tabButton,
                isActive && styles.activeTabButton,
                pressed && styles.pressed,
              ]}
              hitSlop={4}
            >
              <Text
                style={[
                  styles.tabLabel,
                  isActive ? styles.activeTabLabel : styles.inactiveTabLabel,
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 100,
  },
  floatingBar: {
    width: '100%',
    maxWidth: 380,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#141414',
    borderRadius: 30,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: '#242426',
    paddingVertical: 6,
    paddingHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.65,
    shadowRadius: 18,
    elevation: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    borderCurve: 'continuous',
    marginHorizontal: 2,
  },
  activeTabButton: {
    backgroundColor: '#242426',
  },
  pressed: {
    opacity: 0.7,
  },
  tabLabel: {
    fontSize: 13,
    letterSpacing: -0.2,
  },
  activeTabLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  inactiveTabLabel: {
    color: '#8E8E93',
    fontWeight: '500',
  },
});
