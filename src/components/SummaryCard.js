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
        borderRadius: 3,
        background: theme.palette.background.paper,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px 0 ${colors.shadow}`,
          borderColor: colors.icon
        }
      }}
    >
      <Box display="flex" alignItems="center" mb={1.5}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2,
            background: alpha(colors.icon, 0.1),
            color: colors.icon,
            '& svg': {
              fontSize: 28
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
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              mb: 0.25
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="h4" 
            fontWeight={700}
            sx={{ 
              lineHeight: 1.2,
              background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.text.secondary} 100%)`,
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
          background: `linear-gradient(90deg, ${colors.icon} 0%, ${alpha(colors.icon, 0.3)} 100%)`,
          borderRadius: 2,
          mt: 2,
          opacity: 0.8
        }}
      />
    </Paper>
  );
};

export default SummaryCard;
