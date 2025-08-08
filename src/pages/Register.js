import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Person as PersonIcon, Email as EmailIcon, Lock as LockIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Box, Typography, Alert, useTheme, Checkbox, FormControlLabel, Button } from '@mui/material';
import AuthLayout from '../components/auth/AuthLayout';
import FormInput from '../components/auth/FormInput';
import LoadingButton from '../components/auth/LoadingButton';
import api from '../config/api';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [formData, setFormData] = useState(null);
  
  const navigate = useNavigate();
  const theme = useTheme();

  const { 
    register, 
    handleSubmit, 
    watch, 
    formState: { errors },
    setError,
    getValues
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      otp: ''
    }
  });

  const password = watch('password', '');
  const email = watch('email', '');

  const handleSendOtp = async (data) => {
    if (!acceptedTerms) {
      setMessage({ type: 'error', text: 'Please accept the terms and conditions' });
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Basic client-side validation
      if (!data.name || !data.email || !data.password || !data.confirmPassword) {
        throw new Error('Please fill in all required fields');
      }
      
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      // Save form data for later use
      const userData = {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        password: data.password
      };
      
      setFormData(userData);
      
      // Request OTP
      const response = await api.post('/api/auth/request-otp', {
        email: userData.email,
        name: userData.name
      });
      
      if (response.status === 200) {
        setOtpSent(true);
        setMessage({ 
          type: 'success', 
          text: 'OTP has been sent to your email. Please check your inbox (including spam folder).' 
        });
      }
      
    } catch (err) {
      console.error('OTP request error:', err);
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Failed to send OTP. Please try again later.';
      setMessage({ 
        type: 'error', 
        text: errorMessage,
        details: err.response?.data?.details
      });
      
      // Auto-clear error message after 5 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndRegister = async (data) => {
    if (!formData) {
      setMessage({ 
        type: 'error', 
        text: 'Form data is missing. Please refresh the page and try again.' 
      });
      return;
    }
    
    // Basic OTP validation
    if (!data.otp || !/^\d{6}$/.test(data.otp)) {
      setMessage({ 
        type: 'error', 
        text: 'Please enter a valid 6-digit OTP' 
      });
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Complete registration with OTP
      const response = await api.post('/api/auth/register', {
        ...formData,
        otp: data.otp.trim()
      });
      
      if (response.status === 201) {
        setMessage({ 
          type: 'success', 
          text: 'Registration successful! Redirecting to login...' 
        });
        
        // Clear form data
        setFormData(null);
        
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              registrationSuccess: true,
              email: formData.email
            } 
          });
        }, 2000);
      }
      
    } catch (err) {
      console.error('Registration error:', err);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response) {
        // Handle specific error cases
        if (err.response.status === 400) {
          errorMessage = err.response.data.message || 'Invalid OTP or expired. Please request a new one.';
          // If OTP is invalid, allow user to request a new one
          if (err.response.data.field === 'otp') {
            setOtpSent(false);
          }
        } else if (err.response.status === 409) {
          errorMessage = 'An account with this email already exists. Please log in instead.';
        }
      } else if (err.request) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      }
      
      setMessage({ 
        type: 'error', 
        text: errorMessage,
        details: err.response?.data?.details
      });
      
      // Auto-clear error message after 5 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = () => {
    if (otpSent) {
      return (
        <Box 
          component="form" 
          onSubmit={handleSubmit(handleVerifyOtpAndRegister)} 
          width="100%"
        >
          <Typography variant="h6" gutterBottom>Verify Your Email</Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            We've sent a 6-digit OTP to {formData?.email}. Please enter it below to complete your registration.
          </Typography>
          
          <FormInput
            name="otp"
            label="Enter OTP"
            type="text"
            autoComplete="one-time-code"
            inputMode="numeric"
            pattern="\d*"
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
            sx={{ mb: 3 }}
          />
          
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button
              onClick={() => setOtpSent(false)}
              color="inherit"
              startIcon={<ArrowBackIcon />}
            >
              Back
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={loading}
            >
              Verify & Register
            </LoadingButton>
          </Box>
        </Box>
      );
    }
    
    return (
      <Box 
        component="form" 
        onSubmit={handleSubmit(handleSendOtp)} 
        width="100%"
      >
        <FormInput
          name="name"
          label="Full Name"
          type="text"
          autoComplete="name"
          error={!!errors.name}
          helperText={errors.name?.message}
          startAdornment={
            <PersonIcon color="action" />
          }
          {...register('name', {
            required: 'Name is required',
            minLength: {
              value: 2,
              message: 'Name must be at least 2 characters'
            }
          })}
        />
        
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
        
        <FormInput
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          error={!!errors.password}
          helperText={errors.password?.message}
          showPasswordToggle
          onTogglePassword={() => setShowPassword(!showPassword)}
          startAdornment={
            <LockIcon color="action" />
          }
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters'
            },
            validate: (value) => {
              if (!/[A-Z]/.test(value)) return 'Must contain at least one uppercase letter';
              if (!/[0-9]/.test(value)) return 'Must contain at least one number';
              if (!/[^A-Za-z0-9]/.test(value)) return 'Must contain at least one special character';
              return true;
            }
          })}
        />
        
        <FormInput
          name="confirmPassword"
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          autoComplete="new-password"
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          showPasswordToggle
          onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
          startAdornment={
            <LockIcon color="action" />
          }
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: value => 
              value === password || 'Passwords do not match'
          })}
        />
        
        <Box sx={{ mt: 2, mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                color="primary"
                size="small"
              />
            }
            label={
              <Typography variant="body2">
                I agree to the{' '}
                <Link 
                  to="/terms" 
                  style={{ 
                    color: theme.palette.primary.main,
                    textDecoration: 'none'
                  }}
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link 
                  to="/privacy" 
                  style={{ 
                    color: theme.palette.primary.main,
                    textDecoration: 'none'
                  }}
                >
                  Privacy Policy
                </Link>
              </Typography>
            }
          />
        </Box>
        
        <LoadingButton
          type="submit"
          loading={loading}
          variant="contained"
          size="large"
          fullWidth
          sx={{
            py: 1.5,
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            '&:hover': {
              background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.dark} 100%)`,
              transform: 'translateY(-2px)'
            }
          }}
        >
          Create Account
        </LoadingButton>
        
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link 
              to="/login" 
              style={{ 
                color: theme.palette.primary.main,
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Sign in
            </Link>
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <AuthLayout
      title="Create an Account"
      subtitle="Join MedTrack to manage your medications"
      icon={PersonIcon}
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
        
        {getStepContent()}
      </Box>
    </AuthLayout>
  );
};

export default Register;
