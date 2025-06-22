import { saveAs } from "file-saver";
import { unparse } from "papaparse";
import React, { useEffect, useState, useCallback } from "react";
import api from "../config/api";
import MedicineForm from "../components/MedicineForm";
import MedicineList from "../components/MedicineList";
import InventoryLogs from "../components/InventoryLogs";
import BarcodeScanner from "../components/BarcodeScanner";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Stack,
  Divider,
  IconButton,
  Tooltip
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import DownloadIcon from "@mui/icons-material/Download";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

const Dashboard = () => {
  const [medicines, setMedicines] = useState([]);
  const [user, setUser] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // Fetch user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/api/auth/me");
        setUser(res.data);
      } catch (err) {
        // If unauthorized, force logout
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    if (token) fetchUser();
  }, [token, navigate]);

  const fetchMedicines = useCallback(async () => {
    try {
      const res = await api.get("/api/medicines");
      setMedicines(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (token) fetchMedicines();
  }, [token, fetchMedicines]);

  const addMedicine = (newMed) => setMedicines((prev) => [...prev, newMed]);
  const deleteMedicine = (id) => setMedicines((prev) => prev.filter((med) => med._id !== id));
  const updateMedicine = (updatedMed) => setMedicines((prev) =>
    prev.map((med) => (med._id === updatedMed._id ? updatedMed : med))
  );

  const handleScanComplete = async (barcode) => {
    try {
      const response = await api.get(`/api/medicines/barcode/${barcode}`);
      if (response.data) {
        // If medicine found, you can show a message or pre-fill a form
        alert(`Found medicine: ${response.data.name}`);
      } else {
        // If no medicine found, you can create a new one
        alert(`No medicine found with barcode: ${barcode}`);
        // You could open the MedicineForm with the barcode pre-filled
      }
    } catch (error) {
      console.error('Error searching for medicine:', error);
    }
  };

  const exportToCSV = () => {
    if (medicines.length === 0) {
      alert("No medicines to export.");
      return;
    }
    const sorted = [...medicines].sort(
      (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)
    );
    const csv = unparse(
      sorted.map(({ name, quantity, expiryDate }) => ({
        Name: name,
        Quantity: quantity,
        ExpiryDate: new Date(expiryDate).toISOString().split("T")[0],
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "medicines.csv");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Box minHeight="100vh" sx={{ background: "linear-gradient(120deg, #f8fafc 0%, #e0e7ef 100%)" }}>
      <Box display="flex" flexDirection={{ xs: "column", md: "row" }} maxWidth="1400px" mx="auto" py={4} px={{ xs: 1, md: 4 }} gap={4} minHeight="100vh">
        {/* Sidebar */}
        <Card sx={{ 
          flex: "0 0 220px", 
          minWidth: 180, 
          maxWidth: 240, 
          borderRadius: 3, 
          boxShadow: 6, 
          p: 2, 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "space-between", 
          height: { md: "calc(100vh - 4rem)" }, 
          position: { md: "sticky" }, 
          top: { md: 32 }, 
          mb: { xs: 2, md: 0 } 
        }}>
          {user && (
            <>
              <Box textAlign="center">
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: "primary.main",
                    mb: 2,
                    mx: "auto",
                    fontSize: 32,
                    fontWeight: "bold",
                    boxShadow: 3,
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  {user.name}
                </Typography>
                <Typography fontSize={15} color="#555" textAlign="center">
                  {user.email}
                </Typography>
              </Box>
              <Divider sx={{ my: 2, width: "100%" }} />
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<QrCodeScannerIcon />}
                onClick={() => setScannerOpen(true)}
                fullWidth
                sx={{ mb: 2, borderRadius: 2, boxShadow: 2, textTransform: "none" }}
              >
                Scan Barcode
              </Button>

              <Button
                onClick={exportToCSV}
                variant="contained"
                color="secondary"
                startIcon={<DownloadIcon />}
                fullWidth
                sx={{ mb: 2, borderRadius: 2, boxShadow: 2, textTransform: "none" }}
              >
                Export CSV
              </Button>

              <Button
                onClick={handleLogout}
                variant="contained"
                color="error"
                fullWidth
                startIcon={<LogoutIcon />}
                sx={{ fontWeight: 600, borderRadius: 2, boxShadow: 2, textTransform: "none" }}
              >
                Logout
              </Button>
            </>
          )}
        </Card>

        {/* Main Content */}
        <Box flex={1} display="flex" flexDirection="column" gap={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              Medicine Inventory
            </Typography>
            <Tooltip title="Scan Barcode">
              <IconButton 
                color="primary" 
                onClick={() => setScannerOpen(true)}
                sx={{ 
                  display: { xs: 'flex', md: 'none' },
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  }
                }}
              >
                <QrCodeScannerIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <MedicineForm onAddMedicine={addMedicine} />

          <Box>
            <Typography variant="h6" gutterBottom>
              Your Medicines
            </Typography>
            <MedicineList
              medicines={medicines}
              onDelete={deleteMedicine}
              onUpdate={updateMedicine}
            />
          </Box>

          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Inventory Logs
            </Typography>
            <InventoryLogs />
          </Box>
        </Box>
      </Box>

      {/* Barcode Scanner Dialog */}
      <BarcodeScanner 
        open={scannerOpen} 
        onClose={() => setScannerOpen(false)} 
        onScan={handleScanComplete} 
      />
    </Box>
  );
};

export default Dashboard;