import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import api from "../config/api";

const MedicineForm = ({ onAddMedicine, medicine, onUpdateMedicine, open, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: "",
    price: "",
    expiryDate: null,
    manufacturer: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when opening/closing or when medicine prop changes
  useEffect(() => {
    if (open) {
      if (medicine) {
        // If editing an existing medicine, populate the form with its data
        setFormData({
          name: medicine.name || "",
          description: medicine.description || "",
          quantity: medicine.quantity || "",
          price: medicine.price || "",
          expiryDate: medicine.expiryDate ? new Date(medicine.expiryDate) : null,
          manufacturer: medicine.manufacturer || "",
        });
      } else {
        // Reset form for new medicine
        setFormData({
          name: "",
          description: "",
          quantity: "",
          price: "",
          expiryDate: null,
          manufacturer: "",
        });
      }
      setError("");
    }
  }, [open, medicine]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, expiryDate: date }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Basic validation
    if (!formData.name || !formData.quantity || !formData.expiryDate) {
      setError("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare the data to send
      const dataToSend = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        quantity: Number(formData.quantity),
        price: formData.price ? Number(formData.price) : undefined,
        expiryDate: formData.expiryDate,
        manufacturer: formData.manufacturer.trim() || undefined,
      };

      let response;
      if (medicine && medicine._id) {
        // Update existing medicine using PATCH
        response = await api.patch(`/api/medicines/${medicine._id}`, dataToSend);
        if (onUpdateMedicine) {
          onUpdateMedicine(response.data);
        }
      } else {
        // Add new medicine
        response = await api.post("/api/medicines", dataToSend);
        if (onAddMedicine) {
          onAddMedicine(response.data);
        }
      }

      // Close the form on success
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error("Error saving medicine:", err);
      setError(err.response?.data?.message || "An error occurred while saving the medicine");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 2,
        }
      }}
    >
      <DialogTitle 
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          {medicine ? 'Edit Medicine' : 'Add New Medicine'}
        </Typography>
        <IconButton 
          onClick={onClose}
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
      
      {error && (
        <Box
          sx={{
            backgroundColor: "#ffebee",
            color: "#d32f2f",
            padding: 2,
            borderRadius: 1,
            marginBottom: 3,
          }}
        >
          {error}
        </Box>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
        {error && (
          <Box
            sx={{
              backgroundColor: "#ffebee",
              color: "#d32f2f",
              padding: 2,
              borderRadius: 1,
              marginBottom: 3,
              fontSize: '0.875rem',
            }}
          >
            {error}
          </Box>
        )}
        
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
            marginBottom: 3,
          }}
        >
          <TextField
            required
            fullWidth
            label="Medicine Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            variant="outlined"
            size="small"
          />
          
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            variant="outlined"
            size="small"
            multiline
            rows={1}
          />

          <TextField
            required
            fullWidth
            type="number"
            label="Quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            variant="outlined"
            size="small"
            inputProps={{ min: 1 }}
          />

          <TextField
            fullWidth
            type="number"
            label="Price (₹) - Optional"
            name="price"
            value={formData.price}
            onChange={handleChange}
            variant="outlined"
            size="small"
            inputProps={{ 
              step: "0.01", 
              min: 0,
              placeholder: 'Optional'
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
          />

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Expiry Date *"
              value={formData.expiryDate}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  required: true,
                  variant: 'outlined'
                }
              }}
            />
          </LocalizationProvider>

          <TextField
            fullWidth
            label="Manufacturer (Optional)"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleChange}
            variant="outlined"
            size="small"
            placeholder="Optional"
          />
        </Box>

        <DialogActions sx={{ px: 0, pb: 0, mt: 2 }}>
          <Button 
            onClick={onClose} 
            color="inherit"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={medicine ? <EditIcon /> : <AddIcon />}
            disabled={isSubmitting}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              padding: "6px 20px",
              borderRadius: 2,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              "&:hover": {
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              },
            }}
          >
            {medicine ? 'Update' : 'Add'} Medicine
            {isSubmitting && (
              <Box component="span" sx={{ ml: 1, display: 'inline-flex' }}>
                <CircularProgress size={20} color="inherit" />
              </Box>
            )}
          </Button>
        </DialogActions>
      </Box>
      </DialogContent>
    </Dialog>
  );
};

export default MedicineForm;