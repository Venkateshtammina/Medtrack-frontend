import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  InputAdornment,
  IconButton,
  Typography,
  Paper,
} from "@mui/material";
import QrCodeIcon from "@mui/icons-material/QrCode";
import AddIcon from "@mui/icons-material/Add";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const MedicineForm = ({ onAddMedicine }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: "",
    price: "",
    expiryDate: null,
    manufacturer: "",
    barcode: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, expiryDate: date }));
  };

  const generateBarcode = () => {
    // Generate a 12-digit barcode
    const barcode = "MED" + Math.floor(100000000 + Math.random() * 900000000).toString();
    setFormData((prev) => ({ ...prev, barcode }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.name || !formData.quantity || !formData.expiryDate) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      // Send data to backend
      const response = await fetch("/api/medicines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add medicine");
      }

      // Call the callback with the new medicine
      onAddMedicine(data);
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        quantity: "",
        price: "",
        expiryDate: null,
        manufacturer: "",
        barcode: "",
      });
    } catch (err) {
      setError(err.message || "An error occurred while adding the medicine");
      console.error("Error adding medicine:", err);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        padding: 3,
        borderRadius: 2,
        background: "white",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography
        variant="h5"
        component="h2"
        sx={{
          color: "#2c3e50",
          fontWeight: 600,
          marginBottom: 3,
          paddingBottom: 1,
          borderBottom: "2px solid #f0f2f5",
        }}
      >
        Add New Medicine
      </Typography>
      
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

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 3,
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
            label="Price (₹)"
            name="price"
            value={formData.price}
            onChange={handleChange}
            variant="outlined"
            size="small"
            inputProps={{ step: "0.01", min: 0 }}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
          />

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Expiry Date *"
              value={formData.expiryDate}
              onChange={handleDateChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  size="small"
                  required
                  variant="outlined"
                />
              )}
            />
          </LocalizationProvider>

          <TextField
            fullWidth
            label="Manufacturer"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleChange}
            variant="outlined"
            size="small"
          />

          <TextField
            fullWidth
            label="Barcode"
            name="barcode"
            value={formData.barcode}
            onChange={handleChange}
            variant="outlined"
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={generateBarcode}
                    edge="end"
                    aria-label="generate barcode"
                  >
                    <QrCodeIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            helperText="Click the QR code icon to generate a barcode"
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              padding: "8px 24px",
              borderRadius: 2,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              "&:hover": {
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              },
            }}
          >
            Add Medicine
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default MedicineForm;