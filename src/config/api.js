const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-render-backend-url';

export const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  
  // Medicine endpoints
  MEDICINES: `${API_BASE_URL}/api/medicines`,
  MEDICINE_BY_ID: (id) => `${API_BASE_URL}/api/medicines/${id}`,
  
  // Inventory log endpoints
  INVENTORY_LOGS: `${API_BASE_URL}/api/inventory-logs`,
};

export default API_ENDPOINTS; 