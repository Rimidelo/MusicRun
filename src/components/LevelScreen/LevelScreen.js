// src/components/LevelScreen/LevelScreen.js

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import GameScreen from "../GameScreen/GameScreen";
import level1 from '../../assets/level1.mp3';
import level2 from '../../assets/level2.mp3';
import level3 from '../../assets/level3.mp3';

const songs = {
  1: level1,
  2: level2,
  3: level3,
  4: "/assets/level4.mp3",
};

const LevelScreen = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();

  const handleGameOver = (won) => {
    if (won) {
      if (parseInt(levelId) < 4) {
        navigate(`/level/${parseInt(levelId) + 1}`);
      } else {
        alert("Congratulations! You won the game!");
        navigate("/score"); // Navigate to ScoreDisplay after last level
      }
    } else {
      alert("Game Over. Redirecting to score page.");
      navigate("/score"); // Navigate to ScoreDisplay on game over
    }
  };

  return (
    <GameScreen
      song={songs[levelId]}
      level={levelId}
      onGameOver={handleGameOver}
    />
  );
};

export default LevelScreen;
