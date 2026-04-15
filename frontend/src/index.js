// c:\finalyearproject\career-roadmap-app\frontend\src\index.js
import "./bootstrap";
import setupGlobalErrorHandler from "./utils/globalErrorHandler";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import App from "./App";
import "./index.css";

// Setup global error handler immediately (before any JSON.parse can throw)
setupGlobalErrorHandler();

// Clear corrupted localStorage before any code can JSON.parse it
import { clearCorruptedLocalStorage } from './utils/safeJsonParser';

// 🚀 Comprehensive localStorage cleanup using safeJsonParser
try {
  const cleared = clearCorruptedLocalStorage();
  if (cleared > 0) {
    console.log(`Cleaned up ${cleared} corrupted records.`);
  }
} catch (e) {}

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));

function renderApp() {
  root.render(
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Router>
  );
}

// Defer Firebase init until DOM is ready to avoid gapi getContext/parent errors
if (document.readyState === "complete" || document.readyState === "interactive") {
  renderApp();
} else {
  document.addEventListener("DOMContentLoaded", renderApp);
}

// Service worker removed to prevent 404 script caching issues