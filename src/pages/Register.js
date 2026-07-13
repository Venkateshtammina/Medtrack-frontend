// 📁 frontend/src/pages/Register.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Person as PersonIcon, 
  Email as EmailIcon, 
  Lock as LockIcon, 
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { 
  Box, 
  Typography, 
  Alert, 
  useTheme, 
  Checkbox, 
  FormControlLabel, 
  Button, 
  Modal,
  IconButton,
  Divider
} from '@mui/material';
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
  
  // Modal toggle state for internal Terms viewing
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  
  const navigate = useNavigate();
  const theme = useTheme();

  const { 
    register, 
    handleSubmit, 
    watch, 
    formState: { errors }
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

  const handleSendOtp = async (data) => {
    if (!acceptedTerms) {
      setMessage({ type: 'error', text: 'You must review and accept the Terms of Service to create an account.' });
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const userData = {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        password: data.password
      };
      
      setFormData(userData);
      
      const response = await api.post('/api/auth/request-otp', {
        email: userData.email,
        name: userData.name
      });
      
      if (response.status === 200) {
        setOtpSent(true);
        setMessage({ 
          type: 'success', 
          text: 'Security verification code has been dispatched. Please check your email inbox.' 
        });
      }
    } catch (err) {
      console.error('OTP request error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to dispatch verification token.';
      setMessage({ type: 'error', text: errorMessage });
      setTimeout(() => setMessage({ type: '', text: '' }), 6000);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndRegister = async (data) => {
    if (!formData) {
      setMessage({ type: 'error', text: 'Session context timed out. Please clear parameters and retry.' });
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await api.post('/api/auth/register', {
        ...formData,
        otp: data.otp.trim()
      });
      
      if (response.status === 201) {
        setMessage({ type: 'success', text: 'Identity validated successfully! Initializing platform workspace routing...' });
        setFormData(null);
        
        setTimeout(() => {
          navigate('/login', { 
            state: { registrationSuccess: true, email: formData.email } 
          });
        }, 1800);
      }
    } catch (err) {
      console.error('Registration error:', err);
      let errorMessage = 'Security token validation failed.';
      if (err.response && err.response.status === 400) {
        errorMessage = err.response.data.message || 'Invalid or expired OTP sequence.';
      }
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (loading) return;
    handleSubmit(otpSent ? handleVerifyOtpAndRegister : handleSendOtp)(e);
  };

  const getStepContent = () => {
    if (otpSent) {
      return (
        <AnimatePresence mode="wait">
          <motion.div
            key="otp-view"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25 }}
            style={{ width: '100%' }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
              A 6-digit verification code has been securely routed to <strong>{formData?.email}</strong>. Enter the string code boundary below to complete identity provisioning.
            </Typography>
            
            <FormInput
              name="otp"
              label="Verification OTP Code"
              type="text"
              autoComplete="one-time-code"
              inputMode="numeric"
              error={!!errors.otp}
              helperText={errors.otp?.message}
              {...register('otp', {
                required: 'OTP code validation string required',
                pattern: { value: /^\d{6}$/, message: 'Must be a 6-digit numeric sequence' }
              })}
              fullWidth
              sx={{ mb: 4 }}
            />
            
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Button
                onClick={() => setOtpSent(false)}
                color="inherit"
                startIcon={<ArrowBackIcon />}
                sx={{ borderRadius: 2, fontWeight: 600 }}
              >
                Back
              </Button>
              <LoadingButton
                onClick={handleFormSubmit}
                variant="contained"
                color="primary"
                loading={loading}
                sx={{ borderRadius: 2.5, px: 3, fontWeight: 700 }}
              >
                Verify & Initialize
              </LoadingButton>
            </Box>
          </motion.div>
        </AnimatePresence>
      );
    }
    
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="register-fields"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          style={{ width: '100%' }}
        >
          <FormInput
            name="name"
            label="Account Operator Full Name"
            type="text"
            autoComplete="name"
            error={!!errors.name}
            helperText={errors.name?.message}
            startAdornment={<PersonIcon color="action" />}
            {...register('name', { required: 'Name parameter identification required' })}
          />
          
          <FormInput
            name="email"
            label="Corporate / Operator Email"
            type="email"
            autoComplete="email"
            error={!!errors.email}
            helperText={errors.email?.message}
            startAdornment={<EmailIcon color="action" />}
            {...register('email', {
              required: 'Email coordinates string required',
              pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid address syntax mapping' }
            })}
          />
          
          <FormInput
            name="password"
            label="Access Encryption Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            error={!!errors.password}
            helperText={errors.password?.message}
            showPasswordToggle
            onTogglePassword={() => setShowPassword(!showPassword)}
            startAdornment={<LockIcon color="action" />}
            {...register('password', {
              required: 'Password string criteria required',
              minLength: { value: 8, message: 'Minimum length 8 parameters required' },
              validate: (v) => {
                if (!/[A-Z]/.test(v)) return 'Requires uppercase baseline representation';
                if (!/[0-9]/.test(v)) return 'Requires absolute integer assignment value';
                if (!/[^A-Za-z0-9]/.test(v)) return 'Requires special validation symbol';
                return true;
              }
            })}
          />
          
          <FormInput
            name="confirmPassword"
            label="Re-type Password Verification"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            showPasswordToggle
            onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            startAdornment={<LockIcon color="action" />}
            {...register('confirmPassword', {
              required: 'Re-entry synchronization check parameter required',
              validate: v => v === password || 'Password string alignment mismatch'
            })}
          />
          
          <Box sx={{ mt: 1, mb: 3.5, display: 'flex', alignItems: 'center' }}>
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
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  I accept the mandatory system execution{' '}
                  <span 
                    onClick={(e) => {
                      e.preventDefault();
                      setTermsModalOpen(true);
                    }}
                    style={{ color: theme.palette.primary.main, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Terms of Service & Platform Policies
                  </span>
                </Typography>
              }
            />
          </Box>
          
          <LoadingButton
            onClick={handleFormSubmit}
            loading={loading}
            variant="contained"
            size="large"
            fullWidth
            sx={{
              py: 1.6,
              borderRadius: 3,
              fontWeight: 700,
              fontSize: '0.95rem',
              letterSpacing: '0.3px',
              boxShadow: '0 4px 12px rgba(0, 122, 255, 0.15)'
            }}
          >
            Create Operator Profile
          </LoadingButton>
          
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Already holding active credentials?{' '}
              <Link to="/login" style={{ color: theme.palette.primary.main, fontWeight: 700, textDecoration: 'none' }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <>
      <AuthLayout
        title={otpSent ? 'Security Verification' : 'Workspace Registration'}
        subtitle={otpSent ? 'Mailing sequence validation workflow pipeline active' : 'Provision secure medication control access layer credentials'}
        icon={otpSent ? EmailIcon : PersonIcon}
      >
        <Box sx={{ width: '100%', mt: 1 }}>
          {message.text && (
            <Alert 
              severity={message.type}
              sx={{ mb: 3, borderRadius: 2.5, fontWeight: 500, border: '1px solid', borderColor: message.type === 'error' ? 'error.light' : 'success.light' }}
            >
              {message.text}
            </Alert>
          )}
          
          {getStepContent()}
        </Box>
      </AuthLayout>

      {/* Embedded High-Fidelity Terms of Service Legal Workspace Modal */}
      <Modal
        open={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        aria-labelledby="terms-workspace-modal"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}
      >
        <Box sx={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '80vh',
          bgcolor: 'background.paper',
          borderRadius: 4,
          boxShadow: '0px 20px 50px rgba(0,0,0,0.15)',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          outline: 'none',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#FAFBFD' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <DescriptionIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                MedTrack Platform Terms of Service
              </Typography>
            </Box>
            <IconButton onClick={() => setTermsModalOpen(false)} size="small" sx={{ cursor: 'pointer' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Body content scroll region */}
          <Box sx={{ p: 3, overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
              Effective Revision Date Parameters: July 2026
            </Typography>
            
            <Box>
              <Typography variant="body2" fontWeight={700} color="text.primary" gutterBottom>
                1. System Operational Paradigm Scope
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6, display: 'block' }}>
                MedTrack provides a dedicated software interface layer designated exclusively for inventory cataloging, stock depletion tracing, and threshold alert automation. Operators recognize that the framework platform is an analytical record system framework tool and does not replace standardized operational asset controls.
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" fontWeight={700} color="text.primary" gutterBottom>
                2. Medical Safety & Clinical Disclaimers
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6, display: 'block' }}>
                <strong>CRITICAL NOTICE:</strong> MedTrack calculations, dashboard telemetry indicators, batch tracking monitors, and expiration email alert pathways are purely secondary automated reminders. Operators maintain definitive cross-reconciliation responsibilities for auditing physical storage items to prevent batch administration of expired or corrupted medication assets.
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" fontWeight={700} color="text.primary" gutterBottom>
                3. Access Integrity & Account Compliance
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6, display: 'block' }}>
                Account registration profiles require verified secure credential string mappings. The account user is explicitly responsible for preserving authentication token parameters and preventing unpermitted physical or digital workspace breaches. Sharing database access parameters externally violates core compliance frameworks.
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" fontWeight={700} color="text.primary" gutterBottom>
                4. Data Protection & Isolation Metrics
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6, display: 'block' }}>
                Inventory data structures are safely routed and managed via serverless cloud database clusters. MedTrack utilizes baseline network layers to insulate user storage profiles. Platform parameters comply with standard clinical system safety and transmission isolation boundaries.
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Footer Actions */}
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1.5, bgcolor: '#FAFBFD' }}>
            <Button 
              variant="outlined" 
              onClick={() => {
                setAcceptedTerms(false);
                setTermsModalOpen(false);
              }}
              sx={{ borderRadius: 2, px: 2.5, fontWeight: 600, cursor: 'pointer' }}
            >
              Decline
            </Button>
            <Button 
              variant="contained" 
              onClick={() => {
                setAcceptedTerms(true);
                setTermsModalOpen(false);
              }}
              sx={{ borderRadius: 2, px: 3, fontWeight: 700, cursor: 'pointer' }}
            >
              Accept & Agree
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default Register;