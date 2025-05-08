import React, { useEffect, useState } from "react";
import api from "../config/api";
import { useNavigate } from "react-router-dom";

const InventoryLogs = () => {
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get("/api/inventory-logs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch logs ❌", err);
      }
    };

    fetchLogs();
  }, [token]);

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>📜 Inventory Logs</h2>
      {logs.length === 0 ? (
        <p>No inventory logs available.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", padding: "10px" }}>Medicine</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "10px" }}>Action</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "10px" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id}>
                <td style={{ padding: "10px" }}>{log.medicineName}</td>
                <td style={{ padding: "10px", color: log.action === "deleted" ? "red" : log.action === "added" ? "green" : "orange" }}>
                  {log.action.toUpperCase()}
                </td>
                <td style={{ padding: "10px" }}>
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InventoryLogs;
