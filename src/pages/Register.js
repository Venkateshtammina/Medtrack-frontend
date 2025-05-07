import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", password: "", otp: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await axios.post("http://localhost:5000/api/auth/request-otp", { email: form.email });
      setMessage("OTP sent to your email.");
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send OTP.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await axios.post("http://localhost:5000/api/auth/register", form);
      setMessage("Registration successful! You can now log in.");
      setStep(1);
      setForm({ name: "", email: "", password: "", otp: "" });
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>📝 Register for MedTrack</h2>
        {message && <div style={styles.error}>{message}</div>}
        {step === 1 ? (
          <form onSubmit={handleRequestOtp}>
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <button type="submit" style={styles.button}>Send OTP</button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <input
              name="otp"
              placeholder="Enter OTP"
              value={form.otp}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <button type="submit" style={styles.button}>Register</button>
          </form>
        )}
        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          Already have an account? <Link to="/login" style={styles.link}>Login</Link>
        </p>
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

export default Register;
