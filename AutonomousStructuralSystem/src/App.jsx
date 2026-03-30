import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ModelProvider } from './context/ModelContext';
import { ClerkProviderWrapper } from './components/auth/ClerkProviderWrapper';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import MainDashboard from './pages/MainDashboard';
import Playground3D from './components/playgrounds/Playground3D';
import Upload from './components/playgrounds/Upload';
import GameViewer from './components/playgrounds/GameViewer';
import GameSelection from './pages/GameSelection';
import Landing from './pages/landing';
import './App.css';

function App() {
  return (
    <Router>
      <ModelProvider>
        <ClerkProviderWrapper>
          <Routes>
          {/* Public / Auth Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

            {/* Main Dashboard & Generation Flow */}
            <Route path="/dashboard" element={<MainDashboard />} />
            
            {/* Playground 3D - Multi-route support */}
            <Route path="/playground" element={<Playground3D />} />
            <Route path="/3d/:modelId" element={<Playground3D />} />

            {/* Note: I changed the path for Upload to avoid colliding with Playground3D */}
            <Route path="/upload" element={<Upload />} /> 

            {/* Immersive 3D Game Viewer Flow */}
            <Route path="/dashboard/game-select" element={<GameSelection />} />
            <Route path="/dashboard/game/:id" element={<GameViewer />} />
          </Routes>
        </ClerkProviderWrapper>
      </ModelProvider>
    </Router>
  );
}

export default App;
