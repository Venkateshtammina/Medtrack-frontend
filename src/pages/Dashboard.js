import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { unparse } from 'papaparse';
import api from '../config/api';
import MedicineForm from '../components/MedicineForm';
import MedicineList from '../components/MedicineList';
import InventoryLogs from '../components/InventoryLogs';
import SummaryCard from '../components/SummaryCard';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  Avatar, 
  Divider, 
  TextField, 
  InputAdornment,
  useTheme,
  alpha,
  Grid,
  Paper,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  Download as DownloadIcon,
  Logout as LogoutIcon,
  LocalHospital as LocalHospitalIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dashboard state
  const [medicines, setMedicines] = useState([]);
  const [activeTab, setActiveTab] = useState('medicines');
  const [isMedicineDialogOpen, setIsMedicineDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  
  // Get token from storage
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  // Fetch user data
  const fetchUser = React.useCallback(async () => {
    try {
      const res = await api.get("/api/auth/me");
      setUser(res.data);
      setIsAuthenticated(true);
      
      // Show welcome message if redirected from login
      if (location.state?.from === 'login') {
        enqueueSnackbar(`Welcome back, ${res.data.name || 'User'}!`, { 
          variant: 'success',
          autoHideDuration: 3000
        });
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      navigate('/login', { 
        replace: true, 
        state: { 
          from: 'dashboard',
          message: 'Please log in to continue',
          severity: 'error'
        } 
      });
    } finally {
      setIsLoading(false);
    }
  }, [location.state, navigate, enqueueSnackbar]);

  // Fetch medicines data
  const fetchMedicines = React.useCallback(async () => {
    if (!token) return;
    
    try {
      const res = await api.get("/api/medicines");
      setMedicines(res.data);
    } catch (err) {
      console.error('Failed to fetch medicines:', err);
      if (err.response?.status === 401) {
        navigate("/login");
      }
    }
  }, [token, navigate]);

  // Check authentication status on component mount
  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true, state: { from: 'dashboard' } });
      return;
    }
    
    fetchUser();
  }, [token, navigate, fetchUser]);
  
  // Fetch medicines when token changes
  useEffect(() => {
    if (token) {
      fetchMedicines();
    }
  }, [token, fetchMedicines]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // If not authenticated, don't render anything (redirect will happen in the effect)
  if (!isAuthenticated) {
    return null;
  }

  const addMedicine = (newMed) => {
    setMedicines((prev) => [...prev, newMed]);
    enqueueSnackbar('Medicine added successfully!', { variant: 'success' });
  };

  const updateMedicine = (updatedMed) => {
    setMedicines((prev) =>
      prev.map((med) => (med._id === updatedMed._id ? updatedMed : med))
    );
    enqueueSnackbar('Medicine updated successfully!', { variant: 'success' });
  };

  const deleteMedicine = async (id) => {
    try {
      await api.delete(`/api/medicines/${id}`);
      setMedicines((prev) => prev.filter((med) => med._id !== id));
      enqueueSnackbar('Medicine deleted successfully!', { variant: 'success' });
    } catch (err) {
      console.error('Failed to delete medicine:', err);
      enqueueSnackbar('Failed to delete medicine', { variant: 'error' });
    }
  };

  const handleEditMedicine = (medicine) => {
    setEditingMedicine(medicine);
    setIsMedicineDialogOpen(true);
  };

  const handleAddMedicine = () => {
    setEditingMedicine(null);
    setIsMedicineDialogOpen(true);
  };

  const handleCloseMedicineDialog = () => {
    setIsMedicineDialogOpen(false);
    setEditingMedicine(null);
  };

  // Calculate summary stats
  const totalMedicines = medicines.length;
  const lowStockMedicines = medicines.filter(med => med.quantity < 10).length;
  const expiringSoon = medicines.filter(med => {
    const expiryDate = new Date(med.expiryDate);
    const today = new Date();
    const daysDiff = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    return daysDiff <= 30 && daysDiff >= 0;
  }).length;

  const exportToCSV = () => {
    if (medicines.length === 0) {
      alert("No medicines to export.");
      return;
    }
    try {
      const sorted = [...medicines].sort(
        (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)
      );
      
      // Convert to CSV format with headers
      const headers = ['Name', 'Quantity', 'ExpiryDate'];
      const csvData = sorted.map(({ name, quantity, expiryDate }) => ({
        Name: name,
        Quantity: quantity,
        ExpiryDate: new Date(expiryDate).toISOString().split('T')[0],
      }));
      
      // Convert to CSV string with headers
      let csvContent = unparse({
        fields: headers,
        data: csvData
      });
      
      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'medicines.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' },
      minHeight: '100vh', 
      bgcolor: 'background.default',
      p: { xs: 2, md: 4 },
      gap: 3
    }}>
      {/* Sidebar */}
      <Card sx={{ 
        flex: { xs: '0 0 auto', md: '0 0 300px' },
        height: 'fit-content',
        borderRadius: 3,
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
        background: theme.palette.background.paper,
        padding: 3,
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        position: { md: 'sticky' },
        top: { md: 32 },
        mb: { xs: 2, md: 0 }
      }}>
        <Box sx={{
          background: "linear-gradient(135deg, " + theme.palette.primary.main + " 0%, " + theme.palette.primary.dark + " 100%)",
          color: "white",
          padding: 3,
          textAlign: "center",
          mb: 3,
          borderRadius: 2,
          boxShadow: '0 4px 14px 0 ' + alpha(theme.palette.primary.main, 0.3)
        }}>
          <LocalHospitalIcon sx={{ 
            fontSize: 48, 
            mb: 1.5,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
          }} />
          <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: '0.5px' }}>
            MedTrack Pro
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            Intelligent Inventory Management
          </Typography>
        </Box>

        <Box sx={{ px: 1 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddMedicine}
            sx={{ 
              mb: 2, 
              borderRadius: 2, 
              py: 1.5, 
              textTransform: 'none', 
              fontWeight: 600,
              boxShadow: '0 4px 14px 0 ' + alpha(theme.palette.primary.main, 0.3),
              '&:hover': {
                boxShadow: '0 6px 20px 0 ' + alpha(theme.palette.primary.main, 0.4),
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Add Medicine
          </Button>

          <Button
            fullWidth
            variant="outlined"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={exportToCSV}
            sx={{ 
              mb: 3, 
              borderRadius: 2, 
              py: 1.5, 
              textTransform: 'none',
              fontWeight: 500,
              borderWidth: '1.5px',
              '&:hover': {
                borderWidth: '1.5px',
                backgroundColor: alpha(theme.palette.primary.main, 0.04)
              }
            }}
          >
            Export to CSV
          </Button>

          <Divider sx={{ my: 1, borderColor: 'divider' }} />

          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="subtitle2" color="textSecondary" sx={{ 
              mb: 1.5, 
              fontWeight: 600,
              px: 1.5,
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              color: theme.palette.text.secondary
            }}>
              Quick Navigation
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Button
                fullWidth
                variant={activeTab === 'medicines' ? 'contained' : 'text'}
                color={activeTab === 'medicines' ? 'primary' : 'inherit'}
                startIcon={<InventoryIcon />}
                onClick={() => setActiveTab('medicines')}
                sx={{ 
                  justifyContent: 'flex-start',
                  borderRadius: 2,
                  py: 1.25,
                  px: 2,
                  textTransform: 'none',
                  fontWeight: activeTab === 'medicines' ? 600 : 400,
                  bgcolor: activeTab === 'medicines' ? 'primary.light' : 'transparent',
                  color: activeTab === 'medicines' ? 'primary.contrastText' : 'text.primary',
                  '&:hover': { 
                    bgcolor: activeTab === 'medicines' ? 'primary.dark' : 'action.hover',
                    boxShadow: activeTab === 'medicines' ? '0 4px 12px 0 ' + alpha(theme.palette.primary.main, 0.3) : 'none'
                  },
                  transition: 'all 0.2s ease',
                  '& .MuiButton-startIcon': {
                    color: activeTab === 'medicines' ? 'white' : theme.palette.text.secondary
                  }
                }}
              >
                All Medicines
                <Box sx={{ flexGrow: 1 }} />
                <Box sx={{
                  bgcolor: activeTab === 'medicines' ? 'rgba(255,255,255,0.2)' : 'action.selected',
                  color: activeTab === 'medicines' ? 'white' : 'text.secondary',
                  px: 1.25,
                  py: 0.25,
                  borderRadius: 10,
                  fontSize: '0.7rem',
                  fontWeight: 600
                }}>
                  {totalMedicines}
                </Box>
              </Button>

              <Button
                fullWidth
                variant={activeTab === 'low-stock' ? 'contained' : 'text'}
                color={activeTab === 'low-stock' ? 'warning' : 'inherit'}
                startIcon={<WarningIcon />}
                onClick={() => setActiveTab('low-stock')}
                sx={{ 
                  justifyContent: 'flex-start',
                  borderRadius: 2,
                  py: 1.25,
                  px: 2,
                  textTransform: 'none',
                  fontWeight: activeTab === 'low-stock' ? 600 : 400,
                  bgcolor: activeTab === 'low-stock' ? 'warning.light' : 'transparent',
                  color: activeTab === 'low-stock' ? 'warning.contrastText' : 'text.primary',
                  '&:hover': { 
                    bgcolor: activeTab === 'low-stock' ? 'warning.dark' : 'action.hover',
                    boxShadow: activeTab === 'low-stock' ? '0 4px 12px 0 ' + alpha(theme.palette.warning.main, 0.3) : 'none'
                  },
                  transition: 'all 0.2s ease',
                  '& .MuiButton-startIcon': {
                    color: activeTab === 'low-stock' ? 'white' : theme.palette.warning.main
                  }
                }}
              >
                Low Stock
                <Box sx={{ flexGrow: 1 }} />
                <Box sx={{
                  bgcolor: activeTab === 'low-stock' ? 'rgba(255,255,255,0.2)' : 'rgba(255,152,0,0.1)',
                  color: activeTab === 'low-stock' ? 'white' : 'warning.dark',
                  px: 1.25,
                  py: 0.25,
                  borderRadius: 10,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  minWidth: 24,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  {lowStockMedicines}
                </Box>
              </Button>

              <Button
                fullWidth
                variant={activeTab === 'expiring' ? 'contained' : 'text'}
                color={activeTab === 'expiring' ? 'error' : 'inherit'}
                startIcon={<CalendarIcon />}
                onClick={() => setActiveTab('expiring')}
                sx={{ 
                  justifyContent: 'flex-start',
                  borderRadius: 2,
                  py: 1.25,
                  px: 2,
                  textTransform: 'none',
                  fontWeight: activeTab === 'expiring' ? 600 : 400,
                  bgcolor: activeTab === 'expiring' ? 'error.light' : 'transparent',
                  color: activeTab === 'expiring' ? 'error.contrastText' : 'text.primary',
                  '&:hover': { 
                    bgcolor: activeTab === 'expiring' ? 'error.dark' : 'action.hover',
                    boxShadow: activeTab === 'expiring' ? '0 4px 12px 0 ' + alpha(theme.palette.error.main, 0.3) : 'none'
                  },
                  transition: 'all 0.2s ease',
                  '& .MuiButton-startIcon': {
                    color: activeTab === 'expiring' ? 'white' : theme.palette.error.main
                  }
                }}
              >
                Expiring Soon
                <Box sx={{ flexGrow: 1 }} />
                <Box sx={{
                  bgcolor: activeTab === 'expiring' ? 'rgba(255,255,255,0.2)' : 'rgba(244,67,54,0.1)',
                  color: activeTab === 'expiring' ? 'white' : 'error.main',
                  px: 1.25,
                  py: 0.25,
                  borderRadius: 10,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  minWidth: 24,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  {expiringSoon}
                </Box>
              </Button>

              <Button
                fullWidth
                variant={activeTab === 'inventory' ? 'contained' : 'text'}
                color={activeTab === 'inventory' ? 'info' : 'inherit'}
                startIcon={<InventoryIcon />}
                onClick={() => setActiveTab('inventory')}
                sx={{ 
                  justifyContent: 'flex-start',
                  borderRadius: 2,
                  py: 1.25,
                  px: 2,
                  textTransform: 'none',
                  fontWeight: activeTab === 'inventory' ? 600 : 400,
                  bgcolor: activeTab === 'inventory' ? 'info.light' : 'transparent',
                  color: activeTab === 'inventory' ? 'info.contrastText' : 'text.primary',
                  '&:hover': { 
                    bgcolor: activeTab === 'inventory' ? 'info.dark' : 'action.hover',
                    boxShadow: activeTab === 'inventory' ? '0 4px 12px 0 ' + alpha(theme.palette.info.main, 0.3) : 'none'
                  },
                  transition: 'all 0.2s ease',
                  '& .MuiButton-startIcon': {
                    color: activeTab === 'inventory' ? 'white' : theme.palette.info.main
                  }
                }}
              >
                Inventory Logs
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 2, borderColor: 'divider' }} />

          <Box sx={{ mt: 'auto', pt: 1 }}>
            {user && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2.5,
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'action.hover',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'action.selected',
                  transform: 'translateY(-1px)'
                }
              }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    width: 40, 
                    height: 40,
                    mr: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px 0 ' + alpha(theme.palette.primary.main, 0.3)
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
                <Box sx={{ overflow: 'hidden' }}>
                  <Typography variant="subtitle2" fontWeight={600} noWrap>
                    {user.name || 'User'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" noWrap>
                    {user.email || 'user@example.com'}
                  </Typography>
                </Box>
              </Box>
            )}
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ 
                borderRadius: 2, 
                py: 1.25, 
                textTransform: 'none',
                fontWeight: 500,
                borderWidth: '1.5px',
                '&:hover': {
                  backgroundColor: 'error.light',
                  color: 'error.contrastText',
                  borderWidth: '1.5px',
                  boxShadow: '0 4px 12px 0 ' + alpha(theme.palette.error.main, 0.2)
                },
                transition: 'all 0.2s ease'
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Main Content */}
      <Box flex={1} display="flex" flexDirection="column" gap={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
            Medicine Inventory
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your medicine inventory efficiently
          </Typography>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <SummaryCard 
              title="Total Medicines" 
              value={totalMedicines} 
              icon={InventoryIcon} 
              color="primary" 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <SummaryCard 
              title="Low Stock" 
              value={lowStockMedicines} 
              icon={WarningIcon} 
              color="warning" 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <SummaryCard 
              title="Expiring Soon" 
              value={expiringSoon} 
              icon={CalendarIcon} 
              color="error" 
            />
          </Grid>
        </Grid>

        {/* Search and Filter */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search medicines..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { 
                borderRadius: 3,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'divider'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                  borderWidth: '1px'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderWidth: '1px'
                }
              }
            }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddMedicine}
            sx={{ 
              borderRadius: 3,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            Add Medicine
          </Button>
        </Box>

        {/* Content based on active tab */}
        <Paper 
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            background: theme.palette.background.paper,
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)'
          }}
        >
          {activeTab === 'medicines' && (
            <MedicineList 
              medicines={medicines} 
              onDelete={deleteMedicine} 
              onEdit={handleEditMedicine}
              onUpdate={updateMedicine}
              emptyMessage="No medicines found"
            />
          )}
          {activeTab === 'inventory' && <InventoryLogs token={token} />}
          {activeTab === 'low-stock' && (
            <MedicineList
              medicines={medicines.filter(med => med.quantity < 10)}
              onDelete={deleteMedicine}
              onEdit={handleEditMedicine}
              onUpdate={updateMedicine}
              emptyMessage="No low stock items found"
            />
          )}
          {activeTab === 'expiring' && (
            <MedicineList
              medicines={medicines.filter(med => {
                const expiryDate = new Date(med.expiryDate);
                const today = new Date();
                const daysDiff = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                return daysDiff <= 30 && daysDiff >= 0;
              })}
              onDelete={deleteMedicine}
              onUpdate={updateMedicine}
              emptyMessage="No medicines expiring soon"
            />
          )}
        </Paper>

        {/* Medicine Form Dialog */}
        <MedicineForm 
          open={isMedicineDialogOpen}
          onClose={handleCloseMedicineDialog}
          medicine={editingMedicine}
          onAddMedicine={addMedicine}
          onUpdateMedicine={updateMedicine}
        />
      </Box>
    </Box>
  );
};

export default Dashboard;