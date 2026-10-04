import React, { useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolateColor,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { Balance } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { useHaptics } from '@/hooks/useHaptics';

interface BalanceCarouselProps {
  balances: Balance[];
  activeBalanceIndex: number;
  onBalanceChange: (index: number) => void;
  onOpenBalanceList: () => void;
  safeToSpendDaily?: number;
}

// Convert hex color to rgba with opacity
function hexToRgba(hex: string, opacity: number): string {
  const cleanHex = hex.replace('#', '');
  let r = 255;
  let g = 255;
  let b = 255;
  if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  } else if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export const BalanceCarousel: React.FC<BalanceCarouselProps> = ({
  balances,
  activeBalanceIndex,
  onBalanceChange,
  onOpenBalanceList,
  safeToSpendDaily = 0,
}) => {
  const { width } = useWindowDimensions();
  const scrollX = useSharedValue(0);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const { triggerSelection } = useHaptics();

  const safeBalances = balances.length > 0 ? balances : [
    {
      id: 'main',
      name: 'Cuenta Principal',
      amount: 0,
      currency: '$',
      accentColor: '#FFFFFF',
      type: 'main' as const,
      createdAt: Date.now(),
    },
  ];

  // Scroll to active index programmatically if changed from outside
  useEffect(() => {
    if (scrollRef.current && activeBalanceIndex >= 0) {
      scrollRef.current.scrollTo({
        x: activeBalanceIndex * width,
        animated: true,
      });
    }
  }, [activeBalanceIndex, width]);

  const handlePageSettled = useCallback(
    (pageIndex: number) => {
      if (pageIndex >= 0 && pageIndex < safeBalances.length && pageIndex !== activeBalanceIndex) {
        triggerSelection();
        onBalanceChange(pageIndex);
      }
    },
    [safeBalances.length, activeBalanceIndex, onBalanceChange, triggerSelection]
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onMomentumEnd: (event) => {
      const pageIndex = Math.round(event.contentOffset.x / width);
      runOnJS(handlePageSettled)(pageIndex);
    },
  });

  // Background color interpolation
  const inputRange = safeBalances.map((_, i) => i * width);
  if (inputRange.length === 1) {
    inputRange.push(width);
  }

  const outputColors = safeBalances.map((b) =>
    hexToRgba(b.accentColor || '#FFFFFF', 0.14)
  );
  if (outputColors.length === 1) {
    outputColors.push(outputColors[0]);
  }

  const animatedBackdropStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollX.value,
      inputRange,
      outputColors
    );
    return {
      backgroundColor,
    };
  });

  return (
    <View style={styles.container}>
      {/* Dynamic ambient backdrop behind the active balance */}
      <Animated.View style={[styles.ambientBackdrop, animatedBackdropStyle]} pointerEvents="none" />

      {/* Horizontal Carousel */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        decelerationRate="fast"
        bounces={safeBalances.length > 1}
        style={styles.scrollView}
      >
        {safeBalances.map((balance, index) => {
          const isGoal = balance.type === 'goal';
          const isPositive = balance.amount >= 0;

          return (
            <View key={balance.id} style={[styles.pageItem, { width }]}>
              <View style={styles.headerRow}>
                <View
                  style={[
                    styles.accentDot,
                    { backgroundColor: balance.accentColor || '#FFFFFF' },
                  ]}
                />
                <Text style={styles.balanceName} numberOfLines={1}>
                  {balance.name}
                </Text>
                {isGoal && (
                  <View style={styles.goalTag}>
                    <Text style={styles.goalTagText}>Meta</Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.balanceAmount,
                  !isPositive && styles.negativeAmount,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {formatCurrency(balance.amount, { currencySymbol: balance.currency || '$' })}
              </Text>

              {isGoal && balance.targetAmount ? (
                <View style={styles.metaInfoRow}>
                  <Text style={styles.metaInfoLabel}>Objetivo:</Text>
                  <Text style={styles.metaInfoValue}>
                    {formatCurrency(balance.targetAmount, { currencySymbol: balance.currency || '$' })}
                  </Text>
                  <Text style={styles.metaPercent}>
                    ({Math.min(100, Math.round((balance.amount / balance.targetAmount) * 100))}%)
                  </Text>
                </View>
              ) : (
                <View style={styles.safeToSpendBadge}>
                  <Text style={styles.safeToSpendLabel}>Safe to Spend:</Text>
                  <Text style={styles.safeToSpendValue}>
                    {formatCurrency(safeToSpendDaily, { showDecimals: false })}/día
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </Animated.ScrollView>

      {/* Pagination Pill with dots */}
      <Pressable
        onPress={() => {
          triggerSelection();
          onOpenBalanceList();
        }}
        style={({ pressed }) => [styles.pillContainer, pressed && styles.pillPressed]}
        hitSlop={8}
      >
        <View style={styles.pillContent}>
          {safeBalances.map((_, dotIndex) => {
            const dotInputRange = [
              (dotIndex - 1) * width,
              dotIndex * width,
              (dotIndex + 1) * width,
            ];

            const animatedDotStyle = useAnimatedStyle(() => {
              const dotWidth = interpolate(
                scrollX.value,
                dotInputRange,
                [6, 18, 6],
                Extrapolation.CLAMP
              );
              const opacity = interpolate(
                scrollX.value,
                dotInputRange,
                [0.35, 1, 0.35],
                Extrapolation.CLAMP
              );
              return {
                width: dotWidth,
                opacity,
              };
            });

            return (
              <Animated.View
                key={dotIndex}
                style={[
                  styles.dot,
                  animatedDotStyle,
                ]}
              />
            );
          })}
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
    paddingBottom: 16,
  },
  ambientBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  scrollView: {
    flexGrow: 0,
  },
  pageItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  accentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  balanceName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  goalTag: {
    marginLeft: 8,
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderCurve: 'continuous',
  },
  goalTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  balanceAmount: {
    fontSize: 52,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1.6,
    marginVertical: 4,
    textAlign: 'center',
  },
  negativeAmount: {
    color: '#FF453A',
  },
  safeToSpendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141414',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: '#1C1C1E',
    marginTop: 6,
  },
  safeToSpendLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginRight: 6,
    fontWeight: '400',
  },
  safeToSpendValue: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  metaInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141414',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: '#1C1C1E',
    marginTop: 6,
  },
  metaInfoLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginRight: 4,
  },
  metaInfoValue: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 4,
  },
  metaPercent: {
    fontSize: 12,
    color: '#30D158',
    fontWeight: '600',
  },
  pillContainer: {
    alignSelf: 'center',
    marginTop: 10,
  },
  pillPressed: {
    opacity: 0.6,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141414',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: '#242426',
    gap: 5,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
});
