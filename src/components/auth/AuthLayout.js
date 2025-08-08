import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

const AuthLayout = ({ children, title, subtitle, icon: Icon }) => {
  const theme = useTheme();
  
  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection={{ xs: 'column', md: 'row' }}
      bgcolor="background.default"
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
      }}
    >
      {/* Left Side - Branding */}
      <Box
        flex={{ xs: 0, md: 1 }}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        p={4}
        sx={{
          color: 'white',
          textAlign: 'center',
          display: { xs: 'none', md: 'flex' },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h3" fontWeight={700} gutterBottom>
            MedTrack
          </Typography>
          <Typography variant="h6" fontWeight={400}>
            Your personal medication management assistant
          </Typography>
        </motion.div>
      </Box>

      {/* Right Side - Form */}
      <Box
        flex={{ xs: 1, md: 1 }}
        display="flex"
        justifyContent="center"
        alignItems="center"
        p={3}
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: { xs: 0, md: '24px 0 0 24px' },
          boxShadow: { xs: 0, md: 3 },
        }}
      >
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          width="100%"
          maxWidth={400}
        >
          <Box textAlign="center" mb={4}>
            <Box
              component={motion.div}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              display="inline-flex"
              p={2}
              mb={2}
              sx={{
                backgroundColor: theme.palette.primary.light + '20',
                borderRadius: '50%',
              }}
            >
              {Icon && (
                <Icon
                  sx={{
                    fontSize: 40,
                    color: 'primary.main',
                  }}
                />
              )}
            </Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {title}
            </Typography>
            {subtitle && (
              <Typography color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;
