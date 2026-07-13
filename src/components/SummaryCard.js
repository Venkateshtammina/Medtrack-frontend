import React from 'react';
import { Box, Typography, Paper, useTheme, alpha } from '@mui/material';

const SummaryCard = ({ title, value, icon: Icon, color = 'primary' }) => {
  const theme = useTheme();
  
  // Define color variants
  const colorMap = {
    primary: {
      bg: theme.palette.primary.light,
      text: theme.palette.primary.contrastText,
      icon: theme.palette.primary.main,
      shadow: alpha(theme.palette.primary.main, 0.2)
    },
    warning: {
      bg: theme.palette.warning.light,
      text: theme.palette.warning.contrastText,
      icon: theme.palette.warning.main,
      shadow: alpha(theme.palette.warning.main, 0.2)
    },
    error: {
      bg: theme.palette.error.light,
      text: theme.palette.error.contrastText,
      icon: theme.palette.error.main,
      shadow: alpha(theme.palette.error.main, 0.2)
    },
    info: {
      bg: theme.palette.info.light,
      text: theme.palette.info.contrastText,
      icon: theme.palette.info.main,
      shadow: alpha(theme.palette.info.main, 0.2)
    },
    success: {
      bg: theme.palette.success.light,
      text: theme.palette.success.contrastText,
      icon: theme.palette.success.main,
      shadow: alpha(theme.palette.success.main, 0.2)
    }
  };

  const colors = colorMap[color] || colorMap.primary;

  return (
    <Paper 
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        borderRadius: 4,
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -50,
          right: -50,
          width: 100,
          height: 100,
          background: `radial-gradient(circle, ${alpha(colors.icon, 0.1)} 0%, transparent 70%)`,
          borderRadius: '50%',
          pointerEvents: 'none'
        },
        '&:hover': {
          transform: 'translateY(-12px) scale(1.03)',
          boxShadow: `0 20px 60px ${colors.shadow}`,
          background: 'rgba(255, 255, 255, 1)',
          borderColor: colors.icon,
          '&::before': {
            background: `radial-gradient(circle, ${alpha(colors.icon, 0.2)} 0%, transparent 70%)`
          }
        }
      }}
    >
      <Box display="flex" alignItems="center" mb={2}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2,
            background: `linear-gradient(135deg, ${colors.icon} 0%, ${alpha(colors.icon, 0.7)} 100%)`,
            color: 'white',
            boxShadow: `0 4px 15px ${colors.shadow}`,
            '& svg': {
              fontSize: 32
            },
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'rotate(10deg) scale(1.1)'
            }
          }}
        >
          <Icon />
        </Box>
        <Box>
          <Typography 
            variant="subtitle2" 
            color="textSecondary"
            sx={{ 
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              mb: 0.5,
              opacity: 0.8
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="h3" 
            fontWeight={800}
            sx={{ 
              lineHeight: 1.1,
              background: `linear-gradient(135deg, ${colors.icon} 0%, ${alpha(colors.icon, 0.6)} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textFillColor: 'transparent'
            }}
          >
            {value}
          </Typography>
        </Box>
      </Box>
      <Box 
        sx={{ 
          height: 4,
          width: '100%',
          background: `linear-gradient(90deg, ${colors.icon} 0%, ${alpha(colors.icon, 0.2)} 100%)`,
          borderRadius: 2,
          mt: 2,
          opacity: 0.9,
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)`,
            animation: 'shimmer 2s infinite'
          },
          '@keyframes shimmer': {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(100%)' }
          }
        }}
      />
    </Paper>
  );
};

export default SummaryCard;
