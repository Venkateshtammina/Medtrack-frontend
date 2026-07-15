import React, { memo, useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import MedicationIcon from "@mui/icons-material/Medication";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import api from "../config/api";

const emptyForm = {
  name: "",
  description: "",
  quantity: "",
  price: "",
  expiryDate: null,
  manufacturer: "",
};

const MedicineForm = ({ onAddMedicine, medicine, onUpdateMedicine, open, onClose }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setFormData(medicine ? {
      name: medicine.name || "",
      description: medicine.description || "",
      quantity: medicine.quantity || "",
      price: medicine.price || "",
      expiryDate: medicine.expiryDate ? new Date(medicine.expiryDate) : null,
      manufacturer: medicine.manufacturer || "",
    } : emptyForm);
    setError("");
  }, [open, medicine]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleDateChange = useCallback((date) => {
    setFormData((current) => ({ ...current, expiryDate: date }));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.name.trim() || !formData.quantity || !formData.expiryDate) {
      setError("Enter the medicine name, quantity, and expiry date to continue.");
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSend = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        quantity: Number(formData.quantity),
        price: formData.price ? Number(formData.price) : undefined,
        expiryDate: formData.expiryDate,
        manufacturer: formData.manufacturer.trim() || undefined,
      };

      const response = medicine?._id
        ? await api.patch(`/api/medicines/${medicine._id}`, dataToSend)
        : await api.post("/api/medicines", dataToSend);

      if (medicine?._id) {
        onUpdateMedicine?.(response.data);
      } else {
        onAddMedicine?.(response.data);
      }
      onClose?.();
    } catch (err) {
      console.error("Error saving medicine:", err);
      setError(err.response?.data?.message || "Unable to save this medicine. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
      <DialogTitle sx={{ px: { xs: 2.5, sm: 3 }, py: 2.25, bgcolor: 'rgba(22, 119, 255, 0.035)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 38, height: 38, display: 'grid', placeItems: 'center', borderRadius: 2, bgcolor: 'primary.main', color: 'white' }}>
            <MedicationIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={750}>{medicine ? 'Edit medicine' : 'Add medicine'}</Typography>
            <Typography variant="caption" color="text.secondary">
              {medicine ? 'Update the stock and expiry details below.' : 'Add a medicine to keep inventory accurate.'}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} disabled={isSubmitting} aria-label="Close medicine form" size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent sx={{ px: { xs: 2.5, sm: 3 }, pt: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}

          <Typography variant="subtitle2" fontWeight={750} sx={{ mb: 1.5 }}>Medicine details</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
            <TextField required label="Medicine name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Paracetamol 500 mg" autoFocus fullWidth />
            <TextField label="Manufacturer" name="manufacturer" value={formData.manufacturer} onChange={handleChange} placeholder="Optional" fullWidth />
            <TextField label="Description" name="description" value={formData.description} onChange={handleChange} placeholder="Optional notes" fullWidth multiline rows={2} sx={{ gridColumn: { sm: '1 / -1' } }} />
          </Box>

          <Divider sx={{ mb: 2.5 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <CalendarMonthIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" fontWeight={750}>Stock and expiry</Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField required type="number" label="Quantity" name="quantity" value={formData.quantity} onChange={handleChange} inputProps={{ min: 1 }} helperText="Units currently in stock" fullWidth />
            <TextField type="number" label="Unit price (₹)" name="price" value={formData.price} onChange={handleChange} inputProps={{ step: '0.01', min: 0 }} helperText="Optional" InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} fullWidth />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Expiry date *"
                value={formData.expiryDate}
                onChange={handleDateChange}
                format="dd/MM/yyyy"
                slotProps={{
                  textField: { fullWidth: true, required: true, helperText: 'Format: DD/MM/YYYY' },
                  popper: { sx: { '& .MuiPickersDay-root': { fontSize: '0.875rem' } } },
                }}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: { xs: 2.5, sm: 3 }, py: 2.25, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={onClose} color="inherit" disabled={isSubmitting} sx={{ px: 2 }}>Cancel</Button>
          <Button type="submit" variant="contained" startIcon={medicine ? <EditIcon /> : <AddIcon />} disabled={isSubmitting} sx={{ px: 2.5 }}>
            {isSubmitting ? <CircularProgress size={20} color="inherit" /> : `${medicine ? 'Update' : 'Add'} medicine`}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default memo(MedicineForm);
