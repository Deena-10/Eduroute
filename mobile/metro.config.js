const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 * Dev server runs on port 9000 (see npm start script).
 */
const config = {
  server: {
    port: 9000,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
