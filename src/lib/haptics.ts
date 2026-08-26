import { Capacitor } from '@capacitor/core';

export const haptics = {
  impact: async (style: 'LIGHT' | 'MEDIUM' | 'HEAVY' = 'LIGHT') => {
    if (Capacitor.isNativePlatform()) {
      try {
        const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
        const map = {
          LIGHT: ImpactStyle.Light,
          MEDIUM: ImpactStyle.Medium,
          HEAVY: ImpactStyle.Heavy,
        };
        await Haptics.impact({ style: map[style] || ImpactStyle.Light });
      } catch {
        // Fallback
      }
    }
  },
  notification: async (type: 'SUCCESS' | 'WARNING' | 'ERROR' = 'SUCCESS') => {
    if (Capacitor.isNativePlatform()) {
      try {
        const { Haptics, NotificationType } = await import('@capacitor/haptics');
        const map = {
          SUCCESS: NotificationType.Success,
          WARNING: NotificationType.Warning,
          ERROR: NotificationType.Error,
        };
        await Haptics.notification({ type: map[type] || NotificationType.Success });
      } catch {
        // Fallback
      }
    }
  },
  vibrate: async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const { Haptics } = await import('@capacitor/haptics');
        await Haptics.vibrate();
      } catch {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }
    } else if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  },
  selectionStart: async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const { Haptics } = await import('@capacitor/haptics');
        await Haptics.selectionStart();
      } catch {}
    }
  },
  selectionChanged: async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const { Haptics } = await import('@capacitor/haptics');
        await Haptics.selectionChanged();
      } catch {}
    }
  },
  selectionEnd: async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const { Haptics } = await import('@capacitor/haptics');
        await Haptics.selectionEnd();
      } catch {}
    }
  },
};
