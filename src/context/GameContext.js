// src/context/GameContext.js

import React, { createContext, useState } from 'react';

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const MAX_MISSES = 15; // Maximum allowed missed obstacles
  const [totalScore, setTotalScore] = useState(0);
  const [missedObstacles, setMissedObstacles] = useState(0);

  const addScore = (points) => {
    setTotalScore((prev) => prev + points);
  };

  const incrementMissedObstacles = () => {
    setMissedObstacles((prev) => prev + 1);
  };

  const resetGame = () => {
    setTotalScore(0);
    setMissedObstacles(0);
  };

  const remainingMisses = MAX_MISSES - missedObstacles;

  return (
    <GameContext.Provider
      value={{
        totalScore,
        missedObstacles,
        remainingMisses, // Exposed to components
        addScore,
        incrementMissedObstacles,
        resetGame,
        MAX_MISSES, // Optional: Expose if needed elsewhere
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
