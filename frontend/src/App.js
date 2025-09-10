import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import AdherentsList from './pages/Adherents/AdherentsList';
import AdherentDetail from './pages/Adherents/AdherentDetail';
import CotisationsList from './pages/Cotisations/CotisationsList';
import CotisationDetail from './pages/Cotisations/CotisationDetail';
import CotisationsMensuelles from './pages/CotisationsMensuelles/CotisationsMensuelles';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Router>
      <div className="flex min-h-screen bg-gray-100 overflow-hidden">
        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
          <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile menu button */}
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-2">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
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
