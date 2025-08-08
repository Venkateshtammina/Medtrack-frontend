import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Alert, 
  useTheme, 
  IconButton, 
  InputAdornment,
  Button
} from '@mui/material';
import { VpnKey as VpnKeyIcon, Visibility, VisibilityOff, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import AuthLayout from '../components/auth/AuthLayout';
import FormInput from '../components/auth/FormInput';
import LoadingButton from '../components/auth/LoadingButton';
import api from '../config/api';

const ResetPassword = () => {
  const { token } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(location.state?.email || '');

  const { 
    register, 
    handleSubmit, 
    watch, 
    formState: { errors },
    setError,
    setValue
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: location.state?.email || '',
      password: '',
      confirmPassword: ''
    }
  });

  const password = watch('password', '');
  const confirmPassword = watch('confirmPassword', '');

  // If no token or email is found, redirect to forgot password
  useEffect(() => {
    if (!token) {
      navigate('/forgot-password');
    }
    
    // If email is in location state, set it in the form
    if (location.state?.email) {
      setEmail(location.state.email);
      setValue('email', location.state.email);
    }
  }, [token, location.state, navigate, setValue]);

  const handleSubmitReset = async (data) => {
    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match'
      });
      return;
    }

    if (data.password.length < 8) {
      setError('password', {
        type: 'manual',
        message: 'Password must be at least 8 characters long'
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/api/auth/reset-password', {
        token,
        email: data.email.toLowerCase().trim(),
        password: data.password
      });
      
      setMessage({ 
        type: 'success', 
        text: 'Your password has been reset successfully! Redirecting to login...' 
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to reset password';
      setMessage({ type: 'error', text: errorMessage });
      
      // If token is invalid or expired, redirect to forgot password
      if (err.response?.status === 400) {
        setTimeout(() => {
          navigate('/forgot-password');
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Create a new password for your account"
      icon={VpnKeyIcon}
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
        
        <form onSubmit={handleSubmit(handleSubmitReset)}>
          {/* Hidden email field - we'll show it but make it read-only */}
          <FormInput
            name="email"
            label="Email Address"
            type="email"
            autoComplete="email"
            value={email}
            disabled={!!email}
            fullWidth
            sx={{ mb: 3 }}
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
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            error={!!errors.password}
            helperText={errors.password?.message || 'Minimum 8 characters, include uppercase, lowercase, number, and special character'}
            startAdornment={
              <VpnKeyIcon color="action" />
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters'
              },
              validate: {
                hasUpperCase: value => /[A-Z]/.test(value) || 'Must contain at least one uppercase letter',
                hasLowerCase: value => /[a-z]/.test(value) || 'Must contain at least one lowercase letter',
                hasNumber: value => /[0-9]/.test(value) || 'Must contain at least one number',
                hasSpecialChar: value => /[!@#$%^&*(),.?":{}|<>]/.test(value) || 'Must contain at least one special character'
              }
            })}
            fullWidth
            sx={{ mb: 3 }}
          />

          <FormInput
            name="confirmPassword"
            label="Confirm New Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            startAdornment={
              <VpnKeyIcon color="action" />
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: value => value === password || 'Passwords do not match'
            })}
            fullWidth
            sx={{ mb: 4 }}
          />

          <LoadingButton
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            loading={loading}
            disabled={!token || !email}
            sx={{
              py: 1.5,
              fontSize: '1rem',
              textTransform: 'none',
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              '&:hover': {
                background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.dark} 100%)`,
                transform: 'translateY(-2px)'
              },
              '&.Mui-disabled': {
                background: theme.palette.action.disabledBackground,
                color: theme.palette.action.disabled,
                transform: 'none'
              }
            }}
          >
            Reset Password
          </LoadingButton>
        </form>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            component={Link}
            to="/login"
            color="primary"
            startIcon={<ArrowBackIcon />}
            sx={{ textTransform: 'none' }}
          >
            Back to Login
          </Button>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default ResetPassword;
