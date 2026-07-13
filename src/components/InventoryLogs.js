import React, { useEffect, useState } from "react";
import api from "../config/api";
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon,
  Update as UpdateIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const InventoryLogs = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/api/inventory-logs");
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const normalizeAction = (action) => action?.toLowerCase().replace(/\s+/g, ' ').trim();

  const getActionIcon = (action) => {
    const normalized = normalizeAction(action);
    if (normalized === 'added' || normalized === 'stock added') {
      return <AddIcon color="success" fontSize="small" />;
    }
    if (normalized === 'deleted') {
      return <DeleteIcon color="error" fontSize="small" />;
    }
    if (normalized === 'updated' || normalized === 'stock used') {
      return <UpdateIcon color="info" fontSize="small" />;
    }
    return null;
  };

  const getActionColor = (action) => {
    const normalized = normalizeAction(action);
    if (normalized === 'added' || normalized === 'stock added') {
      return 'success.main';
    }
    if (normalized === 'deleted') {
      return 'error.main';
    }
    if (normalized === 'updated' || normalized === 'stock used') {
      return 'info.main';
    }
    return 'text.primary';
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
        Inventory Logs
      </Typography>
      
      {logs.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">No inventory logs available</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Medicine</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log._id} hover>
                  <TableCell>
                    <Typography fontWeight={500}>{log.medicineName}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getActionIcon(log.action)}
                      <Typography 
                        sx={{ 
                          color: getActionColor(log.action),
                          textTransform: 'capitalize',
                          fontWeight: 500
                        }}
                      >
                        {log.action}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {log.quantity != null && (
                      <Typography variant="body2" color="text.secondary">
                        Qty: {log.quantity}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default InventoryLogs;
