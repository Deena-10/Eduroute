# EduRoute AI – React Native Mobile App

This is the React Native conversion of the Career Roadmap web app. It keeps the same functionality: Firebase Auth (email + Google OAuth), Axios API calls to your backend and AI service, and all main screens.

## Project structure

```
mobile/
├── app.json
├── package.json
├── babel.config.js
├── metro.config.js
├── index.js                 # Entry point
└── src/
    ├── App.jsx              # Root: GestureHandler + AuthProvider + Navigator
    ├── config/
    │   └── api.js           # API_BASE_URL, API_ORIGIN (for fetch)
    ├── storage/
    │   └── asyncStorage.js  # AsyncStorage wrapper (replaces localStorage)
    ├── context/
    │   └── AuthContext.jsx  # Auth state, login/signup/logout, uses AsyncStorage
    ├── api/
    │   ├── axiosInstance.js # Axios with AsyncStorage token + 401 handling
    │   └── auth.js         # signup, login, getUserProfile
    ├── firebase.js          # Firebase config (Google OAuth via native module)
    ├── navigation/
    │   ├── RootNavigator.jsx # Auth vs Main (tabs) + loading
    │   ├── AuthStack.jsx     # Home, Login, Signup
    │   └── MainTabs.jsx      # Tabs: Home, Roadmap, AI, More, Profile (+ More stack)
    ├── screens/
    │   ├── Home.jsx
    │   ├── Login.jsx
    │   ├── Signup.jsx
    │   ├── Questionnaire.jsx # AI Chat
    │   ├── Roadmap.jsx
    │   ├── Profile.jsx
    │   ├── DailyTasks.jsx
    │   ├── ProgressTracker.jsx
    │   ├── Resources.jsx
    │   ├── Jobs.jsx
    │   └── MoreScreen.jsx    # Links to Daily Tasks, Progress, Resources, Jobs
    ├── components/
    │   ├── FormattedMessage.jsx  # Renders AI message (lists, headers, bold)
    │   ├── AnimatedCard.jsx       # Sample Reanimated usage
    │   └── UI/
    │       ├── Button.jsx
    │       ├── Card.jsx
    │       └── TextField.jsx
    └── styles/
        └── theme.js          # colors, spacing, borderRadius
```

## Using AsyncStorage for persistent data

The app uses `@react-native-async-storage/async-storage` instead of `localStorage`. All access goes through the wrapper in `src/storage/asyncStorage.js`.

### Reading and writing

```javascript
import storage from '../storage/asyncStorage';

// Save (async)
await storage.setItem('token', token);
await storage.setItem('user', JSON.stringify(user));

// Read (async)
const token = await storage.getItem(storage.keys.TOKEN);
const userJson = await storage.getItem(storage.keys.USER);
const user = userJson ? JSON.parse(userJson) : null;

// Remove
await storage.removeItem(storage.keys.TOKEN);

// Clear all
await storage.clear();
```

### Stored keys

- `storage.keys.USER` – logged-in user object (JSON).
- `storage.keys.TOKEN` – auth token for API.

Use the same `storage` import in any screen or context that needs to read/write auth or other persistent data.

## Running the app

1. Install dependencies (postinstall will apply a Metro middleware fix):
   ```bash
   cd mobile && npm install
   ```
   If `npm start` fails with `Cannot read properties of undefined (reading 'handle')`, apply the fix manually: in `node_modules/@react-native/community-cli-plugin/dist/commands/start/runServer.js`, change the `unstable_extraMiddleware` array to add `.filter(Boolean)` after the closing `],` (so undefined middleware is skipped).

2. Start Metro (runs on port 9000):
   ```bash
   npm start
   ```

3. Run on a device/simulator (in a **second terminal**):
   - Android: `npm run android` (requires Android Studio + emulator or USB device). The app is configured to use Metro on port 9000.
   - iOS: `npm run ios` (Mac only; use `localhost:5000` for simulator).

4. Point the app at your backend by editing `src/config/api.js` (e.g. replace `localhost` / `10.0.2.2` with your server IP when using a physical device).

## Backend and AI service

- API base URL is set in `src/config/api.js`. No backend or AI logic is rewritten; the app uses the same endpoints as the web app (e.g. `/api/auth/login`, `/api/ai/chat`, `/api/chat`).
- Ensure the Node backend and Python AI service are running as in your existing setup.

## Authentication

- **Email:** Login and signup use your existing backend (`/api/auth/login`, `/api/auth/signup`). Tokens and user are stored via AsyncStorage.
- **Google OAuth:** The web flow used `signInWithRedirect` and `getRedirectResult`. On React Native you should use a native Google Sign-In library (e.g. `@react-native-google-signin/google-signin`), get the `idToken`, and POST it to your backend `/api/auth/google-signin`. The current `googleSignIn()` in `AuthContext` is a stub that returns a message to use the native module.

## Animations

- `react-native-reanimated` is installed and configured in `babel.config.js`.
- See `src/components/AnimatedCard.jsx` for a sample: entrance animation (opacity, scale, translateY) and an optional `FadeInOutBadge` loop. Use the same patterns for list items or screen content.

## Navigation

- **Not logged in:** `AuthStack` – Home, Login, Signup.
- **Logged in:** `MainTabs` – Home, Roadmap, AI (Questionnaire), More, Profile. Under “More”, a stack gives: Daily Tasks, Progress Tracker, Resources, Jobs.

All pages (Dashboard/Home, Roadmap, Daily Tasks, Progress Tracker, Resources, Jobs/Internships, Profile, AI Chat) are implemented and wired; backend and AI logic are unchanged.
