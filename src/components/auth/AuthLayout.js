import React from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';

const AuthLayout = ({ children, title, subtitle, icon: Icon, sx = {} }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection={{ xs: 'column', md: 'row' }}
      bgcolor="background.default"
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
        ...sx
      }}
    >
      {/* Left Side - Branding */}
      <Box
        flex={{ xs: 0, md: 1 }}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        p={{ xs: 3, md: 4 }}
        sx={{
          color: 'white',
          textAlign: 'center',
          display: { xs: 'flex', md: 'flex' },
          pt: { xs: 4, md: 0 },
          pb: { xs: 0, md: 4 },
          minHeight: { xs: 'auto', md: '100vh' },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            width: '100%',
            maxWidth: 500,
            margin: '0 auto',
            padding: theme.spacing(0, 2)
          }}
        >
          <Typography 
            variant={isMobile ? 'h4' : 'h3'} 
            fontWeight={700} 
            gutterBottom
            sx={{
              fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
              lineHeight: 1.2
            }}
          >
            MedTrack
          </Typography>
          <Typography 
            variant={isMobile ? 'subtitle1' : 'h6'} 
            fontWeight={400}
            sx={{
              fontSize: { xs: '1rem', sm: '1.25rem' },
              opacity: 0.9,
              maxWidth: 500,
              mx: 'auto',
              px: { xs: 2, sm: 0 }
            }}
          >
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
        p={{ xs: 2, sm: 3 }}
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: { xs: '24px 24px 0 0', md: '24px 0 0 24px' },
          boxShadow: { xs: '0 -4px 20px rgba(0,0,0,0.1)', md: 3 },
          position: 'relative',
          zIndex: 1,
          minHeight: { xs: 'auto', md: '100vh' },
          overflowY: 'auto',
        }}
      >
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          width="100%"
          maxWidth={400}
          sx={{
            my: { xs: 2, sm: 3 },
            px: { xs: 1, sm: 2 },
          }}
        >
          <Box 
            textAlign="center" 
            mb={{ xs: 3, sm: 4 }}
            sx={{
              px: { xs: 1, sm: 0 }
            }}
          >
            {Icon && (
              <Box
                component={motion.div}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                display="inline-flex"
                p={{ xs: 1.5, sm: 2 }}
                mb={2}
                sx={{
                  backgroundColor: theme.palette.primary.light + '20',
                  borderRadius: '50%',
                }}
              >
                <Icon
                  sx={{
                    fontSize: { xs: 32, sm: 40 },
                    color: 'primary.main',
                  }}
                />
              </Box>
            )}
            <Typography 
              variant={isMobile ? 'h5' : 'h4'} 
              fontWeight={700} 
              gutterBottom
              sx={{
                fontSize: { xs: '1.5rem', sm: '2rem' },
                lineHeight: 1.2,
                mb: { xs: 1, sm: 2 }
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography 
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.9375rem', sm: '1rem' },
                  lineHeight: 1.5,
                  px: { xs: 1, sm: 0 },
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{
            '& > *:not(:last-child)': {
              mb: { xs: 2, sm: 2.5 }
            }
          }}>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;
