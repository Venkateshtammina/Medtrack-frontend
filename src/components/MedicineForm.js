import React, { useState } from "react";
import api from "../config/api";

const MedicineForm = ({ onMedicineAdded }) => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to add medicines");
        return;
      }

      const res = await api.post("/api/medicines", {
        name,
        quantity: parseInt(quantity),
        expiryDate,
      });
      onMedicineAdded(res.data);
      setName("");
      setQuantity("");
      setExpiryDate("");
    } catch (err) {
      console.error("Error adding medicine:", err);
      setError(err.response?.data?.error || "Error adding medicine ❌");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: "#fff",
        padding: "22px",
        borderRadius: "8px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        maxWidth: "700px",
        margin: "0 auto",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          color: "#333",
          fontFamily: "'Roboto', sans-serif",
          fontSize: "1.8rem",
          marginBottom: "20px",
        }}
      >
        Add New Medicine
      </h2>
      {error && (
        <div
          style={{
            color: "#d32f2f",
            backgroundColor: "#ffebee",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "15px",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}
      <div style={{ marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="Medicine Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{
            width: "95%",
            padding: "12px 15px",
            fontSize: "1rem",
            borderRadius: "8px",
            border: "2px solid #4CAF50",
            marginBottom: "10px",
            outline: "none",
            transition: "all 0.3s ease",
          }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          min="1"
          style={{
            width: "95%",
            padding: "12px 15px",
            fontSize: "1rem",
            borderRadius: "8px",
            border: "2px solid #4CAF50",
            marginBottom: "10px",
            outline: "none",
            transition: "all 0.3s ease",
          }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          required
          min={new Date().toISOString().split("T")[0]}
          style={{
            width: "95%",
            padding: "12px 15px",
            fontSize: "1rem",
            borderRadius: "8px",
            border: "2px solid #4CAF50",
            outline: "none",
            transition: "all 0.3s ease",
          }}
        />
      </div>

      <button
        type="submit"
        style={{
          backgroundColor: "#4CAF50",
          color: "#fff",
          padding: "12px 20px",
          fontSize: "1rem",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          width: "100%",
          transition: "background-color 0.3s ease",
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#388E3C")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "#4CAF50")}
      >
        Add Medicine
      </button>
    </form>
  );
};

export default MedicineForm;
