import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import OpeningScreen from "./components/OpeningScreen/OpeningScreen";
import GameScreen from "./components/GameScreen/GameScreen";
import LevelScreen from "./components/LevelScreen/LevelScreen";
import { CssBaseline } from "@mui/material";

const App = () => {
  return (
    <>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<OpeningScreen />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="/level/:levelId" element={<LevelScreen />} />
      </Routes>
    </>
  );
};

export default App;
