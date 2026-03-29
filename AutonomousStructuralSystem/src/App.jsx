import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProviderWrapper } from './components/auth/ClerkProviderWrapper';
import Login from './pages/Login';
import MainDashboard from './pages/MainDashboard';
import Playground3D from './components/playgrounds/Playground3D';
import './App.css';

function App() {
  return (
    <ClerkProviderWrapper>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<MainDashboard />} />
          <Route path="/playground" element={<Playground3D />} />
        </Routes>
      </Router>
    </ClerkProviderWrapper>
  );
}

export default App;
