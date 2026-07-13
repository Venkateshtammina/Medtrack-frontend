# MedTrack Frontend — Operational Management Interface

The **MedTrack Frontend** is the modern, responsive web application for the MedTrack platform. Built with **React**, it provides an intuitive interface for healthcare operators to manage medicine inventory, monitor stock levels, visualize analytics, and securely interact with the MedTrack backend.

---

# Features

- Secure user authentication
- Responsive dashboard
- Medicine inventory management
- Real-time stock monitoring
- Interactive analytics and charts
- Batch expiry tracking
- Modern Material UI design
- Smooth page transitions and animations
- REST API integration
- Production-ready deployment with Vercel

---

# Repository Structure

```text
frontend/
├── public/                  # Static assets and application icons
├── src/
│   ├── components/
│   │   ├── auth/            # Authentication components
│   │   ├── dashboard/       # Dashboard widgets
│   │   ├── inventory/       # Inventory UI components
│   │   └── ...
│   ├── config/
│   │   └── api.js           # Axios API configuration
│   ├── pages/               # Application pages
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Dashboard.js
│   │   └── ...
│   ├── App.js               # Route configuration
│   └── index.js             # React entry point
├── package.json
└── vercel.json
```

---

# Tech Stack

- React 18
- React Router DOM
- Material UI (MUI v5)
- Axios
- React Hook Form
- Recharts
- Framer Motion
- JavaScript (ES6+)

---

# User Interface Architecture

## Healthcare-Centric Dashboard

The dashboard is designed around healthcare operations instead of traditional business metrics.

It provides visual indicators for:

- Low stock medicines
- Expiring batches
- Inventory levels
- Medicine availability
- Critical stock alerts
- Inventory trends

---

## Responsive Layout

The application uses flexible layouts to ensure compatibility across:

- Desktop
- Laptop
- Tablet
- Mobile devices

Instead of fixed-height layouts, components use responsive sizing with:

```css
min-height: 100vh;
height: auto;
```

This prevents content clipping and allows long inventory lists and analytics pages to scroll naturally.

---

## Registration Policy Modal

During account registration, users can review application policies without leaving the registration process.

The embedded modal provides:

- Privacy policy
- Terms and conditions
- Data handling information

This improves the user experience by keeping operators within the onboarding flow.

---

## Smooth Animations

The interface uses **Framer Motion** for:

- Page transitions
- Card animations
- Form step transitions
- Error feedback
- Dashboard interactions
- Modal animations

These animations enhance usability while maintaining a professional healthcare-focused interface.

---

# API Configuration

The frontend communicates with the backend through Axios.

Example configuration:

```javascript
import axios from "axios";

const api = axios.create({
    baseURL:
        process.env.REACT_APP_API_URL ||
        "http://localhost:5000",
    withCredentials: true,
});

export default api;
```

The API automatically connects to:

- Local backend during development
- Production backend using the `REACT_APP_API_URL` environment variable

---

# Local Development

## 1. Clone Repository

```bash
git clone <repository-url>
cd frontend
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file in the project root.

```env
REACT_APP_API_URL=http://localhost:5000
```

For production:

```env
REACT_APP_API_URL=https://your-backend.vercel.app
```

---

## 4. Start Development Server

```bash
npm start
```

The application will launch automatically at:

```
http://localhost:3000
```

with hot reloading enabled for development.

---

# Build for Production

Generate optimized production assets:

```bash
npm run build
```

This creates a `build/` directory containing:

- Minified JavaScript
- Optimized CSS
- Static assets
- Production-ready HTML

These files are suitable for deployment on Vercel or any static hosting provider.

---

# Major Components

## Authentication

- Login
- Registration
- OTP verification
- Password reset
- Protected routes

---

## Dashboard

- Inventory overview
- Low stock summary
- Expiry alerts
- Analytics cards
- Stock statistics

---

## Inventory

- Medicine list
- Search and filtering
- Add/Edit/Delete medicines
- Batch management
- Quantity updates

---

## Analytics

Interactive charts built with **Recharts** display:

- Stock distribution
- Inventory trends
- Expiry timelines
- Medicine availability
- Dashboard KPIs

---

# Project Architecture

```
User
   │
   ▼
React Application
   │
   ▼
React Router
   │
   ▼
UI Components
   │
   ▼
Axios API Client
   │
   ▼
MedTrack Backend API
   │
   ▼
MongoDB Atlas
```

---

# Deployment

## Vercel Deployment

Deploy the frontend using Vercel.

Ensure the following environment variable is configured:

```
REACT_APP_API_URL=https://your-backend.vercel.app
```

After updating environment variables:

1. Open the Vercel Dashboard
2. Navigate to **Settings → Environment Variables**
3. Add or update `REACT_APP_API_URL`
4. Save the changes
5. Redeploy the project

---

# Performance Optimizations

- Code splitting
- Lazy loading
- Optimized production builds
- Tree shaking
- Responsive layouts
- Hardware-accelerated animations
- Efficient API communication
- Component-based architecture

---

# Dependencies

| Package | Purpose |
|----------|---------|
| React 18 | User interface |
| React Router DOM | Client-side routing |
| Material UI | UI components |
| Axios | API communication |
| React Hook Form | Form management |
| Recharts | Analytics and charts |
| Framer Motion | Animations |

---

# Development Workflow

```bash
# Install packages
npm install

# Run development server
npm start

# Create production build
npm run build
```

---

# Deployment Checklist

- [ ] Backend deployed
- [ ] `REACT_APP_API_URL` configured
- [ ] Environment variables added
- [ ] Production build generated
- [ ] Vercel deployment completed
- [ ] Authentication tested
- [ ] Dashboard verified
- [ ] API connectivity confirmed
- [ ] Responsive layouts tested

---

# License

This project is intended for educational and production deployment purposes. Customize and extend it according to your application's requirements.

---

# Author

**MedTrack Frontend**

A modern React-based healthcare inventory management interface designed for secure authentication, responsive inventory tracking, analytics visualization, and seamless integration with the MedTrack backend.
