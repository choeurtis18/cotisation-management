import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import AdherentsList from './pages/Adherents/AdherentsList';
import AdherentDetail from './pages/Adherents/AdherentDetail';
import CotisationsList from './pages/Cotisations/CotisationsList';
import CotisationDetail from './pages/Cotisations/CotisationDetail';
import CotisationsMensuelles from './pages/CotisationsMensuelles/CotisationsMensuelles';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Navigate to="/adherents" replace />} />
            <Route path="/adherents" element={<AdherentsList />} />
            <Route path="/adherents/:id" element={<AdherentDetail />} />
            <Route path="/cotisations" element={<CotisationsList />} />
            <Route path="/cotisations/:id" element={<CotisationDetail />} />
            <Route path="/cotisations-mensuelles" element={<CotisationsMensuelles />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
