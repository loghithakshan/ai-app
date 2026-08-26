import { Dialog } from '@capacitor/dialog';
import { Capacitor } from '@capacitor/core';

export const dialogs = {
  alert: async (title: string, message: string) => {
    if (Capacitor.isNativePlatform()) {
      await Dialog.alert({ title, message });
    } else {
      alert(`${title}: ${message}`);
    }
  },
  confirm: async (title: string, message: string): Promise<boolean> => {
    if (Capacitor.isNativePlatform()) {
      const { value } = await Dialog.confirm({ title, message });
      return value;
    } else {
      return confirm(`${title}\n\n${message}`);
    }
  },
  prompt: async (title: string, message: string): Promise<string | null> => {
    if (Capacitor.isNativePlatform()) {
      const { value, cancelled } = await Dialog.prompt({ title, message });
      return cancelled ? null : value;
    } else {
      return prompt(`${title}\n\n${message}`);
    }
  },
};
