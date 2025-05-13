import React, { useState } from "react";
import api from "../config/api";
import { Link } from "react-router-dom";
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
import EmailIcon from "@mui/icons-material/Email";
import VpnKeyIcon from "@mui/icons-material/VpnKey";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/auth/forgot-password", { email });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/auth/reset-password-with-otp", { email, otp, newPassword });
      setMessage(res.data.message);
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong.");
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
            {step === 1 ? <EmailIcon sx={{ fontSize: 48, color: "#185a9d" }} /> : <VpnKeyIcon sx={{ fontSize: 48, color: "#185a9d" }} />}
            <Typography variant="h5" fontWeight={700} color="#185a9d">
              Forgot Password
            </Typography>
            {message && <Alert severity={message.includes("success") ? "success" : "error"}>{message}</Alert>}
            {step === 1 ? (
              <Box component="form" onSubmit={handleRequestOtp} width="100%">
                <TextField
                  type="email"
                  label="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  margin="normal"
                  autoComplete="email"
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
              <Box component="form" onSubmit={handleResetPassword} width="100%">
                <TextField
                  type="text"
                  label="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  fullWidth
                  margin="normal"
                />
                <TextField
                  type="password"
                  label="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                  Reset Password
                </Button>
              </Box>
            )}
            <Typography variant="body2" sx={{ textAlign: "center", mt: 2 }}>
              <Link to="/login" style={{ color: "#185a9d", textDecoration: "none", fontWeight: 500 }}>Back to Login</Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPassword;
