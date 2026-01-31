import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smartcalis.app',
  appName: 'SmartCalis',
  webDir: 'out',
  server: {
        url: 'http://192.168.1.183:3000',
        cleartext: true
  }
};

export default config;