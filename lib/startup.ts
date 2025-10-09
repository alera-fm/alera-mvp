import { startEmailProcessor } from "./email-automation";
import { startAudioScanProcessor } from "./audio-scan-processor";

// Initialize background services when the app starts
export function initializeBackgroundServices(): void {
  console.log("🚀 Initializing background services...");

  // Only start email processor in production
  if (process.env.NODE_ENV === "production") {
    startEmailProcessor();
    console.log("📧 Email processor started (production mode)");
  } else {
    console.log("📧 Email processor disabled (development mode)");
  }

  // Start audio scan processor (runs in all environments)
  startAudioScanProcessor();

  console.log("✅ Background services initialized");
}

// Auto-start when this module is imported
if (typeof window === "undefined") {
  // Only run on server side
  initializeBackgroundServices();
}
