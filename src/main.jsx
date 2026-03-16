// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'
// import { BrowserRouter, Route, Routes } from 'react-router'
// import Dashboard from './pages/Dashboard'
// import Login from './pages/Login'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/india" element={<App />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//       </Routes>
//     </BrowserRouter>
//   </StrictMode>,
// )


import { AuthProvider } from '@/contexts/AuthContext';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Dubai from './pages/Dubai';
import DashboardUae from './pages/DashboardUae';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/india" replace />} />
          {/* <Route
            path="/"
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/uaedashboard"
            element={
              <ProtectedRoute>
                <DashboardUae />
              </ProtectedRoute>
            }
          />
          <Route
            path="/india"
            element={
              <ProtectedRoute requiredRole="india">
                <App />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dubai"
            element={
              <ProtectedRoute requiredRole="india">
                <Dubai />
              </ProtectedRoute>
            }
          />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);