import './env.js';
import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Validate that actual non-placeholder credentials exist
const isConfigured = Boolean(
  cloudName &&
  apiKey &&
  apiSecret &&
  cloudName !== 'your_cloud_name_here' &&
  apiKey !== '123456789012345' &&
  apiSecret !== 'your_cloudinary_api_secret_here'
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
  console.log(`✔ Cloudinary SDK configured for cloud: ${cloudName}`);
} else {
  // Graceful offline notice without throwing errors during offline development
  console.info('ℹ Cloudinary: Credentials not configured or using placeholders. Cloudinary uploads disabled; local assets active.');
}

/**
 * Helper to check Cloudinary operational readiness before attempting API calls.
 */
export function isCloudinaryConfigured() {
  return isConfigured;
}

export { cloudinary };
export default cloudinary;
