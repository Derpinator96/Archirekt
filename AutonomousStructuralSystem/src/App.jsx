import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { ClerkProviderWrapper } from './components/auth/ClerkProviderWrapper';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import MainDashboard from './pages/MainDashboard';
import Playground3D from './components/playgrounds/Playground3D';
import Upload from './components/playgrounds/Upload';
import GameViewer from './components/playgrounds/GameViewer';
import GameSelection from './pages/GameSelection';
import './App.css';

function App() {
  const [generatedModels, setGeneratedModels] = useState([]);

  useEffect(() => {
    // Initial fetch from SQLite database to hydrate state
    const hydrateModels = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/models');
        if (res.data) setGeneratedModels(res.data);
      } catch (err) {
        console.error("Hydration failed (Backend offline?):", err);
      }
    };
    hydrateModels();
  }, []);

  return (
    <Router>
      <ClerkProviderWrapper>
        <Routes>
          {/* Public / Auth Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Main Dashboard & Generation Flow */}
          <Route path="/dashboard" element={<MainDashboard models={generatedModels} />} />
          <Route path="/playground" element={<Playground3D setGeneratedModels={setGeneratedModels} />} />

          {/* Note: I changed the path for Upload to avoid colliding with Playground3D */}
          <Route path="/upload" element={<Upload />} /> 

          {/* Immersive 3D Game Viewer Flow */}
          <Route path="/dashboard/game-select" element={<GameSelection models={generatedModels} />} />
          <Route path="/dashboard/game/:id" element={<GameViewer models={generatedModels} />} />
      </Routes>
      </ClerkProviderWrapper>
    </Router>
  );
}

export default App;
