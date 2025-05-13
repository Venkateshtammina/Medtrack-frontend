// 📁 client/src/pages/ResetPassword.js
import React, { useState } from "react";
import api from "../config/api";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import VpnKeyIcon from "@mui/icons-material/VpnKey";

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
            <VpnKeyIcon sx={{ fontSize: 48, color: "#185a9d" }} />
            <Typography variant="h5" fontWeight={700} color="#185a9d">
              Reset Password
            </Typography>
            {message && <Alert severity={message.includes("success") ? "success" : "error"}>{message}</Alert>}
            <Box component="form" onSubmit={handleReset} width="100%">
              <TextField
                type="password"
                label="New Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
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
            <Typography variant="body2" sx={{ textAlign: "center", mt: 2 }}>
              <Link to="/login" style={{ color: "#185a9d", textDecoration: "none", fontWeight: 500 }}>Back to Login</Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResetPassword;
