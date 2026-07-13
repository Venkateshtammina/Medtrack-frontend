// 📁 frontend/src/components/DashboardAnalytics.js
import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  useTheme,
  Avatar,
  Divider,
  List,
  ListItem
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
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const DashboardAnalytics = ({ medicines }) => {
  const theme = useTheme();

  // Compute metrics with high visual fidelity fallback parameters
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

    // Premium Color Palette mapping for the distribution tracking
    const stockLevels = [
      { name: 'Critical (0-10)', value: criticalArr, color: '#FF3B30' },
      { name: 'Low (11-50)', value: lowArr, color: '#FF9500' },
      { name: 'Optimal (51-100)', value: optimalArr, color: '#34C759' },
      { name: 'Overstock (100+)', value: overstockArr, color: '#007AFF' }
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
        name: `In ${targetDaysBound} Days`,
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
  }, [medicines]);

  if (!medicines || medicines.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 12, bgcolor: '#F8F9FA', borderRadius: 4, m: 2, border: '1px dashed #E0E0E0' }}>
        <Typography variant="h6" sx={{ color: '#6C757D', fontWeight: 600 }}>
          No core telemetry stream detected. Please supply baseline stock records.
        </Typography>
      </Box>
    );
  }

  const summaryCards = [
    { title: 'Active SKUs', value: analyticsData.totals.items, icon: <InventoryIcon fontSize="inherit" />, color: '#007AFF', bg: 'rgba(0, 122, 255, 0.08)' },
    { title: 'Critical Anomalies', value: analyticsData.totals.critical, icon: <WarningAmberIcon fontSize="inherit" />, color: '#FF3B30', bg: 'rgba(255, 59, 48, 0.08)' },
    { title: 'Approaching Expiry', value: analyticsData.totals.expiring, icon: <NewReleasesIcon fontSize="inherit" />, color: '#FF9500', bg: 'rgba(255, 149, 0, 0.08)' },
    { title: 'Asset Valuation', value: `₹${analyticsData.totals.value.toLocaleString('en-IN')}`, icon: <AccountBalanceWalletIcon fontSize="inherit" />, color: '#34C759', bg: 'rgba(52, 199, 89, 0.08)' }
  ];

  return (
    <Box sx={{ 
      height: 'calc(100vh - 48px)', 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden',
      bgcolor: '#FAFBFD',
      p: 3
    }}>
      
      {/* Premium Dynamic Title Segment */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1C1C1E', letterSpacing: '-1px' }}>
            System Intelligence
          </Typography>
          <Typography variant="body2" sx={{ color: '#8E8E93', fontWeight: 500, mt: 0.5 }}>
            Real-time multi-dimensional overview of medical inventory, stock tracking pipelines, and valuation matrices.
          </Typography>
        </Box>
      </Box>

      {/* Row 1: Flat, Minimalist SaaS Metrics Bar */}
      <Grid container spacing={3} sx={{ mb: 3, flexShrink: 0 }}>
        {summaryCards.map((card, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card sx={{ 
              borderRadius: '16px', 
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
              border: '1px solid #ECEEF2',
              bgcolor: '#FFFFFF'
            }}>
              <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#8E8E93', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '0.65rem' }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#1C1C1E', mt: 0.5, letterSpacing: '-0.5px' }}>
                    {card.value}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: card.bg, color: card.color, width: 48, height: 48, borderRadius: '12px', fontSize: '1.5rem' }}>
                  {card.icon}
                </Avatar>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Container Layout: 2-Column Command Interface */}
      <Grid container spacing={3} sx={{ flexGrow: 1, minHeight: 0, pb: 1 }}>
        
        {/* Left Column: Symmetrical Analytics Graphics Section */}
        <Grid item xs={12} md={7} sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
          <Card sx={{ 
            borderRadius: '20px', 
            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.03)',
            border: '1px solid #ECEEF2',
            bgcolor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            minHeight: 0,
            p: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <AssessmentIcon sx={{ color: '#1C1C1E' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.3px' }}>
                Stock Volume Allocation Matrix
              </Typography>
            </Box>
            <Divider sx={{ borderColor: '#F2F4F7' }} />

            {/* Split Symmetrical Graphic Block inside Left Window Container */}
            <Grid container sx={{ flexGrow: 1, minHeight: 0, mt: 2, alignItems: 'center' }}>
              <Grid item xs={12} sm={6} sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={analyticsData.stockLevels}
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={105}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {analyticsData.stockLevels.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} style={{ outline: 'none' }} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} SKUs`, 'Distribution']} />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>

              {/* Grid-aligned side details replacing random bullet rows */}
              <Grid item xs={12} sm={6} sx={{ pl: { sm: 4 } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {analyticsData.stockLevels.map((item, idx) => (
                    <Box key={idx} sx={{ 
                      p: 1.5, 
                      bgcolor: '#F8F9FA', 
                      borderRadius: '12px', 
                      borderLeft: `5px solid ${item.color}`,
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      <Typography variant="body2" sx={{ color: '#48484A', fontWeight: 600 }}>
                        {item.name.split(' ')[0]} Threshold
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: item.color }}>
                        {item.value} Items
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Right Column: Symmetrical Secondary Graphs and Feeds Section */}
        <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: 3 }}>
          
          {/* Top Half Panel: Time-series Trajectory */}
          <Card sx={{ 
            borderRadius: '20px', 
            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.03)',
            border: '1px solid #ECEEF2',
            bgcolor: '#FFFFFF',
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: 0,
            p: 2.5
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AccessTimeIcon sx={{ color: '#1C1C1E', fontSize: '1.2rem' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1C1C1E' }}>
                Expiration Risk Horizon
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.expiryTrends} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F7" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8E8E93', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#8E8E93' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.01)' }} />
                  <Bar dataKey="expiring" fill="#FF3B30" radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>

          {/* Bottom Half Panel: Live Action Activity Stream */}
          <Card sx={{ 
            borderRadius: '20px', 
            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.03)',
            border: '1px solid #ECEEF2',
            bgcolor: '#FFFFFF',
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: 0,
            p: 2.5
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1C1C1E', mb: 1.5 }}>
              Recent Telemetry Log Updates
            </Typography>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 0.5 }}>
              <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {analyticsData.recentMedicines.map((medicine, index) => (
                  <ListItem 
                    key={medicine._id || index}
                    disablePadding
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      bgcolor: '#F8F9FA',
                      border: '1px solid #ECEEF2',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Box sx={{ overflow: 'hidden', mr: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1C1C1E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {medicine.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#8E8E93', display: 'block', mt: 0.5, fontWeight: 500 }}>
                        Units Available: {medicine.quantity} &bull; Exp: {new Date(medicine.expiryDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '8px',
                      bgcolor: medicine.quantity <= 10 ? 'rgba(255, 59, 48, 0.1)' : 'rgba(52, 199, 89, 0.1)',
                      color: medicine.quantity <= 10 ? '#FF3B30' : '#34C759',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}>
                      {medicine.quantity <= 10 ? 'Critical' : 'Nominal'}
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Card>

        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardAnalytics;