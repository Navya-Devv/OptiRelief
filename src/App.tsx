import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PrioritySorting from './pages/PrioritySorting';
import RouteOptimization from './pages/RouteOptimization';
import SupplyPacking from './pages/SupplyPacking';
import VolunteerAssignment from './pages/VolunteerAssignment';
import RequestAnalyzer from './pages/RequestAnalyzer';
import MultiDispatch from './pages/MultiDispatch';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/priority" element={<PrioritySorting />} />
            <Route path="/routes" element={<RouteOptimization />} />
            <Route path="/supply" element={<SupplyPacking />} />
            <Route path="/volunteers" element={<VolunteerAssignment />} />
            <Route path="/analyzer" element={<RequestAnalyzer />} />
            <Route path="/dispatch" element={<MultiDispatch />} />
          </Routes>
        </Layout>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;