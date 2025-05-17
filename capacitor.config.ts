
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.saarthi.app', // Replace with your actual app ID
  appName: 'Saarthi',       // Replace with your actual app name
  webDir: '.next/standalone',
  server: {
    androidScheme: 'https',
    // hostname: 'your-local-ip-or-hostname', // For live reload or pointing to a local dev server
    // Example for local development if your Next.js app runs on port 3000:
    // url: 'http://192.168.1.100:3000', // Use your actual local IP
    cleartext: true, // Allows HTTP traffic for local development if needed, use with caution
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0, // Optional: control splash screen behavior
    },
  },
};

export default config;
