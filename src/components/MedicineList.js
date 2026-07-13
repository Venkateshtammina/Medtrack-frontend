import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  TablePagination,
  TableSortLabel,
  Tooltip,
  Box,
  Typography,
  Alert,
  Snackbar
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon, Search as SearchIcon, Warning as WarningIcon, Inventory2 as InventoryIcon } from "@mui/icons-material";
import { format } from 'date-fns';

const matchesSearch = (medicine, query) => {
  if (!query) return true;

  const searchableFields = [
    medicine.name,
    medicine.manufacturer,
    medicine.description,
    medicine.quantity?.toString(),
    medicine.price?.toString(),
  ];

  return searchableFields.some(
    (field) => field && field.toLowerCase().includes(query)
  );
};

const MedicineList = ({ 
  medicines = [], 
  onDelete, 
  onEdit,
  emptyMessage = "No medicines found" 
}) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('expiryDate');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      onDelete(id);
    }
  };

  const handleEditClick = (medicine) => {
    onEdit(medicine);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  useEffect(() => {
    setPage(0);
  }, [medicines.length]);

  // Filter and sort medicines
  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return medicines.filter((medicine) => matchesSearch(medicine, query));
  }, [medicines, search]);

  const sorted = React.useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (orderBy === 'expiryDate') {
        return order === 'asc' 
          ? new Date(a.expiryDate) - new Date(b.expiryDate)
          : new Date(b.expiryDate) - new Date(a.expiryDate);
      }
      if (orderBy === 'quantity') {
        return order === 'asc' 
          ? a.quantity - b.quantity 
          : b.quantity - a.quantity;
      }
      // Default sort by name
      return order === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });
  }, [filtered, order, orderBy]);

  // Pagination
  const paginatedMedicines = sorted.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const formatExpiryDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const isLowStock = (quantity) => quantity < 10;

  if (medicines.length === 0) {
    return (
      <Box sx={{ 
        p: 6, 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Box sx={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3
        }}>
          <InventoryIcon sx={{ fontSize: 64, color: '#667eea', opacity: 0.5 }} />
        </Box>
        <Typography variant="h6" color="textSecondary" sx={{ mb: 1, fontWeight: 600 }}>
          {emptyMessage}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ opacity: 0.7 }}>
          Add your first medicine to get started
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {filtered.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No medicines match &quot;{search.trim()}&quot;
          </Typography>
        </Box>
      ) : (
      <>
      <TableContainer 
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden'
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '& .MuiTableCell-root': {
                color: 'white !important',
                fontWeight: 700,
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderBottom: 'none',
                padding: '16px'
              }
            }}>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleRequestSort('name')}
                  sx={{
                    color: 'white !important',
                    '&.Mui-active': {
                      color: 'white !important'
                    },
                    '& .MuiTableSortLabel-icon': {
                      color: 'white !important'
                    }
                  }}
                >
                  Medicine Name
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'quantity'}
                  direction={orderBy === 'quantity' ? order : 'asc'}
                  onClick={() => handleRequestSort('quantity')}
                  sx={{
                    color: 'white !important',
                    '&.Mui-active': {
                      color: 'white !important'
                    },
                    '& .MuiTableSortLabel-icon': {
                      color: 'white !important'
                    }
                  }}
                >
                  Quantity
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'expiryDate'}
                  direction={orderBy === 'expiryDate' ? order : 'asc'}
                  onClick={() => handleRequestSort('expiryDate')}
                  sx={{
                    color: 'white !important',
                    '&.Mui-active': {
                      color: 'white !important'
                    },
                    '& .MuiTableSortLabel-icon': {
                      color: 'white !important'
                    }
                  }}
                >
                  Expiry Date
                </TableSortLabel>
              </TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>

            {paginatedMedicines.map((medicine, index) => (
              <TableRow 
                key={medicine._id}
                hover
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  bgcolor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.1)',
                    transform: 'scale(1.01)'
                  },
                  animation: `fadeIn 0.3s ease ${index * 0.05}s both`,
                  '@keyframes fadeIn': {
                    '0%': { opacity: 0, transform: 'translateY(10px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' }
                  }
                }}
              >
                <TableCell component="th" scope="row">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {medicine.name}
                    {isLowStock(medicine.quantity) && (
                      <Box 
                        component="span" 
                        sx={{
                          ml: 1,
                          px: 1,
                          py: 0.5,
                          background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                          color: 'white',
                          borderRadius: 2,
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)',
                          animation: 'pulse 2s infinite',
                          '@keyframes pulse': {
                            '0%, 100%': { opacity: 1 },
                            '50%': { opacity: 0.7 }
                          }
                        }}
                      >
                        Low Stock
                      </Box>
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                  fontSize: '0.95rem'
                }}>
                  {medicine.quantity}
                </TableCell>
                <TableCell>
                  <Box sx={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    color: new Date(medicine.expiryDate) < new Date() ? 'error.main' : 'text.primary',
                    fontWeight: 500
                  }}>
                    {formatExpiryDate(medicine.expiryDate)}
                    {new Date(medicine.expiryDate) < new Date() && (
                      <Tooltip title="Expired">
                        <WarningIcon color="error" fontSize="small" sx={{ ml: 1 }} />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ 
                  fontSize: '0.9rem',
                  color: 'text.secondary'
                }}>
                  {medicine.description || '-'}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton 
                      onClick={() => handleEditClick(medicine)}
                      size="small"
                      sx={{
                        color: '#667eea',
                        background: 'rgba(102, 126, 234, 0.1)',
                        mr: 1,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(102, 126, 234, 0.2)',
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton 
                      onClick={() => handleDelete(medicine._id)}
                      size="small"
                      sx={{
                        color: '#ef5350',
                        background: 'rgba(239, 83, 80, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(239, 83, 80, 0.2)',
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filtered.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          background: 'rgba(255, 255, 255, 0.5)',
          borderTop: '1px solid rgba(0, 0, 0, 0.05)',
          '& .MuiTablePagination-select': {
            borderRadius: 2
          },
          '& .MuiTablePagination-selectIcon': {
            color: '#667eea'
          },
          '& .MuiIconButton-root': {
            color: '#667eea',
            '&:hover': {
              background: 'rgba(102, 126, 234, 0.1)'
            }
          }
        }}
      />
      </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MedicineList;
