import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.society.management',
  appName: 'Society Manager',
  webDir: 'public',
  
  server: {
    url: 'https://society-maintenance-manager.vercel.app',
    cleartext: false,
  },

  android: {
    allowMixedContent: false,
    backgroundColor: '#0f172a',
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f172a',
      showSpinner: true,
      spinnerColor: '#6366f1',
      androidSpinnerStyle: 'large',
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
