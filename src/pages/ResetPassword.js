// 📁 client/src/pages/ResetPassword.js
import React, { useState } from "react";
import api from "../config/api";
import { useParams, useNavigate, Link } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await api.post(`/api/auth/reset-password/${token}`, { password });
      setMessage("Password reset successful! You can now log in.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Reset failed.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🔑 Reset Password</h2>
        {message && <div style={styles.error}>{message}</div>}
        <form onSubmit={handleReset}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Reset Password</button>
        </form>
        <div style={{ marginTop: "1rem" }}>
          <Link to="/login" style={styles.link}>Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #43cea2 0%, #185a9d 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    background: "#fff",
    padding: "2.5rem 2rem",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
  },
  title: {
    marginBottom: "1.5rem",
    color: "#185a9d",
    fontWeight: 700,
    fontSize: "2rem",
    letterSpacing: "1px",
  },
  input: {
    width: "100%",
    padding: "0.9rem",
    margin: "0.5rem 0",
    borderRadius: "8px",
    border: "1px solid #bdbdbd",
    fontSize: "1rem",
    outline: "none",
    transition: "border 0.2s",
  },
  button: {
    width: "100%",
    padding: "0.9rem",
    background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "1.1rem",
    marginTop: "1rem",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  error: {
    color: "#d32f2f",
    background: "#ffebee",
    borderRadius: "6px",
    padding: "0.7rem",
    marginBottom: "1rem",
  },
  link: {
    color: "#185a9d",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "1rem",
    transition: "color 0.2s",
  },
};

export default ResetPassword;
