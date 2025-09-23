import { startEmailProcessor } from './email-automation';

// Initialize background services when the app starts
export function initializeBackgroundServices(): void {
  console.log('🚀 Initializing background services...');
  
  // Start email processor
  startEmailProcessor();
  
  console.log('✅ Background services initialized');
}

// Auto-start when this module is imported
if (typeof window === 'undefined') {
  // Only run on server side
  initializeBackgroundServices();
}
