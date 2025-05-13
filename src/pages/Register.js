import React, { useState } from "react";
import api from "../config/api";
import { useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  Stack
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

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
      await api.post("/api/auth/request-otp", { email: form.email });
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
      await api.post("/api/auth/register", form);
      setMessage("Registration successful! You can now log in.");
      setStep(1);
      setForm({ name: "", email: "", password: "", otp: "" });
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        background: "linear-gradient(135deg, #43cea2 0%, #185a9d 100%)",
      }}
    >
      <Card sx={{ maxWidth: 400, width: "100%", borderRadius: 3, boxShadow: 6 }}>
        <CardContent>
          <Stack alignItems="center" spacing={2}>
            <PersonAddIcon sx={{ fontSize: 48, color: "#185a9d" }} />
            <Typography variant="h5" fontWeight={700} color="#185a9d">
              Register for MedTrack
            </Typography>
            {message && <Alert severity={message.includes("success") ? "success" : "error"}>{message}</Alert>}
            {step === 1 ? (
              <Box component="form" onSubmit={handleRequestOtp} width="100%">
                <TextField
                  name="name"
                  label="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  fullWidth
                  margin="normal"
                />
                <TextField
                  name="email"
                  label="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  fullWidth
                  margin="normal"
                  autoComplete="email"
                />
                <TextField
                  name="password"
                  type="password"
                  label="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  fullWidth
                  margin="normal"
                  autoComplete="new-password"
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{
                    mt: 2,
                    background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "1.1rem",
                    boxShadow: 2,
                    borderRadius: 2,
                    textTransform: "none",
                    '&:hover': {
                      background: "linear-gradient(90deg, #185a9d 0%, #43cea2 100%)"
                    }
                  }}
                >
                  Send OTP
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleRegister} width="100%">
                <TextField
                  name="name"
                  label="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  fullWidth
                  margin="normal"
                />
                <TextField
                  name="email"
                  label="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  fullWidth
                  margin="normal"
                  autoComplete="email"
                />
                <TextField
                  name="password"
                  type="password"
                  label="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  fullWidth
                  margin="normal"
                  autoComplete="new-password"
                />
                <TextField
                  name="otp"
                  label="Enter OTP"
                  value={form.otp}
                  onChange={handleChange}
                  required
                  fullWidth
                  margin="normal"
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{
                    mt: 2,
                    background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "1.1rem",
                    boxShadow: 2,
                    borderRadius: 2,
                    textTransform: "none",
                    '&:hover': {
                      background: "linear-gradient(90deg, #185a9d 0%, #43cea2 100%)"
                    }
                  }}
                >
                  Register
                </Button>
              </Box>
            )}
            <Typography variant="body2" sx={{ textAlign: "center", mt: 2 }}>
              Already have an account? <Link to="/login" style={{ color: "#185a9d", textDecoration: "none", fontWeight: 500 }}>Login</Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
