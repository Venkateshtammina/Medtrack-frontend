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
import LockIcon from "@mui/icons-material/Lock";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid credentials");
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
            <LockIcon sx={{ fontSize: 48, color: "#185a9d" }} />
            <Typography variant="h5" fontWeight={700} color="#185a9d">
              Login to MedTrack
            </Typography>
            {message && <Alert severity="error">{message}</Alert>}
            <Box component="form" onSubmit={handleLogin} width="100%">
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                fullWidth
                margin="normal"
                autoComplete="email"
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                fullWidth
                margin="normal"
                autoComplete="current-password"
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
                Login
              </Button>
            </Box>
            <Box width="100%" display="flex" flexDirection="column" alignItems="center" gap={1} mt={2}>
              <Typography variant="body2">
                New user? <Link to="/register" style={{ color: "#185a9d", textDecoration: "none", fontWeight: 500 }}>Register</Link>
              </Typography>
              <Typography variant="body2">
                <Link to="/forgot-password" style={{ color: "#185a9d", textDecoration: "none", fontWeight: 500 }}>Forgot Password?</Link>
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
