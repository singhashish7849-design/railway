import {
  configure,
  checkPNRStatus,
  getTrainInfo,
  trackTrain,
  getTrainHistory,
} from 'railkit';
import { env } from '@/config/env';

const apiKey = env.RAILKIT_API_KEY;

if (apiKey) {
  try {
    configure(apiKey);
    console.log('[RailKit] SDK configured successfully.');
  } catch (err) {
    console.error('[RailKit] Failed to configure SDK:', err);
  }
} else {
  console.warn('[RailKit] SDK API key is missing from environment.');
}

export { checkPNRStatus, getTrainInfo, trackTrain, getTrainHistory };
