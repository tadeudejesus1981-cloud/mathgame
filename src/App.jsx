import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import SomasGame from './pages/SomasGame';
import RestasGame from './pages/RestasGame';
import MultiplicacionGame from './pages/MultiplicacionGame';
import DivisionGame from './pages/DivisionGame';
import Leaderboard from './pages/Leaderboard';
import Tablas from './pages/Tablas';
import Romanos from './pages/Romanos';
import ProblemasGame from './pages/ProblemasGame';

import FormasGame from './pages/FormasGame';
import MemoriaGame from './pages/MemoriaGame';

function App() {
  const [player, setPlayer] = useState(() => {
    const saved = localStorage.getItem('mateAppPlayer');
    return saved ? JSON.parse(saved) : null;
  });

  const [difficulty, setDifficulty] = useState(() => {
    return localStorage.getItem('mateAppDifficulty') || 'medio';
  });

  useEffect(() => {
    if (player) {
      localStorage.setItem('mateAppPlayer', JSON.stringify(player));
    } else {
      localStorage.removeItem('mateAppPlayer');
    }
  }, [player]);

  useEffect(() => {
    localStorage.setItem('mateAppDifficulty', difficulty);
  }, [difficulty]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!player ? <Login onLogin={setPlayer} /> : <Navigate to="/" />} />
        <Route path="/" element={player ? <Home player={player} onLogout={() => setPlayer(null)} difficulty={difficulty} setDifficulty={setDifficulty} /> : <Navigate to="/login" />} />
        <Route path="/somas" element={player ? <SomasGame player={player} difficulty={difficulty} /> : <Navigate to="/login" />} />
        <Route path="/subtracoes" element={player ? <RestasGame player={player} difficulty={difficulty} /> : <Navigate to="/login" />} />
        <Route path="/multiplicacao" element={player ? <MultiplicacionGame player={player} difficulty={difficulty} /> : <Navigate to="/login" />} />
        <Route path="/divisao" element={player ? <DivisionGame player={player} difficulty={difficulty} /> : <Navigate to="/login" />} />
        <Route path="/tablas" element={player ? <Tablas player={player} /> : <Navigate to="/login" />} />
        <Route path="/romanos" element={player ? <Romanos player={player} /> : <Navigate to="/login" />} />
        <Route path="/problemas" element={player ? <ProblemasGame player={player} difficulty={difficulty} /> : <Navigate to="/login" />} />
        <Route path="/formas" element={player ? <FormasGame player={player} difficulty={difficulty} /> : <Navigate to="/login" />} />
        <Route path="/memoria" element={player ? <MemoriaGame player={player} difficulty={difficulty} /> : <Navigate to="/login" />} />
        <Route path="/ranking" element={player ? <Leaderboard player={player} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
