// 📁 frontend/src/pages/Dashboard.js
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
  Analytics as AnalyticsIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Archive as ArchiveIcon
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
  const [archivedMedicines, setArchivedMedicines] = useState([]);
  const [activeTab, setActiveTab] = useState('medicines');
  const [isMedicineDialogOpen, setIsMedicineDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [medicineQuickFilter, setMedicineQuickFilter] = useState('all');
  
  // Get token from storage
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Fetch medicines from API
  const fetchMedicines = async () => {
    try {
      const [activeResponse, archivedResponse] = await Promise.all([
        api.get('/api/medicines'),
        api.get('/api/medicines?archived=true'),
      ]);
      setMedicines(activeResponse.data);
      // Guard against legacy API responses that can include records without
      // an archive timestamp. Only the scheduler marks a medicine archived.
      setArchivedMedicines(archivedResponse.data.filter((medicine) => Boolean(medicine.archivedAt)));
    } catch (error) {
      enqueueSnackbar('Failed to fetch medicines', { variant: 'error' });
      console.error('Error fetching medicines:', error);
    }
  };

  // Load medicines and check authentication
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

  const handleSummaryCardClick = (filter) => {
    setMedicineQuickFilter(filter);
    setActiveTab('medicines');
    setBottomNavValue('medicines');
  };

  // Handle close medicine dialog
  const handleCloseMedicineDialog = () => {
    setIsMedicineDialogOpen(false);
    setEditingMedicine(null);
  };

  // Handle add medicine
  const handleAddMedicine = async (medicineData) => {
    try {
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box sx={{ width: 38, height: 38, borderRadius: 2.5, display: 'grid', placeItems: 'center', color: 'white', bgcolor: 'primary.main', boxShadow: '0 8px 18px rgba(22,119,255,.22)' }}>
          <LocalPharmacyIcon fontSize="small" />
        </Box>
        <Typography variant="h5" component="div" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.5px' }}>
          MedTrack
        </Typography>
      </Box>
      <Divider />
      <List sx={{ px: 1, py: 2 }}>
        <ListItem
          button
          onClick={() => setActiveTab('medicines')}
          sx={{
            borderRadius: 2.5,
            mb: 1,
            cursor: 'pointer',
            bgcolor: activeTab === 'medicines' ? 'primary.light' : 'transparent',
            color: activeTab === 'medicines' ? 'primary.dark' : 'text.primary',
            '&:hover': {
              bgcolor: activeTab === 'medicines' ? 'primary.light' : 'action.hover',
            },
            transition: 'all 0.2s'
          }}
        >
          <ListItemIcon sx={{ color: activeTab === 'medicines' ? 'primary.main' : 'inherit', minWidth: 40 }}>
            <InventoryIcon />
          </ListItemIcon>
          <ListItemText primary="Medicines" primaryTypographyProps={{ fontWeight: activeTab === 'medicines' ? 700 : 500 }} />
        </ListItem>
        <ListItem
          button
          onClick={() => setActiveTab('analytics')}
          sx={{
            borderRadius: 2.5,
            mb: 1,
            cursor: 'pointer',
            bgcolor: activeTab === 'analytics' ? 'primary.light' : 'transparent',
            color: activeTab === 'analytics' ? 'primary.dark' : 'text.primary',
            '&:hover': {
              bgcolor: activeTab === 'analytics' ? 'primary.light' : 'action.hover',
            },
            transition: 'all 0.2s'
          }}
        >
          <ListItemIcon sx={{ color: activeTab === 'analytics' ? 'primary.main' : 'inherit', minWidth: 40 }}>
            <AnalyticsIcon />
          </ListItemIcon>
          <ListItemText primary="Analytics Dashboard" primaryTypographyProps={{ fontWeight: activeTab === 'analytics' ? 700 : 500 }} />
        </ListItem>
        <ListItem
          button
          onClick={() => setActiveTab('logs')}
          sx={{
            borderRadius: 2.5,
            mb: 1,
            cursor: 'pointer',
            bgcolor: activeTab === 'logs' ? 'primary.light' : 'transparent',
            color: activeTab === 'logs' ? 'primary.dark' : 'text.primary',
            '&:hover': {
              bgcolor: activeTab === 'logs' ? 'primary.light' : 'action.hover',
            },
            transition: 'all 0.2s'
          }}
        >
          <ListItemIcon sx={{ color: activeTab === 'logs' ? 'primary.main' : 'inherit', minWidth: 40 }}>
            <ListIcon />
          </ListItemIcon>
          <ListItemText primary="Inventory Action Logs" primaryTypographyProps={{ fontWeight: activeTab === 'logs' ? 700 : 500 }} />
        </ListItem>
        <ListItem
          button
          onClick={() => setActiveTab('archive')}
          sx={{
            borderRadius: 2.5,
            mb: 1,
            cursor: 'pointer',
            bgcolor: activeTab === 'archive' ? 'primary.light' : 'transparent',
            color: activeTab === 'archive' ? 'primary.dark' : 'text.primary',
            '&:hover': { bgcolor: activeTab === 'archive' ? 'primary.light' : 'action.hover' },
            transition: 'all 0.2s'
          }}
        >
          <ListItemIcon sx={{ color: activeTab === 'archive' ? 'primary.main' : 'inherit', minWidth: 40 }}>
            <ArchiveIcon />
          </ListItemIcon>
          <ListItemText primary="Expired archive" primaryTypographyProps={{ fontWeight: activeTab === 'archive' ? 700 : 500 }} />
        </ListItem>
      </List>
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Button
          variant="outlined"
          fullWidth
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            borderRadius: 2.5,
            cursor: 'pointer',
            py: 1,
            fontWeight: 600
          }}
        >
          Logout Session
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      height: 'auto',
      bgcolor: '#FAFBFD',
    }}>
      <CssBaseline />
      
      {/* Mobile App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          display: { xs: 'flex', md: 'none' },
          boxShadow: '0 2px 10px 0 rgba(0,0,0,0.04)',
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider'
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
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            {activeTab === 'medicines' ? 'Medicines' : activeTab === 'analytics' ? 'Analytics' : activeTab === 'archive' ? 'Expired archive' : 'Inventory Logs'}
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        minHeight: '100vh',
        height: 'auto',
        pt: { xs: '56px', md: 0 },
        pl: { xs: 0, md: '300px' },
        position: 'relative',
        width: '100%'
      }}>
        {/* Desktop Sidebar Fixed */}
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
            zIndex: 10
          }}
        >
          {drawer}
        </Box>
        
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, 
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
        
        {/* Main Content Workspace - Dynamic Scrolling Allowed */}
        <Box 
          component="main"
          sx={{ 
            flexGrow: 1,
            p: { xs: 2, sm: 4, lg: 5 },
            width: '100%',
            maxWidth: '1400px',
            mx: 'auto',
            mb: { xs: 7, md: 0 },
            minHeight: '100vh',
            height: 'auto'
          }}
        >
          {/* Dynamic Render Context Wrapper */}
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
              <Box>
                <Typography variant="h4">
                  {activeTab === 'medicines' ? 'Medicine inventory' : activeTab === 'analytics' ? 'Inventory analytics' : activeTab === 'archive' ? 'Expired medicine archive' : 'Activity log'}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                  {activeTab === 'medicines' ? 'Monitor stock, expiry dates, and inventory health in one place.' : activeTab === 'analytics' ? 'Review your inventory status and upcoming expiry risks.' : activeTab === 'archive' ? 'Expired medicines are kept here for 30 days before permanent deletion.' : 'Review changes made to your medicine inventory.'}
                </Typography>
              </Box>
              <Box sx={{ px: 1.5, py: 0.75, borderRadius: 99, bgcolor: 'rgba(18, 183, 106, 0.10)', color: 'success.main', fontSize: 13, fontWeight: 700 }}>
                System online
              </Box>
            </Box>
            
            {/* Conditional Core Layout Banner: Hides baseline elements if Analytics tab is selected */}
            {activeTab === 'medicines' && (
              <>
                {/* Summary Cards Row */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={4}>
                    <SummaryCard
                      title="Total Medicines"
                      value={medicines.length}
                      icon={InventoryIcon}
                      color="primary"
                      onClick={() => handleSummaryCardClick('all')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <SummaryCard
                      title="Low Stock"
                      value={medicines.filter(m => m.quantity <= (m.lowStockThreshold || 10)).length}
                      icon={WarningIcon}
                      color="warning"
                      onClick={() => handleSummaryCardClick('lowStock')}
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
                      onClick={() => handleSummaryCardClick('expiringSoon')}
                    />
                  </Grid>
                </Grid>

                {/* Search and Action Row */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 2, mb: 4 }}>
                  <TextField
                    placeholder="Search medicines catalog..."
                    variant="outlined"
                    size="small"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      maxWidth: { sm: 400 },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                        bgcolor: 'background.paper',
                      },
                    }}
                  />
                  <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<AddIcon />}
                      onClick={handleOpenAddMedicineDialog}
                      sx={{
                        borderRadius: 2.5,
                        px: 3,
                        whiteSpace: 'nowrap',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Add Medicine
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<DownloadIcon />}
                      onClick={handleExportCSV}
                      sx={{
                        borderRadius: 2.5,
                        px: 3,
                        whiteSpace: 'nowrap',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Export CSV
                    </Button>
                  </Box>
                </Box>
              </>
            )}

            {/* Render Slot Panel Box */}
            <Box sx={{ width: '100%' }}>
              {activeTab === 'medicines' ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 4,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <MedicineList
                    medicines={medicines}
                    onEdit={handleEditMedicine}
                    onDelete={handleDeleteMedicine}
                    quickFilter={medicineQuickFilter}
                    onClearQuickFilter={() => setMedicineQuickFilter('all')}
                  />
                </Paper>
              ) : activeTab === 'analytics' ? (
                <DashboardAnalytics medicines={medicines} />
              ) : activeTab === 'archive' ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 4,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="subtitle1" fontWeight={750}>Archived medicines</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      These records are read-only and will be permanently deleted 30 days after archival.
                    </Typography>
                  </Box>
                  <MedicineList
                    medicines={archivedMedicines}
                    emptyMessage="No archived medicines"
                    readOnly
                    showArchiveDate
                  />
                </Paper>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 4,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <InventoryLogs />
                </Paper>
              )}
            </Box>
          </Box>
          
          {/* Mobile Bottom Navigation Bar */}
          <Box sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            display: { xs: 'block', md: 'none' },
            zIndex: 100,
            boxShadow: '0 -2px 10px 0 rgba(0,0,0,0.05)'
          }}>
            <BottomNavigation
              value={bottomNavValue}
              onChange={(event, newValue) => {
                setBottomNavValue(newValue);
                setActiveTab(newValue);
              }}
              sx={{
                bgcolor: 'background.paper',
                borderTop: '1px solid',
                borderColor: 'divider',
                '& .MuiBottomNavigationAction-root': {
                  cursor: 'pointer'
                },
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.75rem',
                  '&.Mui-selected': {
                    fontSize: '0.75rem',
                    fontWeight: 700,
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
              <BottomNavigationAction
                value="archive"
                label="Archive"
                icon={<ArchiveIcon />}
              />
            </BottomNavigation>
          </Box>
        </Box>
      </Box>

      {/* Pop-up Medicine Form Dialog Form Entry */}
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
