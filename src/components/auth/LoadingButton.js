import React from 'react';
import { Button, CircularProgress, Box } from '@mui/material';
import { motion } from 'framer-motion';

const LoadingButton = ({
  loading = false,
  disabled = false,
  children,
  fullWidth = true,
  variant = 'contained',
  size = 'large',
  startIcon,
  endIcon,
  color = 'primary',
  sx = {},
  ...props
}) => {
  return (
    <Button
      variant={variant}
      disabled={loading || disabled}
      fullWidth={fullWidth}
      size={size}
      color={color}
      startIcon={
        loading ? (
          <Box component="span" sx={{ opacity: 0 }}>
            {startIcon}
          </Box>
        ) : (
          startIcon
        )
      }
      endIcon={
        loading ? (
          <Box component="span" sx={{ opacity: 0 }}>
            {endIcon}
          </Box>
        ) : (
          endIcon
        )
      }
      sx={{
        position: 'relative',
        borderRadius: 2,
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '1rem',
        letterSpacing: '0.5px',
        boxShadow: 1,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-1px)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
        ...sx,
      }}
      {...props}
    >
      <Box
        component="span"
        sx={{
          visibility: loading ? 'hidden' : 'visible',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {children}
      </Box>
      
      {loading && (
        <Box
          component={motion.div}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2 }}
          sx={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          }}
        >
          <CircularProgress
            size={24}
            color={
              color === 'inherit' || color === 'primary' || color === 'secondary'
                ? 'inherit'
                : 'primary'
            }
          />
        </Box>
      )}
    </Button>
  );
};

export default LoadingButton;
