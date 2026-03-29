import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { ClerkProviderWrapper } from './components/auth/ClerkProviderWrapper';
import Login from './pages/Login';
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
    <ClerkProviderWrapper>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<MainDashboard models={generatedModels} />} />
          <Route path="/3dplayground" element={<Playground3D setGeneratedModels={setGeneratedModels} />} />
          <Route path="/playground" element={<Upload />} />
          <Route path="/dashboard/game-select" element={<GameSelection models={generatedModels} />} />
          <Route path="/dashboard/game/:id" element={<GameViewer models={generatedModels} />} />
        </Routes>
      </Router>
    </ClerkProviderWrapper>
  );
}

export default App;
