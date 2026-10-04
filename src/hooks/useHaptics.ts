import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';

export function useHaptics() {
  const triggerKeypadTap = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore if haptics is not available on platform/simulator
    }
  }, []);

  const triggerSuccess = useCallback(async () => {
    try {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
    } catch {
      // Ignore
    }
  }, []);

  const triggerSelection = useCallback(async () => {
    try {
      await Haptics.selectionAsync();
    } catch {
      // Ignore
    }
  }, []);

  return {
    triggerKeypadTap,
    triggerSuccess,
    triggerSelection,
  };
}
