import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock as LockIcon, 
  Email as EmailIcon, 
  Visibility, 
  VisibilityOff,
  Close as CloseIcon
} from '@mui/icons-material';
import { 
  Box, 
  Typography, 
  Alert, 
  useTheme, 
  FormControlLabel, 
  Checkbox, 
  IconButton,
  InputAdornment,
  Skeleton,
  useMediaQuery,
  Button
} from '@mui/material';
import AuthLayout from '../components/auth/AuthLayout';
import FormInput from '../components/auth/FormInput';
import LoadingButton from '../components/auth/LoadingButton';
import api from '../config/api';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 10
    }
  }
};

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Check for redirect message
  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
    }
    
    // Simulate page load
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [location.state]);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    
    setLoading(true);
    setIsSubmitting(true);
    setMessage('');
    
    try {
      const response = await api.post('/api/auth/login', {
        email: data.email.trim().toLowerCase(),
        password: data.password,
        rememberMe: data.rememberMe
      });
      
      if (response.data.token) {
        // Store token based on rememberMe preference
        const storage = data.rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', response.data.token);
        
        // Store user data if available
        if (response.data.user) {
          storage.setItem('user', JSON.stringify(response.data.user));
        }
        
        // Store login timestamp
        storage.setItem('lastLogin', new Date().toISOString());
        
        // Redirect to dashboard with success state
        navigate('/dashboard', { 
          replace: true,
          state: { from: 'login' }
        });
        
        // Show success message on the dashboard
        // This will be handled by the Dashboard component
        return;
      }
    } catch (err) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please check your internet connection.';
      } else if (err.response) {
        errorMessage = err.response.data?.message || 'Invalid credentials';
      } else if (err.request) {
        errorMessage = 'Cannot connect to the server. Please try again.';
      }
      
      setMessage(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
      setTimeout(() => setIsSubmitting(false), 1000); // Prevent rapid submissions
    }
  };
  


  // Render loading skeleton while page is loading
  if (isPageLoading) {
    return (
      <AuthLayout>
        <Box sx={{ width: '100%' }}>
          <Skeleton variant="text" height={60} width="70%" sx={{ mb: 2 }} />
          <Skeleton variant="text" height={24} width="90%" sx={{ mb: 4 }} />
          <Skeleton variant="rounded" height={56} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={56} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={40} width="40%" sx={{ mb: 3 }} />
          <Skeleton variant="rounded" height={48} />
        </Box>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue to MedTrack"
      icon={LockIcon}
      sx={{
        '& .MuiTypography-h4': {
          fontSize: { xs: '1.75rem', sm: '2rem' },
          mb: { xs: 1, sm: 2 }
        },
        '& .MuiTypography-body1': {
          fontSize: { xs: '0.875rem', sm: '1rem' },
          mb: { xs: 3, sm: 4 }
        }
      }}
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ 
          width: '100%',
          padding: theme.spacing(0, { xs: 2, sm: 0 })
        }}
      >
        <motion.form 
          onSubmit={handleSubmit(onSubmit)}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ width: '100%' }}
        >
        <AnimatePresence>
          {message && (
            <motion.div
              key="message"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Alert 
                severity={message.includes('success') ? 'success' : 'error'}
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  boxShadow: theme.shadows[1],
                  '& .MuiAlert-message': {
                    width: '100%',
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  },
                  '& .MuiAlert-icon': {
                    alignItems: 'center'
                  }
                }}
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => setMessage('')}
                    sx={{
                      alignSelf: 'flex-start',
                      mt: { xs: 0.5, sm: 0 }
                    }}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
              >
                {message}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div variants={itemVariants}>
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
                  <EmailIcon 
                    color={errors.email ? 'error' : 'action'} 
                    sx={{ 
                      fontSize: { xs: '1.25rem', sm: '1.5rem' } 
                    }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                height: { xs: 48, sm: 56 },
                fontSize: { xs: '0.9375rem', sm: '1rem' },
                transition: 'all 0.3s ease-in-out',
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
              '& .MuiInputLabel-root': {
                fontSize: { xs: '0.9375rem', sm: '1rem' },
              },
              '& .MuiFormHelperText-root': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                mx: 0,
                mt: 0.5
              }
            }}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Please enter a valid email address'
              }
            })}
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <FormInput
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            error={!!errors.password}
            helperText={errors.password?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon 
                    color={errors.password ? 'error' : 'action'}
                    sx={{ 
                      fontSize: { xs: '1.25rem', sm: '1.5rem' } 
                    }}
                  />
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
              mb: 1,
              '& .MuiOutlinedInput-root': {
                height: { xs: 48, sm: 56 },
                fontSize: { xs: '0.9375rem', sm: '1rem' },
                transition: 'all 0.3s ease-in-out',
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
              '& .MuiInputLabel-root': {
                fontSize: { xs: '0.9375rem', sm: '1rem' },
              },
              '& .MuiFormHelperText-root': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                mx: 0,
                mt: 0.5
              }
            }}
            {...register('password', {
              required: 'Password is required'
            })}
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3,
            mt: -1
          }}>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  color="primary"
                  size="small"
                  sx={{
                    '&.Mui-checked': {
                      color: theme.palette.primary.main,
                    },
                  }}
                />
              }
              label={
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    userSelect: 'none',
                    fontSize: '0.875rem',
                    color: theme.palette.text.secondary,
                  }}
                >
                  Remember me
                </Typography>
              }
              sx={{ 
                m: 0,
                '&:hover .MuiCheckbox-root': {
                  color: theme.palette.primary.light,
                }
              }}
            />
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Typography 
                component={Link} 
                to="/forgot-password" 
                variant="body2" 
                sx={{ 
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  '&:hover': {
                    textDecoration: 'underline',
                    color: theme.palette.primary.dark,
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                Forgot password?
              </Typography>
            </motion.div>
          </Box>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          style={{
            width: '100%',
            marginTop: theme.spacing(2)
          }}
        >
          <LoadingButton
            type="submit"
            loading={loading}
            variant="contained"
            size="large"
            fullWidth
            sx={{
              py: { xs: 1.25, sm: 1.5 },
              borderRadius: 2,
              textTransform: 'none',
              fontSize: { xs: '0.9375rem', sm: '1rem' },
              fontWeight: 600,
              letterSpacing: '0.5px',
              height: { xs: 48, sm: 56 },
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: `0 4px 6px ${theme.palette.primary.light}40`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.dark} 100%)`,
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 8px ${theme.palette.primary.light}60`,
              },
              '&:active': {
                transform: 'translateY(0)',
                boxShadow: `0 2px 4px ${theme.palette.primary.light}40`,
              },
              '& .MuiCircularProgress-root': {
                color: 'white',
                width: '20px !important',
                height: '20px !important',
                margin: '0 8px'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </LoadingButton>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Box sx={{ 
            textAlign: 'center', 
            mt: 4,
            mb: 1,
            position: 'relative',
            '&:before, &:after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              width: '30%',
              height: '1px',
              backgroundColor: theme.palette.divider,
            },
            '&:before': {
              left: 0,
            },
            '&:after': {
              right: 0,
            }
          }}>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{
                display: 'inline-block',
                px: 2,
                backgroundColor: theme.palette.background.paper,
                position: 'relative',
                zIndex: 1,
              }}
            >
              OR
            </Typography>
          </Box>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          style={{
            width: '100%',
            marginTop: theme.spacing(2)
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            component={Link}
            to="/register"
            variant="outlined"
            size="large"
            fullWidth
            sx={{
              py: { xs: 1.25, sm: 1.5 },
              borderRadius: 2,
              textTransform: 'none',
              fontSize: { xs: '0.9375rem', sm: '1rem' },
              fontWeight: 600,
              letterSpacing: '0.5px',
              height: { xs: 48, sm: 56 },
              color: theme.palette.primary.main,
              borderColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: `${theme.palette.primary.light}10`,
                borderColor: theme.palette.primary.dark,
                color: theme.palette.primary.dark,
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            Create New Account
          </Button>
        </motion.div>
      </motion.form>
      </motion.div>
    </AuthLayout>
  );
};

export default Login;
