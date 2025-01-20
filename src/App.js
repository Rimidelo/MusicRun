// src/App.js

import React from "react";
import { Routes, Route } from "react-router-dom";
import OpeningScreen from "./components/OpeningScreen/OpeningScreen";
import GameScreen from "./components/GameScreen/GameScreen";
import LevelScreen from "./components/LevelScreen/LevelScreen";
import ScoreDisplay from "./components/ScoreDisplay/ScoreDisplay";
import { CssBaseline } from "@mui/material";
import { GameProvider } from './context/GameContext'; // Import GameProvider

const App = () => {
  return (
    <GameProvider> {/* Wrap with GameProvider */}
      <CssBaseline />
      <Routes>
        <Route path="/" element={<OpeningScreen />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="/level/:levelId" element={<LevelScreen />} />
        <Route path="/score" element={<ScoreDisplay />} /> {/* New Route */}
      </Routes>
    </GameProvider>
  );
};

export default App;
