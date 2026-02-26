// c:\finalyearproject\career-roadmap-app\frontend\src\index.js
import "./bootstrap";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import App from "./App";
import "./index.css";

// Clear corrupted localStorage before any code can JSON.parse it
try {
  ["user", "token"].forEach((key) => {
    const v = localStorage.getItem(key);
    if (
      typeof v === "string" &&
      (v.includes("You need") ||
        v.includes("Sign in wi") ||
        v.trim().startsWith("<"))
    ) {
      localStorage.removeItem(key);
    }
  });
} catch (_) {}

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

/*
  🚀 StrictMode removed to prevent Firebase Google Auth
  getContext undefined error in development mode
*/
root.render(
  <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </Router>
);

// Register PWA service worker in production only
if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js").then(
      function (reg) {
        reg.update();
      },
      function () {}
    );
  });
}