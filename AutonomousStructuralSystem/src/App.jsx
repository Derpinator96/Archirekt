import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProviderWrapper } from './components/auth/ClerkProviderWrapper';
import Login from './pages/Login';
import MainDashboard from './pages/MainDashboard';
import './App.css';

function App() {
  return (
    <ClerkProviderWrapper>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<MainDashboard />} />
        </Routes>
      </Router>
    </ClerkProviderWrapper>
  );
}

export default App;
