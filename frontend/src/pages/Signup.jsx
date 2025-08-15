import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// ✅ Message Alert Component
const MessageAlert = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => onClose(), 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "8px",
        marginBottom: "24px",
        backgroundColor: type === "success" ? "#d1fae5" : "#fee2e2",
        color: type === "success" ? "#065f46" : "#991b1b",
        border: `1px solid ${type === "success" ? "#a7f3d0" : "#fecaca"}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontWeight: "500",
      }}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "18px",
          color: "inherit",
        }}
      >
        ✕
      </button>
    </div>
  );
};

const Signup = () => {
  const { googleSignIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
    setMessage("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Full Name is required.";
    if (!form.email.trim()) newErrors.email = "Email address is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Please enter a valid email address.";
    if (!form.password) newErrors.password = "Password is required.";
    else if (form.password.length < 8)
      newErrors.password = "Password must be at least 8 characters long.";
    if (!form.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setMessageType("error");
      setMessage("Please fix the errors in the form.");
      return;
    }

    setIsLoading(true);
    try {
      // 🎯 THE FIX: Changed from "/signup" to "/auth/signup"
      const res = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      let result;
      try {
        result = await res.json();
      } catch {
        const text = await res.text();
        result = { success: false, error: text || "Invalid server response" };
      }

      if (res.ok && result.success) {
        setMessageType("success");
        setMessage("Account created successfully! Redirecting...");
        setTimeout(() => navigate("/questionnaire"), 2000);
      } else {
        setMessageType("error");
        setMessage(result.error || "Signup failed. Please try again.");
      }
    } catch (err) {
      setMessageType("error");
      setMessage(err.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      const result = await googleSignIn();
      if (result.success) {
        setMessageType("success");
        setMessage("Google sign-up successful! Redirecting...");
        setTimeout(() => navigate("/questionnaire"), 2000);
      } else {
        setMessageType("error");
        setMessage(result.error || "Google sign-in failed.");
      }
    } catch (error) {
      setMessageType("error");
      setMessage("Google sign-in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          background: "#fff",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "24px",
            color: "#1e293b",
          }}
        >
          Create Account
        </h2>

        <MessageAlert
          message={message}
          type={messageType}
          onClose={() => setMessage("")}
        />

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            style={inputStyle(errors.name)}
          />
          {errors.name && <span style={errorStyle}>{errors.name}</span>}

          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            style={inputStyle(errors.email)}
          />
          {errors.email && <span style={errorStyle}>{errors.email}</span>}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            style={inputStyle(errors.password)}
          />
          {errors.password && <span style={errorStyle}>{errors.password}</span>}

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={handleChange}
            style={inputStyle(errors.confirmPassword)}
          />
          {errors.confirmPassword && (
            <span style={errorStyle}>{errors.confirmPassword}</span>
          )}

          <button type="submit" disabled={isLoading} style={buttonStyle(isLoading)}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div
          style={{ textAlign: "center", margin: "24px 0", color: "#64748b" }}
        >
          or
        </div>

        <button
          onClick={handleGoogleSignup}
          disabled={isLoading}
          style={googleButtonStyle(isLoading)}
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
};

// ✨ Styles
const inputStyle = (error) => ({
  padding: "12px 16px",
  borderRadius: "8px",
  border: `1px solid ${error ? "#ef4444" : "#cbd5e1"}`,
  outline: "none",
  fontSize: "16px",
  transition: "border 0.2s",
  width: "100%",
});

const errorStyle = {
  color: "#ef4444",
  fontSize: "14px",
};

const buttonStyle = (disabled) => ({
  padding: "12px 16px",
  borderRadius: "8px",
  backgroundColor: disabled ? "#93c5fd" : "#3b82f6",
  color: "#fff",
  border: "none",
  cursor: disabled ? "not-allowed" : "pointer",
  fontSize: "16px",
  fontWeight: "bold",
  transition: "background 0.2s",
});

const googleButtonStyle = (disabled) => ({
  ...buttonStyle(disabled),
  backgroundColor: "#fff",
  color: "#3b82f6",
  border: "2px solid #3b82f6",
});

export default Signup;
