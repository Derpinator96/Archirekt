import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProviderWrapper } from './components/auth/ClerkProviderWrapper';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import MainDashboard from './pages/MainDashboard';
import Playground3D from './components/playgrounds/Playground3D';
import './App.css';

function App() {
  return (
    <Router>
      <ClerkProviderWrapper>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<MainDashboard />} />
          <Route path="/playground" element={<Playground3D />} />
        </Routes>
      </ClerkProviderWrapper>
    </Router>
  );
}

export default App;
