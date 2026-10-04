import React, { useEffect } from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';

interface SkeletonProps {
  width?: number | `${number}%` | 'auto';
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 900,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ['#1C1C1E', '#2C2C2E']
    );
    return {
      backgroundColor,
    };
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          borderCurve: 'continuous',
        },
        animatedStyle,
        style,
      ]}
    />
  );
};
