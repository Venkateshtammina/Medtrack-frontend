import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Alert, useTheme, Button } from '@mui/material';
import { Email as EmailIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import AuthLayout from '../components/auth/AuthLayout';
import FormInput from '../components/auth/FormInput';
import LoadingButton from '../components/auth/LoadingButton';
import api from '../config/api';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    watch
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
      otp: '',
      newPassword: ''
    }
  });

  const handleRequestOtp = async (data) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await api.post('/api/auth/forgot-password', { 
        email: data.email.toLowerCase().trim() 
      });
      
      setResetEmail(data.email.toLowerCase().trim());
      setOtpSent(true);
      setMessage({ 
        type: 'success', 
        text: 'A 6-digit OTP has been sent to your email. Please enter it below.' 
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send OTP';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyOtp = async (data) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // First, verify OTP and reset password in one step
      const response = await api.post('/api/auth/reset-password-with-otp', {
        email: resetEmail,
        otp: data.otp,
        newPassword: data.newPassword
      });
      
      // If successful, show success message and redirect to login
      setMessage({ 
        type: 'success', 
        text: 'Password reset successful! Redirecting to login...' 
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            passwordResetSuccess: true,
            email: resetEmail
          } 
        });
      }, 2000);
    } catch (err) {
      console.error('Password reset error:', err);
      const errorMessage = err.response?.data?.message || 'Invalid OTP or error resetting password. Please try again.';
      setMessage({ 
        type: 'error', 
        text: errorMessage,
        details: err.response?.data?.details
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email to reset your password"
      icon={EmailIcon}
    >
      <Box sx={{ width: '100%' }}>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Alert 
              severity={message.type}
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                '& .MuiAlert-message': {
                  width: '100%'
                }
              }}
            >
              {message.text}
            </Alert>
          </motion.div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSubmit(handleRequestOtp)}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Enter your email address and we'll send you a one-time password (OTP) to reset your password.
            </Typography>
            
            <FormInput
              name="email"
              label="Email Address"
              type="email"
              autoComplete="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              startAdornment={
                <EmailIcon color="action" />
              }
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />
            
            <Box sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                loading={loading}
              >
                Send OTP
              </LoadingButton>
            </Box>
          </form>
        ) : (
          <form onSubmit={handleSubmit(handleVerifyOtp)}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              We've sent a 6-digit OTP to {resetEmail}. Please enter it below to continue.
            </Typography>
            
            <FormInput
              name="otp"
              label="Enter OTP"
              type="text"
              inputMode="numeric"
              pattern="\d*"
              autoComplete="one-time-code"
              error={!!errors.otp}
              helperText={errors.otp?.message}
              {...register('otp', {
                required: 'OTP is required',
                pattern: {
                  value: /^\d{6}$/,
                  message: 'Please enter a valid 6-digit OTP'
                }
              })}
              fullWidth
              sx={{ mb: 2 }}
            />
            
            <FormInput
              name="newPassword"
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
              showPasswordToggle
              onTogglePassword={() => setShowPassword(!showPassword)}
              {...register('newPassword', {
                required: 'New password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters long'
                }
              })}
              fullWidth
              sx={{ mb: 3, mt: 2 }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  setOtpSent(false);
                  setMessage({ type: '', text: '' });
                }}
                disabled={loading}
                fullWidth
              >
                Back
              </Button>
              <LoadingButton
                type="submit"
                variant="contained"
                color="primary"
                loading={loading}
                fullWidth
              >
                Verify OTP
              </LoadingButton>
            </Box>
          </form>
        )}
        
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Link 
            to="/login" 
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              color: theme.palette.primary.main,
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Back to Login
          </Link>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default ForgotPassword;
