import React, { useState } from "react";
import { Mail, Lock, User, LogIn, UserPlus, AlertCircle } from "lucide-react";
import api from "../api";

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await api.login(email, password);
        onAuthSuccess();
      } else {
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long.");
        }
        await api.register(email, password, fullName);
        // Automatically login after successful registration
        await api.login(email, password);
        onAuthSuccess();
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setEmail("");
    setPassword("");
    setFullName("");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">EXSPEND</div>
          <p className="auth-subtitle">
            {isLogin
              ? "Sign in to track your expenses and budgets"
              : "Create an account to start managing expenses"}
          </p>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              "Loading..."
            ) : isLogin ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <LogIn size={18} /> Sign In
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <UserPlus size={18} /> Get Started
              </span>
            )}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? "New to Exspend? " : "Already have an account? "}
          <span className="auth-toggle-link" onClick={toggleMode}>
            {isLogin ? "Create an account" : "Sign in here"}
          </span>
        </div>
      </div>
    </div>
  );
}
