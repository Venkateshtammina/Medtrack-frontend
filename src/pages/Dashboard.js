import { saveAs } from "file-saver";
import { unparse } from "papaparse";
import React, { useEffect, useState, useCallback } from "react";
import api from "../config/api";
import MedicineForm from "../components/MedicineForm";
import MedicineList from "../components/MedicineList";
import InventoryLogs from "../components/InventoryLogs";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Stack,
  Divider
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import DownloadIcon from "@mui/icons-material/Download";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

const Dashboard = () => {
  const [medicines, setMedicines] = useState([]);
  const [user, setUser] = useState(null);
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
        <Card sx={{ flex: "0 0 220px", minWidth: 180, maxWidth: 240, borderRadius: 3, boxShadow: 6, p: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", height: { md: "calc(100vh - 4rem)" }, position: { md: "sticky" }, top: { md: 32 }, mb: { xs: 2, md: 0 } }}>
          {user && (
            <>
              <Stack alignItems="center" spacing={1} width="100%">
                <Avatar sx={{ width: 56, height: 56, bgcolor: "#185a9d", fontWeight: 700, fontSize: 24 }}>
                  {user.name
                    ? user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "U"}
                </Avatar>
                <Typography fontWeight={600} color="#185a9d" fontSize={18} textAlign="center">
                  {user.name}
                </Typography>
                <Typography fontSize={15} color="#555" textAlign="center">
                  {user.email}
                </Typography>
              </Stack>
              <Divider sx={{ my: 2, width: "100%" }} />
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
        <Box flex={3} display="flex" flexDirection="column" gap={3}>
          <Stack direction="row" alignItems="center" gap={1} mb={2}>
            <LocalHospitalIcon sx={{ color: "#185a9d", fontSize: 36 }} />
            <Typography variant="h4" fontWeight={700} color="#185a9d">
              MedTrack
            </Typography>
          </Stack>
          <Button
            onClick={exportToCSV}
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{
              width: "fit-content",
              mb: 2,
              background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "1rem",
              borderRadius: 2,
              boxShadow: 2,
              textTransform: "none",
              '&:hover': {
                background: "linear-gradient(90deg, #185a9d 0%, #43cea2 100%)"
              }
            }}
          >
            Export All to CSV
          </Button>
          <Stack direction={{ xs: "column", md: "row" }} gap={3}>
            <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 3, p: 2 }}>
              <MedicineForm onMedicineAdded={addMedicine} />
            </Card>
            <Card sx={{ flex: 2, borderRadius: 3, boxShadow: 3, p: 2 }}>
              <MedicineList
                medicines={medicines}
                onDelete={deleteMedicine}
                onUpdate={updateMedicine}
              />
            </Card>
            <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 3, p: 2 }}>
              <InventoryLogs />
            </Card>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
