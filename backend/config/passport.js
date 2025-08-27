// passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
    callbackURL: "/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    // Here you would typically:
    // 1. Check if user exists in your database
    // 2. Create new user if they don't exist
    // 3. Return user object
    return cb(null, profile);
  }
));

// Serialize user for the session
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

// Deserialize user from the session
passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

module.exports = passport;
