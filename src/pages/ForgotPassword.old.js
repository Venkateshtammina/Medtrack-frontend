import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Alert, 
  useTheme, 
  Button, 
  useMediaQuery,
  IconButton,
  InputAdornment,
  Fade,
  Close as CloseIcon
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Lock as LockIcon,
  ArrowBack as ArrowBackIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 24 
      }
    }
  };

  // Handle form submission based on current step
  const handleFormSubmit = (data) => {
    if (loading) return;
    return otpSent ? handleVerifyOtp(data) : handleRequestOtp(data);
  };

  return (
    <AuthLayout
      title={otpSent ? 'Reset Password' : 'Forgot Password'}
      subtitle={otpSent 
        ? 'Enter the OTP sent to your email and set a new password' 
        : 'Enter your email to receive a password reset OTP'}
      icon={otpSent ? LockIcon : EmailIcon}
      sx={{
        '& .MuiTypography-h4': {
          fontSize: { xs: '1.5rem', sm: '2rem' },
          mb: { xs: 1, sm: 2 }
        },
        '& .MuiTypography-body1': {
          fontSize: { xs: '0.875rem', sm: '1rem' },
          mb: { xs: 2, sm: 3 },
          textAlign: 'center',
          px: { xs: 1, sm: 0 }
        }
      }}
    >
      <Box sx={{ width: '100%' }}>
        {message.text && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ 
              width: '100%',
              maxWidth: 500,
              margin: '0 auto',
              padding: theme.spacing(0, { xs: 1, sm: 2 })
            }}
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

        <AnimatePresence mode="wait">
          <motion.form 
            key={otpSent ? 'otp-form' : 'email-form'}
            onSubmit={handleSubmit(handleFormSubmit)}
            style={{ width: '100%' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {!otpSent ? (
              <>
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color={errors.email ? 'error' : 'action'} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      height: { xs: 48, sm: 56 },
                      fontSize: { xs: '0.9375rem', sm: '1rem' },
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: '0.9375rem', sm: '1rem' },
                    },
                  }}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                />

                <LoadingButton
                  type="submit"
                  loading={loading}
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{
                    mt: 2,
                    py: { xs: 1.25, sm: 1.5 },
                    height: { xs: 48, sm: 56 },
                    fontSize: { xs: '0.9375rem', sm: '1rem' },
                    fontWeight: 600,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.dark} 100%)`,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Send OTP
                </LoadingButton>

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Button
                    component={Link}
                    to="/login"
                    color="inherit"
                    startIcon={<ArrowBackIcon />}
                    sx={{
                      textTransform: 'none',
                      fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                      '&:hover': {
                        color: theme.palette.primary.main,
                        backgroundColor: 'transparent'
                      }
                    }}
                  >
                    Back to Sign In
                  </Button>
                </Box>
              </>
            ) : (
              <>
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color={errors.otp ? 'error' : 'action'} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      height: { xs: 48, sm: 56 },
                      fontSize: { xs: '0.9375rem', sm: '1rem' },
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: '0.9375rem', sm: '1rem' },
                    },
                  }}
                  {...register('otp', {
                    required: 'OTP is required',
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'Please enter a valid 6-digit OTP'
                    }
                  })}
                />
                
                <FormInput
                  name="newPassword"
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  error={!!errors.newPassword}
                  helperText={errors.newPassword?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color={errors.newPassword ? 'error' : 'action'} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{
                            color: theme.palette.text.secondary,
                            p: { xs: 0.5, sm: 1 },
                            '&:hover': {
                              color: theme.palette.primary.main,
                              backgroundColor: 'transparent',
                            },
                          }}
                        >
                          {showPassword ? 
                            <VisibilityOff fontSize={isMobile ? 'small' : 'medium'} /> : 
                            <Visibility fontSize={isMobile ? 'small' : 'medium'} />
                          }
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      height: { xs: 48, sm: 56 },
                      fontSize: { xs: '0.9375rem', sm: '1rem' },
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: '0.9375rem', sm: '1rem' },
                    },
                  }}
                  {...register('newPassword', {
                    required: 'New password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters long',
                    },
                    validate: (value) => {
                      if (!/[A-Z]/.test(value)) return 'Must contain at least one uppercase letter';
                      if (!/[0-9]/.test(value)) return 'Must contain at least one number';
                      if (!/[^A-Za-z0-9]/.test(value)) return 'Must contain at least one special character';
                      return true;
                    },
                  })}
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
                    sx={{
                      py: { xs: 1.25, sm: 1.5 },
                      height: { xs: 48, sm: 56 },
                      fontSize: { xs: '0.9375rem', sm: '1rem' },
                    }}
                  >
                    Back
                  </Button>
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    color="primary"
                    loading={loading}
                    fullWidth
                    sx={{
                      py: { xs: 1.25, sm: 1.5 },
                      height: { xs: 48, sm: 56 },
                      fontSize: { xs: '0.9375rem', sm: '1rem' },
                      fontWeight: 600,
                      background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      '&:hover': {
                        background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.dark} 100%)`,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Reset Password
                  </LoadingButton>
                </Box>
              </>
            )}
          </motion.form>
        </AnimatePresence>
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
