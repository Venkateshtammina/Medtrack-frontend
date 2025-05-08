import React, { useState } from "react";
import api from "../config/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const MedicineList = ({ medicines, onDelete, onUpdate }) => {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showBanner, setShowBanner] = useState(true);
  const [editedMedicine, setEditedMedicine] = useState({
    name: "",
    quantity: "",
    expiryDate: "",
  });

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/medicines/${id}`);
      onDelete(id);
    } catch (err) {
      alert("Failed to delete medicine ❌");
      console.error(err);
    }
  };

  const handleEditClick = (med) => {
    setEditingId(med._id);
    setEditedMedicine({
      name: med.name,
      quantity: med.quantity,
      expiryDate: med.expiryDate.slice(0, 10),
    });
  };

  const handleEditChange = (e) => {
    setEditedMedicine({ ...editedMedicine, [e.target.name]: e.target.value });
  };

  const handleEditSave = async (id) => {
    try {
      const res = await api.put(`/api/medicines/${id}`, editedMedicine);
      onUpdate(res.data);
      setEditingId(null);
    } catch (err) {
      alert("Failed to update medicine ❌");
      console.error(err);
    }
  };

  const exportToCSV = () => {
    const csvHeader = ["Name", "Quantity", "Expiry Date"];
    const sorted = [...medicines].sort(
      (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)
    );
    const csvRows = sorted.map((med) => [
      med.name,
      med.quantity,
      med.expiryDate.slice(0, 10),
    ]);
    const csvContent = [csvHeader, ...csvRows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "medicines.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Medicine Inventory", 14, 22);

    const sorted = [...medicines].sort(
      (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)
    );
    const tableData = sorted.map((med) => [
      med.name,
      med.quantity,
      med.expiryDate.slice(0, 10),
    ]);

    autoTable(doc, {
      startY: 30,
      head: [["Name", "Quantity", "Expiry Date"]],
      body: tableData,
      styles: { fontSize: 12 },
      headStyles: { fillColor: [33, 150, 243] },
    });

    doc.save("medicines.pdf");
  };

  const today = new Date();
  const soonExpiring = medicines.filter((med) => {
    const expiry = new Date(med.expiryDate);
    return (
      expiry >= today &&
      expiry <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    );
  });

  const filtered = medicines
    .filter((med) =>
      med.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

  return (
    <div>
      <h2>Medicine Inventory</h2>

      {showBanner && soonExpiring.length > 0 && (
        <div
          style={{
            backgroundColor: "#fff3cd",
            color: "#856404",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ffeeba",
            marginBottom: "1rem",
            position: "relative",
          }}
        >
          ⚠️ You have {soonExpiring.length} medicine(s) expiring in the next 7 days:
          <ul style={{ marginTop: "5px" }}>
            {soonExpiring.map((med) => (
              <li key={med._id}>
                <strong>{med.name}</strong> — Exp:{" "}
                {new Date(med.expiryDate).toLocaleDateString()}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setShowBanner(false)}
            style={{
              position: "absolute",
              top: "5px",
              right: "10px",
              background: "transparent",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            title="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      <input
        type="text"
        placeholder="Search medicine..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "8px",
          marginBottom: "1rem",
          width: "100%",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />

      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={exportToCSV}
          style={{
            padding: "10px 15px",
            backgroundColor: "#43a047",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          ⬇️ Export to CSV
        </button>
        <button
          onClick={exportToPDF}
          style={{
            padding: "10px 15px",
            backgroundColor: "#1e88e5",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          🧾 Export to PDF
        </button>
      </div>

      {filtered.length === 0 ? (
        <p>No medicines found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filtered.map((med) => {
            const expiry = new Date(med.expiryDate);
            const isExpired = expiry < today;
            const isExpiringSoon =
              expiry >= today &&
              expiry <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            const isEditing = editingId === med._id;

            return (
              <li
                key={med._id}
                style={{
                  marginBottom: "10px",
                  borderBottom: "1px solid #ccc",
                  paddingBottom: "10px",
                  backgroundColor: isExpired
                    ? "#ffebee"
                    : isExpiringSoon
                    ? "#fff8e1"
                    : "transparent",
                  color: isExpired
                    ? "#b71c1c"
                    : isExpiringSoon
                    ? "#ff6f00"
                    : "black",
                  padding: "10px",
                  borderRadius: "5px",
                }}
              >
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={editedMedicine.name}
                      onChange={handleEditChange}
                      placeholder="Name"
                      style={{ marginRight: "10px" }}
                    />
                    <input
                      type="number"
                      name="quantity"
                      value={editedMedicine.quantity}
                      onChange={handleEditChange}
                      placeholder="Quantity"
                      style={{ marginRight: "10px" }}
                    />
                    <input
                      type="date"
                      name="expiryDate"
                      value={editedMedicine.expiryDate}
                      onChange={handleEditChange}
                      style={{ marginRight: "10px" }}
                    />
                    <button onClick={() => handleEditSave(med._id)}>
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      style={{ marginLeft: "5px" }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <strong>
                      {isExpired
                        ? "❌ "
                        : isExpiringSoon
                        ? "⚠️ "
                        : ""}
                      {med.name}
                    </strong>{" "}
                    — {med.quantity} units — Exp:{" "}
                    {new Date(med.expiryDate).toLocaleDateString()}
                    <button
                      onClick={() => handleDelete(med._id)}
                      style={{
                        marginLeft: "10px",
                        backgroundColor: "#e53935",
                        color: "#fff",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: "3px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleEditClick(med)}
                      style={{
                        marginLeft: "5px",
                        backgroundColor: "#1565c0",
                        color: "#fff",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: "3px",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default MedicineList;
