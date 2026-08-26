import { StateStorage } from 'zustand/middleware';
import { Capacitor } from '@capacitor/core';

// Bridge between Native Storage and Zustand/Standard Web Storage
export const secureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === 'undefined') return null;
    if (!Capacitor.isNativePlatform()) {
      return localStorage.getItem(name);
    }
    try {
      const { SecureStoragePlugin } = await import('capacitor-secure-storage-plugin');
      const { value } = await SecureStoragePlugin.get({ key: name });
      return value;
    } catch {
      return localStorage.getItem(name);
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    if (!Capacitor.isNativePlatform()) {
      localStorage.setItem(name, value);
      return;
    }
    try {
      const { SecureStoragePlugin } = await import('capacitor-secure-storage-plugin');
      await SecureStoragePlugin.set({ key: name, value });
    } catch {
      localStorage.setItem(name, value);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    if (!Capacitor.isNativePlatform()) {
      localStorage.removeItem(name);
      return;
    }
    try {
      const { SecureStoragePlugin } = await import('capacitor-secure-storage-plugin');
      await SecureStoragePlugin.remove({ key: name });
    } catch {
      localStorage.removeItem(name);
    }
  },
};
