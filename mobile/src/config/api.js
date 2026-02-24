/**
 * API base URL - use your machine IP for physical device, or localhost/10.0.2.2 for emulators
 * Android emulator: use 10.0.2.2 for localhost
 * iOS simulator: use localhost or 127.0.0.1
 */
import { Platform } from 'react-native';

const getBaseURL = () => {
  if (__DEV__) {
    return Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
  }
  return 'https://your-production-api.com/api';
};

export const API_BASE_URL = getBaseURL();
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');
