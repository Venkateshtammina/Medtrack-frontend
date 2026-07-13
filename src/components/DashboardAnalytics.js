import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const DashboardAnalytics = ({ medicines }) => {
  const theme = useTheme();

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    if (!medicines || medicines.length === 0) {
      return {
        stockLevels: [],
        expiryTrends: [],
        categoryDistribution: [],
        recentMedicines: []
      };
    }

    const today = new Date();

    // Stock Level Distribution
    const stockLevels = [
      { name: 'Critical (0-10)', value: medicines.filter(m => m.quantity <= 10).length, color: '#ef5350' },
      { name: 'Low (11-50)', value: medicines.filter(m => m.quantity > 10 && m.quantity <= 50).length, color: '#ff9800' },
      { name: 'Optimal (51-100)', value: medicines.filter(m => m.quantity > 50 && m.quantity <= 100).length, color: '#4caf50' },
      { name: 'Overstock (100+)', value: medicines.filter(m => m.quantity > 100).length, color: '#2196f3' }
    ].filter(item => item.value > 0);

    // Expiry Date Trends (next 90 days)
    const expiryTrends = [];
    for (let i = 0; i < 3; i++) {
      const days = (i + 1) * 30;
      const startDate = new Date(today);
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + days);
      
      const count = medicines.filter(m => {
        const expiryDate = new Date(m.expiryDate);
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > (i * 30) && diffDays <= days;
      }).length;

      expiryTrends.push({
        name: `${days} Days`,
        expiring: count
      });
    }

    // Recently Added Medicines (sorted by creation date or just last 5)
    const recentMedicines = [...medicines]
      .sort((a, b) => new Date(b.createdAt || b.expiryDate) - new Date(a.createdAt || a.expiryDate))
      .slice(0, 5);

    return {
      stockLevels,
      expiryTrends,
      recentMedicines
    };
  }, [medicines]);

  if (!medicines || medicines.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="textSecondary">
          No data available for analytics
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Inventory Analytics
      </Typography>

      <Grid container spacing={3}>
        {/* Stock Level Distribution */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              border: '1px solid',
              borderColor: 'divider',
              cursor: 'pointer',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                borderColor: 'primary.main'
              }
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Stock Level Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.stockLevels}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.stockLevels.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Expiry Date Trends */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              border: '1px solid',
              borderColor: 'divider',
              cursor: 'pointer',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                borderColor: 'primary.main'
              }
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Expiring Soon (Next 90 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.expiryTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="expiring" fill={theme.palette.error.main} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>


        {/* Recently Added Medicines */}
        <Grid item xs={12}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              cursor: 'pointer',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                borderColor: 'primary.main'
              }
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Recently Added Medicines
              </Typography>
              <Grid container spacing={2}>
                {analyticsData.recentMedicines.map((medicine, index) => (
                  <Grid item xs={12} sm={6} md={4} key={medicine._id || index}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'background.default',
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s ease-in-out',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          borderColor: 'primary.main',
                          bgcolor: 'primary.light',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {medicine.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Qty: {medicine.quantity} | Exp: {new Date(medicine.expiryDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          px: 2,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: medicine.quantity <= 10 ? 'error.light' : 'success.light',
                          color: medicine.quantity <= 10 ? 'error.dark' : 'success.dark',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      >
                        {medicine.quantity <= 10 ? 'Low Stock' : 'In Stock'}
                      </Box>
                    </Box>
                  </Grid>
                ))}
                {analyticsData.recentMedicines.length === 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                      No recent medicines
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardAnalytics;
