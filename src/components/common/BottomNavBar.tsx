import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useHaptics } from '@/hooks/useHaptics';

export type NavTab = 'home' | 'subscriptions' | 'goals' | 'metrics';

interface BottomNavBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

interface TabItemConfig {
  key: NavTab;
  iconName: keyof typeof Ionicons.glyphMap;
  activeIconName: keyof typeof Ionicons.glyphMap;
}

const TABS: TabItemConfig[] = [
  {
    key: 'home',
    iconName: 'wallet-outline',
    activeIconName: 'wallet',
  },
  {
    key: 'subscriptions',
    iconName: 'repeat-outline',
    activeIconName: 'repeat',
  },
  {
    key: 'goals',
    iconName: 'flag-outline',
    activeIconName: 'flag',
  },
  {
    key: 'metrics',
    iconName: 'stats-chart-outline',
    activeIconName: 'stats-chart',
  },
];

const SPRING_CONFIG = {
  damping: 18,
  stiffness: 160,
  mass: 0.8,
};

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const insets = useSafeAreaInsets();
  const { triggerSelection } = useHaptics();
  const [barWidth, setBarWidth] = useState<number>(0);

  const activeIndex = TABS.findIndex((tab) => tab.key === activeTab);
  const indicatorPosition = useSharedValue<number>(0);

  const HORIZONTAL_PADDING = 6;
  const numTabs = TABS.length;
  const tabWidth = barWidth > 0 ? (barWidth - HORIZONTAL_PADDING * 2) / numTabs : 0;

  useEffect(() => {
    if (tabWidth > 0 && activeIndex >= 0) {
      const targetX = HORIZONTAL_PADDING + activeIndex * tabWidth;
      indicatorPosition.value = withSpring(targetX, SPRING_CONFIG);
    }
  }, [activeIndex, tabWidth, indicatorPosition]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorPosition.value }],
      width: tabWidth > 0 ? tabWidth : 0,
    };
  });

  const handleBarLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0 && width !== barWidth) {
      setBarWidth(width);
      const initialTabWidth = (width - HORIZONTAL_PADDING * 2) / numTabs;
      indicatorPosition.value = HORIZONTAL_PADDING + (activeIndex >= 0 ? activeIndex : 0) * initialTabWidth;
    }
  };

  const handlePress = (tab: NavTab) => {
    if (tab !== activeTab) {
      triggerSelection();
      onSelectTab(tab);
    }
  };

  const bottomOffset = insets.bottom > 0 ? insets.bottom + 6 : 20;

  return (
    <View style={[styles.outerContainer, { bottom: bottomOffset }]} pointerEvents="box-none">
      <View style={styles.floatingBar} onLayout={handleBarLayout}>
        {tabWidth > 0 && (
          <Animated.View style={[styles.slidingIndicator, animatedIndicatorStyle]} />
        )}

        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <Pressable
              key={tab.key}
              onPress={() => handlePress(tab.key)}
              style={({ pressed }) => [
                styles.tabButton,
                pressed && styles.pressed,
              ]}
              hitSlop={6}
            >
              <Ionicons
                name={isActive ? tab.activeIconName : tab.iconName}
                size={22}
                color={isActive ? '#FFFFFF' : '#8E8E93'}
              />
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
    left: 24,
    right: 24,
    alignItems: 'center',
    zIndex: 100,
  },
  floatingBar: {
    width: '100%',
    maxWidth: 360,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#141414',
    borderRadius: 28,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: '#242426',
    paddingHorizontal: 6,
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.65,
    shadowRadius: 18,
    elevation: 12,
  },
  slidingIndicator: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    backgroundColor: '#242426',
    borderRadius: 22,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  tabButton: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    borderCurve: 'continuous',
    zIndex: 2,
  },
  pressed: {
    opacity: 0.7,
  },
});
