import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';  
import { UserProvider } from './context/UserContext';
import App from './App';
import HomePage from './pages/Home';
import Dashboard from './pages/Dashboard';
import TeamSection from './pages/TeamSection';
import CreditsPage from './pages/CreditsPage';
import AdminSignup from './pages/AdminSignup';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/teamsection" element={<TeamSection />} />
            <Route path="/credits" element={<CreditsPage />} />
            <Route path="/admin-signup" element={<AdminSignup />} />
            
            
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  </React.StrictMode>
);
