// 📁 server/routes/auth.js -> frontend/src/components/DashboardAnalytics.js
import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  Avatar,
  Divider
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
import LayersIcon from '@mui/icons-material/Layers';

const DashboardAnalytics = ({ medicines }) => {
  const theme = useTheme();

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

    let criticalArr = 0, lowArr = 0, optimalArr = 0, overstockArr = 0;

    medicines.forEach(m => {
      const qty = Number(m.quantity) || 0;
      const price = Number(m.price) || 0;
      totalInventoryValue += qty * price;

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
      .slice(0, 4); // Tailored to 4 elements to balance the container layout perfectly

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
          No inventory metrics found. Add stock items to spin up calculations.
        </Typography>
      </Box>
    );
  }

  const summaryCards = [
    { title: 'Total SKU Items', value: analyticsData.totals.items, icon: <InventoryIcon fontSize="small" />, color: theme.palette.primary.main, bg: 'primary.light' },
    { title: 'Critical Alerts', value: analyticsData.totals.critical, icon: <WarningAmberIcon fontSize="small" />, color: theme.palette.error.main, bg: 'error.light' },
    { title: 'Expiring Soon (90d)', value: analyticsData.totals.expiring, icon: <NewReleasesIcon fontSize="small" />, color: theme.palette.warning.main, bg: 'warning.light' },
    { title: 'Valuation Portfolio', value: `₹${analyticsData.totals.value.toLocaleString('en-IN')}`, icon: <AccountBalanceWalletIcon fontSize="small" />, color: theme.palette.success.main, bg: 'success.light' }
  ];

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 0.5 }}>
      {/* Header Context Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexShrink: 0 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
            Operations & Performance Analytics
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Real-time status monitoring, distribution graphs, and pipeline valuation metrics
          </Typography>
        </Box>
      </Box>

      {/* Row 1: KPI Statistics Banner */}
      <Grid container spacing={2} sx={{ mb: 2, flexShrink: 0 }}>
        {summaryCards.map((card, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5, bgcolor: 'background.paper' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: '14px !important' }}>
                <Avatar sx={{ bgcolor: card.bg, color: card.color, width: 42, height: 42, borderRadius: 2, mr: 2 }}>
                  {card.icon}
                </Avatar>
                <Box>
                  <Typography variant="caption" color="textSecondary" fontWeight={600} sx={{ textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.5px' }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2, mt: 0.25 }}>
                    {card.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Structural Core Grid: High-Fidelity Split Screen Configuration */}
      <Grid container spacing={2} sx={{ flexGrow: 1, minHeight: 0, mb: 1 }}>
        
        {/* LEFT COLUMN: Data Matrix Block */}
        <Grid item xs={12} md={7} sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LayersIcon color="action" fontSize="small" /> Stock Level Distribution Matrix
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Categorized by unit thresholds
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ flexGrow: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="95%">
                  <PieChart>
                    <Pie
                      data={analyticsData.stockLevels}
                      cx="50%"
                      cy="48%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analyticsData.stockLevels.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} style={{ outline: 'none' }} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} SKUs`, 'Volume']} contentStyle={{ borderRadius: '8px', border: `1px solid ${theme.palette.divider}` }} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              {/* Dynamic Badging Rows */}
              <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, pt: 1, mt: 'auto', borderTop: '1px dashed', borderColor: 'divider' }}>
                {analyticsData.stockLevels.map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, bgcolor: 'background.default', borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                    <Typography variant="caption" color="textPrimary" fontWeight={600} sx={{ fontSize: '0.72rem' }}>
                      {item.name}: <span style={{ color: item.color, fontWeight: 800 }}>{item.value}</span>
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT COLUMN: Time & Activity Pipelines */}
        <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: 2 }}>
          
          {/* Top Half Block: Expiration Forecasting */}
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Critical Expiration Trajectory Pipeline
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.expiryTrends} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }} />
                    <Bar dataKey="expiring" fill={theme.palette.error.main} radius={[4, 4, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          {/* Bottom Half Block: Live Additions Feed */}
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Latest Inventory Additions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto', flexGrow: 1, pr: 0.5 }}>
                {analyticsData.recentMedicines.map((medicine, index) => (
                  <Box
                    key={medicine._id || index}
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      bgcolor: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ overflow: 'hidden', mr: 1 }}>
                      <Typography variant="caption" fontWeight={700} color="text.primary" sx={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {medicine.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.68rem', display: 'block', mt: 0.25 }}>
                        Qty: {medicine.quantity} units | Exp: {new Date(medicine.expiryDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        bgcolor: medicine.quantity <= 10 ? 'error.light' : 'success.light',
                        color: medicine.quantity <= 10 ? 'error.dark' : 'success.dark',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                    >
                      {medicine.quantity <= 10 ? 'CRITICAL' : 'STABLE'}
                    </Box>
                  </Box>
                ))}
                {analyticsData.recentMedicines.length === 0 && (
                  <Typography variant="caption" color="textSecondary" sx={{ textAlign: 'center', my: 'auto' }}>
                    No recent data streams detected.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardAnalytics;