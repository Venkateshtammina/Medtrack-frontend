import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  IconButton,
  TablePagination,
  TableSortLabel,
  Tooltip,
  Box,
  Typography,
  Alert,
  Snackbar
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon, Close as CloseIcon, Search as SearchIcon, Warning as WarningIcon } from "@mui/icons-material";
import { format } from 'date-fns';

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

  // Filter and sort medicines
  const filtered = React.useMemo(() => {
    return medicines.filter(medicine => 
      medicine.name.toLowerCase().includes(search.toLowerCase()) ||
      (medicine.manufacturer && medicine.manufacturer.toLowerCase().includes(search.toLowerCase()))
    );
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
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search medicines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300, mb: 2 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleRequestSort('name')}
                >
                  Medicine Name
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'quantity'}
                  direction={orderBy === 'quantity' ? order : 'asc'}
                  onClick={() => handleRequestSort('quantity')}
                >
                  Quantity
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'expiryDate'}
                  direction={orderBy === 'expiryDate' ? order : 'asc'}
                  onClick={() => handleRequestSort('expiryDate')}
                >
                  Expiry Date
                </TableSortLabel>
              </TableCell>
              <TableCell>Manufacturer</TableCell>
              <TableCell>Price</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>

            {paginatedMedicines.map((medicine) => (
              <TableRow 
                key={medicine._id}
                hover
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  bgcolor: new Date(medicine.expiryDate) < new Date() ? 'rgba(255, 0, 0, 0.05)' : 'inherit'
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
                          bgcolor: 'warning.light',
                          color: 'warning.contrastText',
                          borderRadius: 1,
                          fontSize: '0.7rem',
                          fontWeight: 'bold'
                        }}
                      >
                        Low Stock
                      </Box>
                    )}
                  </Box>
                  {medicine.description && (
                    <Typography variant="body2" color="text.secondary">
                      {medicine.description}
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'medium' }}>
                  {medicine.quantity}
                </TableCell>
                <TableCell>
                  <Box sx={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    color: new Date(medicine.expiryDate) < new Date() ? 'error.main' : 'inherit'
                  }}>
                    {formatExpiryDate(medicine.expiryDate)}
                    {new Date(medicine.expiryDate) < new Date() && (
                      <Tooltip title="Expired">
                        <WarningIcon color="error" fontSize="small" sx={{ ml: 1 }} />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  {medicine.manufacturer || '-'}
                </TableCell>
                <TableCell>
                  {medicine.price ? `₹${parseFloat(medicine.price).toFixed(2)}` : '-'}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton 
                      onClick={() => handleEditClick(medicine)}
                      size="small"
                      color="primary"
                      sx={{ mr: 1 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton 
                      onClick={() => handleDelete(medicine._id)}
                      size="small"
                      color="error"
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
      />

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
