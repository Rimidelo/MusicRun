// src/context/GameContext.js

import React, { createContext, useState } from 'react';

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
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

  return (
    <GameContext.Provider
      value={{
        totalScore,
        missedObstacles,
        addScore,
        incrementMissedObstacles,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
