import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.neurobloom.app',
  appName: 'NeuroBloom',
  webDir: 'public',
  server: {
    androidScheme: 'https'
  }
};

export default config;
