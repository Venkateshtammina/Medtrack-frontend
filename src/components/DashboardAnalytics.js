import React, { useMemo } from 'react';
import {
  Avatar,
  Box,
  Card,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const DAY_MS = 24 * 60 * 60 * 1000;

const panelSx = {
  borderRadius: 3,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 2px 7px rgba(16, 24, 40, 0.035)',
  bgcolor: 'background.paper',
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const DashboardAnalytics = ({ medicines = [] }) => {
  const theme = useTheme();

  const analyticsData = useMemo(() => {
    const today = startOfDay(new Date());
    const data = {
      totals: { items: medicines.length, critical: 0, expiring90: 0, expiring30: 0, expired: 0, units: 0 },
      stockLevels: [
        { name: 'Critical', value: 0, color: theme.palette.error.main },
        { name: 'Low', value: 0, color: theme.palette.warning.main },
        { name: 'Optimal', value: 0, color: theme.palette.success.main },
        { name: 'Overstock', value: 0, color: theme.palette.primary.main },
      ],
      expiryTrends: [
        { name: '1–30 days', expiring: 0 },
        { name: '31–60 days', expiring: 0 },
        { name: '61–90 days', expiring: 0 },
      ],
      recentMedicines: [...medicines]
        .sort((a, b) => new Date(b.createdAt || b.expiryDate) - new Date(a.createdAt || a.expiryDate))
        .slice(0, 5),
    };

    medicines.forEach((medicine) => {
      const quantity = Number(medicine.quantity) || 0;
      const expiryDate = startOfDay(new Date(medicine.expiryDate));
      const daysUntilExpiry = Math.round((expiryDate - today) / DAY_MS);
      data.totals.units += quantity;

      if (quantity <= 10) {
        data.totals.critical += 1;
        data.stockLevels[0].value += 1;
      } else if (quantity <= 50) {
        data.stockLevels[1].value += 1;
      } else if (quantity <= 100) {
        data.stockLevels[2].value += 1;
      } else {
        data.stockLevels[3].value += 1;
      }

      if (daysUntilExpiry < 0) {
        data.totals.expired += 1;
      } else if (daysUntilExpiry <= 90) {
        data.totals.expiring90 += 1;
        if (daysUntilExpiry <= 30) {
          data.totals.expiring30 += 1;
          data.expiryTrends[0].expiring += 1;
        } else if (daysUntilExpiry <= 60) {
          data.expiryTrends[1].expiring += 1;
        } else {
          data.expiryTrends[2].expiring += 1;
        }
      }
    });

    return data;
  }, [medicines, theme.palette]);

  if (!medicines.length) {
    return (
      <Box sx={{ ...panelSx, py: { xs: 7, md: 10 }, px: 3, textAlign: 'center', borderStyle: 'dashed' }}>
        <Avatar sx={{ mx: 'auto', mb: 2, width: 52, height: 52, bgcolor: 'primary.light', color: 'primary.main' }}>
          <AssessmentIcon />
        </Avatar>
        <Typography variant="h6">Analytics will appear here</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Add medicines to see stock health and expiry insights.
        </Typography>
      </Box>
    );
  }

  const healthyPercentage = Math.round(((analyticsData.totals.items - analyticsData.totals.critical) / analyticsData.totals.items) * 100);
  const riskCount = analyticsData.totals.expired + analyticsData.totals.critical + analyticsData.totals.expiring30;
  const hasHighRisk = analyticsData.totals.expired > 0 || analyticsData.totals.critical > 0;
  const summaryCards = [
    { label: 'Medicine batches', value: analyticsData.totals.items, detail: `${analyticsData.totals.units.toLocaleString()} units in stock`, icon: InventoryIcon, color: theme.palette.primary.main },
    { label: 'Low stock', value: analyticsData.totals.critical, detail: 'At or below 10 units', icon: WarningAmberIcon, color: theme.palette.warning.main },
    { label: 'Expiry risk', value: analyticsData.totals.expiring30, detail: 'Expiring in the next 30 days', icon: NewReleasesIcon, color: '#D97706' },
    { label: 'Expired', value: analyticsData.totals.expired, detail: 'Needs immediate review', icon: DeleteForeverIcon, color: theme.palette.error.main },
  ];

  return (
    <Box>
      <Card sx={{ ...panelSx, mb: 3, overflow: 'hidden' }}>
        <Box sx={{ p: { xs: 2.5, sm: 3 }, display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Box>
            <Typography variant="h6">Inventory health</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              A quick view of stock levels and upcoming expiry work.
            </Typography>
          </Box>
          <Chip
            label={hasHighRisk ? `${riskCount} items need attention` : 'Inventory looks healthy'}
            color={hasHighRisk ? 'warning' : 'success'}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          />
        </Box>
        <Box sx={{ px: { xs: 2.5, sm: 3 }, pb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" fontWeight={700}>Healthy stock coverage</Typography>
            <Typography variant="body2" color="text.secondary">{healthyPercentage}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={healthyPercentage} color={hasHighRisk ? 'warning' : 'success'} sx={{ height: 8, borderRadius: 4, bgcolor: alpha(theme.palette.success.main, 0.1) }} />
        </Box>
      </Card>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Grid item xs={12} sm={6} lg={3} key={card.label}>
              <Card sx={{ ...panelSx, height: '100%', p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                  <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, lineHeight: 1, letterSpacing: '0.07em' }}>{card.label}</Typography>
                    <Typography variant="h4" sx={{ mt: 1, lineHeight: 1, fontSize: '2rem' }}>{card.value}</Typography>
                  </Box>
                  <Avatar sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: alpha(card.color, 0.11), color: card.color }}>
                    <Icon fontSize="small" />
                  </Avatar>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>{card.detail}</Typography>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={7}>
          <Card sx={{ ...panelSx, p: { xs: 2.5, sm: 3 }, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box>
                <Typography variant="h6">Stock distribution</Typography>
                <Typography variant="body2" color="text.secondary">Batches grouped by available quantity.</Typography>
              </Box>
              <AssessmentIcon color="primary" />
            </Box>
            <Divider sx={{ my: 2.5 }} />
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Box sx={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={analyticsData.stockLevels.filter((item) => item.value > 0)} dataKey="value" innerRadius={66} outerRadius={96} paddingAngle={3} stroke="none">
                        {analyticsData.stockLevels.filter((item) => item.value > 0).map((item) => <Cell key={item.name} fill={item.color} />)}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} batches`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'grid', gap: 1.25 }}>
                  {analyticsData.stockLevels.map((item) => (
                    <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.25, borderRadius: 2, bgcolor: alpha(item.color, 0.055) }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 9, height: 9, borderRadius: 99, bgcolor: item.color }} />
                        <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={800}>{item.value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card sx={{ ...panelSx, p: { xs: 2.5, sm: 3 }, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AccessTimeIcon color="warning" fontSize="small" />
              <Box>
                <Typography variant="h6">Expiry timeline</Typography>
                <Typography variant="body2" color="text.secondary">Prioritise the nearest expiry dates first.</Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2.5 }} />
            <Box sx={{ height: 245 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.expiryTrends} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: alpha(theme.palette.warning.main, 0.05) }} formatter={(value) => [`${value} batches`, 'Expiring']} />
                  <Bar dataKey="expiring" fill={theme.palette.warning.main} radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ ...panelSx, p: { xs: 2.5, sm: 3 } }}>
        <Typography variant="h6">Recently added medicines</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Your five most recent inventory records.</Typography>
        <Divider sx={{ my: 2.5 }} />
        <List disablePadding sx={{ display: 'grid', gap: 1.25 }}>
          {analyticsData.recentMedicines.map((medicine, index) => {
            const daysUntilExpiry = Math.round((startOfDay(new Date(medicine.expiryDate)) - startOfDay(new Date())) / DAY_MS);
            const status = daysUntilExpiry < 0 ? { label: 'Expired', color: 'error' } : daysUntilExpiry <= 30 ? { label: `${daysUntilExpiry}d to expiry`, color: 'warning' } : medicine.quantity <= 10 ? { label: 'Low stock', color: 'warning' } : { label: 'Stable', color: 'success' };
            return (
              <ListItem key={medicine._id || index} disablePadding sx={{ p: 1.75, border: '1px solid', borderColor: 'divider', borderRadius: 2.5, display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center', '&:hover': { borderColor: 'primary.light', bgcolor: 'rgba(22,119,255,0.015)' } }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={700} noWrap>{medicine.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    {medicine.quantity} units · Expires {new Date(medicine.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Typography>
                </Box>
                <Chip label={status.label} color={status.color} size="small" sx={{ fontWeight: 700, flexShrink: 0 }} />
              </ListItem>
            );
          })}
        </List>
      </Card>
    </Box>
  );
};

export default DashboardAnalytics;
