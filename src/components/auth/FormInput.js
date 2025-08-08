import React, { useState, forwardRef } from 'react';
import { 
  TextField, 
  InputAdornment, 
  IconButton, 
  FormHelperText, 
  Box, 
  Typography 
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const FormInput = forwardRef(({
  label,
  type = 'text',
  value,
  onChange,
  error,
  helperText,
  fullWidth = true,
  required = false,
  autoComplete,
  startIcon,
  endIcon,
  showPasswordToggle = false,
  onBlur,
  validate,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
    
    if (validate) {
      const validation = validate(e.target.value);
      setIsValid(validation.isValid);
      if (!validation.isValid) {
        setValidationError(validation.message);
      } else {
        setValidationError('');
      }
    }
  };

  const handleBlur = (e) => {
    setIsTouched(true);
    if (onBlur) onBlur(e);
    
    if (validate) {
      const validation = validate(value);
      setIsValid(validation.isValid);
      if (!validation.isValid) {
        setValidationError(validation.message);
      } else {
        setValidationError('');
      }
    }
  };

  const hasError = (isTouched || value) && (!isValid || error);
  const showSuccess = isTouched && isValid && value && !error;
  const currentHelperText = validationError || helperText || ' ';
  const inputType = showPasswordToggle && type === 'password' && showPassword ? 'text' : type;

  return (
    <Box sx={{ mb: 2, position: 'relative' }}>
      <TextField
        label={label}
        type={inputType}
        value={value}
        onChange={handleChange}
        onFocus={() => {}}
        onBlur={handleBlur}
        error={hasError}
        fullWidth={fullWidth}
        required={required}
        autoComplete={autoComplete}
        variant="outlined"
        margin="normal"
        ref={ref}
        InputProps={{
          startAdornment: startIcon && (
            <InputAdornment position="start">
              {startIcon}
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {showPasswordToggle && type === 'password' && (
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  size="large"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              )}
              {showSuccess && (
                <CheckCircle color="success" sx={{ opacity: 0.7 }} />
              )}
              {endIcon}
            </InputAdornment>
          ),
          sx: {
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 2,
            },
          },
        }}
        {...props}
      />
      
      <AnimatePresence>
        {(hasError || currentHelperText) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <FormHelperText 
              error={hasError}
              sx={{
                display: 'flex',
                alignItems: 'center',
                mt: 0.5,
                ml: 1.5,
                fontSize: '0.75rem',
              }}
            >
              {hasError && <ErrorIcon fontSize="small" sx={{ mr: 0.5 }} />}
              {currentHelperText}
            </FormHelperText>
          </motion.div>
        )}
      </AnimatePresence>
      
      {type === 'password' && (
        <Box sx={{ mt: 0.5, px: 1.5 }}>
          <PasswordStrengthMeter password={value} />
        </Box>
      )}
    </Box>
  );
});

const PasswordStrengthMeter = ({ password = '' }) => {
  if (!password) return null;
  
  const getStrength = (pwd) => {
    let score = 0;
    
    // Length check
    if (pwd.length > 0) score += 1;
    if (pwd.length >= 8) score += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(pwd)) score += 1; // Uppercase
    if (/[0-9]/.test(pwd)) score += 1; // Numbers
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1; // Special chars
    
    return Math.min(score, 5); // Cap at 5 for the progress bar
  };
  
  const strength = getStrength(password);
  const strengthPercent = (strength / 5) * 100;
  const strengthLabel = 
    strength <= 1 ? 'Very Weak' :
    strength <= 2 ? 'Weak' :
    strength <= 3 ? 'Moderate' :
    strength <= 4 ? 'Strong' : 'Very Strong';
  
  const getColor = () => {
    if (strength <= 1) return 'error.main';
    if (strength <= 2) return 'warning.main';
    if (strength <= 3) return 'info.main';
    return 'success.main';
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          Password strength: {strengthLabel}
        </Typography>
      </Box>
      <Box 
        sx={{
          height: 4,
          width: '100%',
          backgroundColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${strengthPercent}%` }}
          transition={{ duration: 0.5 }}
          style={{
            height: '100%',
            backgroundColor: getColor(),
          }}
        />
      </Box>
    </Box>
  );
};

export default FormInput;
