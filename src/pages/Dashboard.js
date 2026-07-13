import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { unparse } from 'papaparse';
import api from '../config/api';
import MedicineForm from '../components/MedicineForm';
import MedicineList from '../components/MedicineList';
import InventoryLogs from '../components/InventoryLogs';
import SummaryCard from '../components/SummaryCard';
import DashboardAnalytics from '../components/DashboardAnalytics';
import { 
  Box, 
  Typography, 
  Button, 
  Divider, 
  TextField, 
  InputAdornment,
  useTheme,
  Grid,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  BottomNavigation,
  BottomNavigationAction,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CssBaseline
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Logout as LogoutIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CalendarMonth as CalendarIcon,
  Menu as MenuIcon,
  List as ListIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  
  // UI State
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bottomNavValue, setBottomNavValue] = useState('medicines');
  
  // Dashboard state
  const [medicines, setMedicines] = useState([]);
  const [activeTab, setActiveTab] = useState('medicines');
  const [isMedicineDialogOpen, setIsMedicineDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  
  // Get token from storage
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Fetch medicines from API
  const fetchMedicines = async () => {
    try {
      const response = await api.get('/api/medicines');
      setMedicines(response.data);
    } catch (error) {
      enqueueSnackbar('Failed to fetch medicines', { variant: 'error' });
      console.error('Error fetching medicines:', error);
    }
  };

  // Load medicines and check authentication
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchMedicines();
  }, [token, navigate]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    navigate('/login');
    enqueueSnackbar('Logged out successfully', { variant: 'success' });
  };

  // Handle open add medicine dialog
  const handleOpenAddMedicineDialog = () => {
    setEditingMedicine(null);
    setIsMedicineDialogOpen(true);
  };

  // Handle close medicine dialog
  const handleCloseMedicineDialog = () => {
    setIsMedicineDialogOpen(false);
    setEditingMedicine(null);
  };

  // Handle add medicine
  const handleAddMedicine = async (medicineData) => {
    try {
      // MedicineForm already made the API call, just refresh the list
      enqueueSnackbar('Medicine added successfully', { variant: 'success' });
      handleCloseMedicineDialog();
      fetchMedicines();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to add medicine', { variant: 'error' });
      console.error('Error adding medicine:', error);
    }
  };

  // Handle edit medicine
  const handleEditMedicine = (medicine) => {
    setEditingMedicine(medicine);
    setIsMedicineDialogOpen(true);
  };

  // Handle update medicine
  const handleUpdateMedicine = async (medicineData) => {
    try {
      // MedicineForm already made the API call, just refresh the list
      enqueueSnackbar('Medicine updated successfully', { variant: 'success' });
      handleCloseMedicineDialog();
      fetchMedicines();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to update medicine', { variant: 'error' });
      console.error('Error updating medicine:', error);
    }
  };

  // Handle delete medicine
  const handleDeleteMedicine = async (medicineId) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await api.delete(`/api/medicines/${medicineId}`);
        enqueueSnackbar('Medicine deleted successfully', { variant: 'success' });
        fetchMedicines();
      } catch (error) {
        enqueueSnackbar(error.response?.data?.message || 'Failed to delete medicine', { variant: 'error' });
        console.error('Error deleting medicine:', error);
      }
    }
  };

  // Handle export to CSV
  const handleExportCSV = () => {
    try {
      const csv = unparse(medicines);
      const link = document.createElement('a');
      link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      link.setAttribute('download', 'medicines.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      enqueueSnackbar('CSV exported successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to export CSV', { variant: 'error' });
      console.error('Error exporting CSV:', error);
    }
  };
  
  // Drawer content
  const drawer = (
    <Box>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" component="div">
          MedTrack
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem
          button
          onClick={() => setActiveTab('medicines')}
          sx={{
            borderRadius: 2,
            mx: 1,
            mb: 0.5,
            cursor: 'pointer',
            bgcolor: activeTab === 'medicines' ? 'primary.main' : 'transparent',
            color: activeTab === 'medicines' ? 'white' : 'text.primary',
            '&:hover': {
              bgcolor: activeTab === 'medicines' ? 'primary.dark' : 'action.hover',
              transform: 'translateX(4px)',
              transition: 'all 0.2s ease-in-out'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <ListItemIcon sx={{ color: activeTab === 'medicines' ? 'white' : 'inherit' }}>
            <InventoryIcon />
          </ListItemIcon>
          <ListItemText primary="Medicines" />
        </ListItem>
        <ListItem
          button
          onClick={() => setActiveTab('analytics')}
          sx={{
            borderRadius: 2,
            mx: 1,
            mb: 0.5,
            cursor: 'pointer',
            bgcolor: activeTab === 'analytics' ? 'primary.main' : 'transparent',
            color: activeTab === 'analytics' ? 'white' : 'text.primary',
            '&:hover': {
              bgcolor: activeTab === 'analytics' ? 'primary.dark' : 'action.hover',
              transform: 'translateX(4px)',
              transition: 'all 0.2s ease-in-out'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <ListItemIcon sx={{ color: activeTab === 'analytics' ? 'white' : 'inherit' }}>
            <AnalyticsIcon />
          </ListItemIcon>
          <ListItemText primary="Analytics" />
        </ListItem>
        <ListItem
          button
          onClick={() => setActiveTab('logs')}
          sx={{
            borderRadius: 2,
            mx: 1,
            mb: 0.5,
            cursor: 'pointer',
            bgcolor: activeTab === 'logs' ? 'primary.main' : 'transparent',
            color: activeTab === 'logs' ? 'white' : 'text.primary',
            '&:hover': {
              bgcolor: activeTab === 'logs' ? 'primary.dark' : 'action.hover',
              transform: 'translateX(4px)',
              transition: 'all 0.2s ease-in-out'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <ListItemIcon sx={{ color: activeTab === 'logs' ? 'white' : 'inherit' }}>
            <ListIcon />
          </ListItemIcon>
          <ListItemText primary="Inventory Logs" />
        </ListItem>
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'error.light',
              borderColor: 'error.main',
              color: 'error.main',
              transform: 'scale(1.02)',
              transition: 'all 0.2s ease-in-out'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      bgcolor: 'background.default',
    }}>
      <CssBaseline />
      
      {/* Mobile App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          display: { xs: 'flex', md: 'none' },
          boxShadow: '0 2px 10px 0 rgba(0,0,0,0.1)'
        }}
        elevation={0}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {activeTab === 'medicines' ? 'Medicines' : activeTab === 'analytics' ? 'Analytics' : 'Inventory Logs'}
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        flex: 1,
        pt: { xs: '56px', md: 0 },
        pl: { xs: 0, md: '300px' },
        position: 'relative'
      }}>
        {/* Desktop Sidebar */}
        <Box
          component="nav"
          sx={{
            width: { md: 300 },
            flexShrink: { md: 0 },
            display: { xs: 'none', md: 'block' },
            position: 'fixed',
            left: 0,
            top: 0,
            height: '100vh',
            overflowY: 'auto',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            zIndex: 1
          }}
          aria-label="mailbox folders"
        >
          {drawer}
        </Box>
        
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box',
              width: 280,
              borderRight: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper'
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Main Content */}
        <Box 
          component="main"
          sx={{ 
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            width: '100%',
            maxWidth: '1400px',
            mx: 'auto',
            mb: { xs: 7, md: 0 },
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          {/* Main Content Area */}
          <Box sx={{ width: '100%' }}>
            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <SummaryCard
                  title="Total Medicines"
                  value={medicines.length}
                  icon={InventoryIcon}
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <SummaryCard
                  title="Low Stock"
                  value={medicines.filter(m => m.quantity <= m.lowStockThreshold).length}
                  icon={WarningIcon}
                  color="warning"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <SummaryCard
                  title="Expiring Soon"
                  value={medicines.filter(m => {
                    const expiryDate = new Date(m.expiryDate);
                    const today = new Date();
                    const diffTime = expiryDate - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays <= 30 && diffDays >= 0;
                  }).length}
                  icon={CalendarIcon}
                  color="error"
                />
              </Grid>
            </Grid>

            {/* Search and Action Bar */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
              <TextField
                placeholder="Search medicines..."
                variant="outlined"
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  maxWidth: { sm: 400 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                  },
                }}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddMedicineDialog}
                  sx={{
                    borderRadius: 2,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                      transition: 'all 0.2s ease-in-out'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  Add Medicine
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportCSV}
                  sx={{
                    borderRadius: 2,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      borderColor: 'primary.main',
                      bgcolor: 'primary.light',
                      transition: 'all 0.2s ease-in-out'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  Export CSV
                </Button>
              </Box>
            </Box>

            {/* Content */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1, sm: 2 },
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                mb: 3
              }}
            >
              {activeTab === 'medicines' ? (
                <MedicineList
                  medicines={medicines}
                  onEdit={handleEditMedicine}
                  onDelete={handleDeleteMedicine}
                />
              ) : activeTab === 'analytics' ? (
                <DashboardAnalytics medicines={medicines} />
              ) : (
                <InventoryLogs />
              )}
            </Paper>
          </Box>
          
          {/* Bottom Navigation for Mobile */}
          <Box sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            display: { xs: 'block', md: 'none' },
            zIndex: 10,
            boxShadow: '0 -2px 10px 0 rgba(0,0,0,0.1)'
          }}>
            <BottomNavigation
              value={bottomNavValue}
              onChange={(event, newValue) => {
                setBottomNavValue(newValue);
                setActiveTab(newValue);
              }}
              sx={{
                bgcolor: 'background.paper',
                '& .MuiBottomNavigationAction-root': {
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    transform: 'scale(1.1)',
                    transition: 'all 0.2s ease-in-out'
                  },
                  transition: 'all 0.2s ease-in-out'
                },
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.75rem',
                  '&.Mui-selected': {
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: theme.palette.primary.main
                  }
                }
              }}
            >
              <BottomNavigationAction
                value="medicines"
                label="Medicines"
                icon={<InventoryIcon />}
              />
              <BottomNavigationAction
                value="analytics"
                label="Analytics"
                icon={<AnalyticsIcon />}
              />
              <BottomNavigationAction
                value="logs"
                label="Logs"
                icon={<ListIcon />}
              />
            </BottomNavigation>
          </Box>
        </Box>
      </Box>

      {/* Medicine Form Dialog */}
      <MedicineForm
        open={isMedicineDialogOpen}
        onClose={handleCloseMedicineDialog}
        medicine={editingMedicine}
        onAddMedicine={handleAddMedicine}
        onUpdateMedicine={handleUpdateMedicine}
      />
    </Box>
  );
};

export default Dashboard;
