import { saveAs } from "file-saver";
import { unparse } from "papaparse";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import MedicineForm from "../components/MedicineForm";
import MedicineList from "../components/MedicineList";
import InventoryLogs from "../components/InventoryLogs";
import { useNavigate } from "react-router-dom";

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
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
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
      const res = await axios.get("http://localhost:5000/api/medicines", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedicines(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      }
    }
  }, [token, navigate]);

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
    <div style={styles.bg}>
      <div style={styles.mainContent}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          {user && (
            <>
              <div style={styles.userInfo}>
                <div style={styles.avatarSmall}>
                  {user.name
                    ? user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "U"}
                </div>
                <div style={styles.userNameSmall}>{user.name}</div>
                <div style={styles.userEmailSmall}>{user.email}</div>
              </div>
              <button onClick={handleLogout} style={styles.logoutBtnFixed}>
                🚪 Logout
              </button>
            </>
          )}
        </div>
        {/* Main Content */}
        <div style={styles.leftContent}>
          <h1 style={styles.logo}>🩺 MedTrack</h1>
          <button onClick={exportToCSV} style={styles.exportBtn}>
            ⬇️ Export All to CSV
          </button>
          <div style={styles.cards}>
            <div style={styles.card}>
              <MedicineForm onMedicineAdded={addMedicine} />
            </div>
            <div style={styles.card}>
              <MedicineList
                medicines={medicines}
                onDelete={deleteMedicine}
                onUpdate={updateMedicine}
              />
            </div>
            <div style={styles.card}>
              <InventoryLogs />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  bg: {
    minHeight: "100vh",
    background: "linear-gradient(120deg, #f8fafc 0%, #e0e7ef 100%)",
    fontFamily: "Poppins, Arial, sans-serif",
    padding: 0,
  },
  mainContent: {
    display: "flex",
    flexDirection: "row",
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "2rem 3vw",
    gap: "2rem",
    minHeight: "100vh",
  },
  leftContent: {
    flex: 3,
    display: "flex",
    flexDirection: "column",
  },
  logo: {
    color: "#185a9d",
    fontWeight: 700,
    fontSize: "2.2rem",
    letterSpacing: "1px",
    margin: "0 0 2rem 0",
  },
  exportBtn: {
    padding: "12px 20px",
    background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "1rem",
    marginBottom: "2rem",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    transition: "background 0.2s",
    alignSelf: "flex-start",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "2rem",
  },
  card: {
    background: "#fff",
    borderRadius: "18px",
    boxShadow: "0 4px 24px rgba(24,90,157,0.10)",
    padding: "2rem",
    marginBottom: "1.5rem",
    border: "1px solid #e0e7ef",
  },
  sidebar: {
    flex: "0 0 220px",
    minWidth: "180px",
    maxWidth: "240px",
    background: "rgba(255,255,255,0.7)",
    borderRadius: "24px",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    height: "calc(100vh - 4rem)",
    position: "sticky",
    top: "2rem",
    padding: "2rem 1rem 1rem 1rem",
    backdropFilter: "blur(8px)",
    border: "1px solid #e0e7ef",
  },
  userInfo: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "auto",
  },
  avatarSmall: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #43cea2 0%, #185a9d 100%)",
    color: "#fff",
    fontSize: "1.2rem",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "0.5rem",
    boxShadow: "0 2px 8px rgba(24,90,157,0.10)",
  },
  userNameSmall: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#185a9d",
    marginBottom: "0.1rem",
    textAlign: "center",
    wordBreak: "break-word",
  },
  userEmailSmall: {
    fontSize: "0.92rem",
    color: "#555",
    marginBottom: "0.5rem",
    textAlign: "center",
    wordBreak: "break-word",
  },
  logoutBtnFixed: {
    marginTop: "auto",
    padding: "12px 20px",
    background: "#e53935",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "1.1rem",
    cursor: "pointer",
    width: "100%",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    transition: "background 0.2s",
    alignSelf: "flex-end",
  },
};

export default Dashboard;
