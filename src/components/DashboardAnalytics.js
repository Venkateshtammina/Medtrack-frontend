import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  Avatar
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
  ResponsiveContainer
} from 'recharts';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const DashboardAnalytics = ({ medicines }) => {
  const theme = useTheme();

  // Calculate high-fidelity metrics and analytics trends
  const analyticsData = useMemo(() => {
    if (!medicines || medicines.length === 0) {
      return {
        totals: { items: 0, critical: 0, expiring: 0, value: 0 },
        stockLevels: [],
        expiryTrends: [],
        recentMedicines: []
      };
    }

    const today = new Date();
    let totalItems = medicines.length;
    let criticalCount = 0;
    let expiringCount90Days = 0;
    let totalInventoryValue = 0;

    // Stock Distribution calculation counters
    let criticalArr = 0, lowArr = 0, optimalArr = 0, overstockArr = 0;

    medicines.forEach(m => {
      // Calculate financial valuation metrics (Fallback to 0 if fields are absent)
      const qty = Number(m.quantity) || 0;
      const price = Number(m.price) || 0;
      totalInventoryValue += qty * price;

      // Classify Stock Level Boundaries
      if (qty <= 10) {
        criticalArr++;
        criticalCount++;
      } else if (qty <= 50) {
        lowArr++;
      } else if (qty <= 100) {
        optimalArr++;
      } else {
        overstockArr++;
      }

      // Check Expiry Window (Within next 90 days)
      const expiryDate = new Date(m.expiryDate);
      const diffTime = expiryDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0 && diffDays <= 90) {
        expiringCount90Days++;
      }
    });

    const stockLevels = [
      { name: 'Critical (0-10)', value: criticalArr, color: theme.palette.error.main },
      { name: 'Low (11-50)', value: lowArr, color: theme.palette.warning.main },
      { name: 'Optimal (51-100)', value: optimalArr, color: theme.palette.success.main },
      { name: 'Overstock (100+)', value: overstockArr, color: theme.palette.info.main }
    ].filter(item => item.value > 0);

    // Compute Timeline Expiry distribution groups
    const expiryTrends = [];
    for (let i = 0; i < 3; i++) {
      const targetDaysBound = (i + 1) * 30;
      const count = medicines.filter(m => {
        const expiryDate = new Date(m.expiryDate);
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > (i * 30) && diffDays <= targetDaysBound;
      }).length;

      expiryTrends.push({
        name: `${targetDaysBound} Days`,
        expiring: count
      });
    }

    const recentMedicines = [...medicines]
      .sort((a, b) => new Date(b.createdAt || b.expiryDate) - new Date(a.createdAt || a.expiryDate))
      .slice(0, 5);

    return {
      totals: { items: totalItems, critical: criticalCount, expiring: expiringCount90Days, value: totalInventoryValue },
      stockLevels,
      expiryTrends,
      recentMedicines
    };
  }, [medicines, theme.palette]);

  if (!medicines || medicines.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="textSecondary">
          No inventory data available for analytics extraction.
        </Typography>
      </Box>
    );
  }

  // Configurations layout for quick stats summary row
  const summaryCards = [
    { title: 'Total SKU Items', value: analyticsData.totals.items, icon: <InventoryIcon />, color: theme.palette.primary.main, bg: 'primary.light' },
    { title: 'Critical Stock Alert', value: analyticsData.totals.critical, icon: <WarningAmberIcon />, color: theme.palette.error.main, bg: 'error.light' },
    { title: 'Expiring Soon (90d)', value: analyticsData.totals.expiring, icon: <NewReleasesIcon />, color: theme.palette.warning.main, bg: 'warning.light' },
    { title: 'Total Portfolio Value', value: `₹${analyticsData.totals.value.toLocaleString('en-IN')}`, icon: <AccountBalanceWalletIcon />, color: theme.palette.success.main, bg: 'success.light' }
  ];

  return (
    <Box sx={{ py: 1 }}>
      <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, color: 'text.primary' }}>
        Inventory Insights & Analytics Dashboard
      </Typography>

      {/* Row 1: Summary Metric KPI Widgets */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryCards.map((card, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, '&:last-child': { pb: 2 } }}>
                <Avatar sx={{ bgcolor: card.bg, color: card.color, width: 56, height: 56, borderRadius: 2 }}>
                  {card.icon}
                </Avatar>
                <Box>
                  <Typography variant="caption" color="textSecondary" fontWeight={500}>
                    {card.title}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
                    {card.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Row 2: Charts and Distributions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, minHeight: 400 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600 }}>
                Stock Level Distribution Matrix
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.stockLevels}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {analyticsData.stockLevels.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} Items`, name]} />
                </PieChart>
              </ResponsiveContainer>
              {/* Custom Legend to prevent word-wrapping overlap */}
              <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                {analyticsData.stockLevels.map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
                    <Typography variant="caption" color="textSecondary" fontWeight={500}>{item.name}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, minHeight: 400 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600 }}>
                Critical Expiration Trajectory Pipeline
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={analyticsData.expiryTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="expiring" fill={theme.palette.error.main} radius={[6, 6, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Row 3: Recently Added Medicines */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600 }}>
                Latest Inventory Additions
              </Typography>
              <Grid container spacing={2}>
                {analyticsData.recentMedicines.map((medicine, index) => (
                  <Grid item xs={12} sm={6} md={4} key={medicine._id || index}>
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        bgcolor: 'background.default',
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.015)',
                          borderColor: 'primary.main',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                        }
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={600} color="text.primary">
                          {medicine.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                          Qty: {medicine.quantity} units | Exp: {new Date(medicine.expiryDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1.5,
                          bgcolor: medicine.quantity <= 10 ? 'error.light' : 'success.light',
                          color: medicine.quantity <= 10 ? 'error.dark' : 'success.dark',
                          fontSize: '0.725rem',
                          fontWeight: 700
                        }}
                      >
                        {medicine.quantity <= 10 ? 'CRITICAL STOCK' : 'STABLE'}
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardAnalytics;