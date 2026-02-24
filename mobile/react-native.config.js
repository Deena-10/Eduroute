/**
 * React Native CLI configuration
 * Ensures run-android uses Metro on port 9000 (must run: npm start first)
 */
module.exports = {
  project: {
    android: {
      sourceDir: './android',
    },
  },
  server: {
    port: 9000,
  },
};
