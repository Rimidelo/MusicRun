// src/components/ScoreDisplay/ScoreDisplay.js

import React, { useContext } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { GameContext } from '../../context/GameContext';
import { useNavigate } from 'react-router-dom';

const ScoreDisplay = () => {
  const { totalScore, missedObstacles, resetGame } = useContext(GameContext);
  const navigate = useNavigate();

  const handleRestart = () => {
    resetGame();
    navigate('/level/1'); // Restart from level 1
  };

  const handleHome = () => {
    resetGame();
    navigate('/'); // Go back to the opening screen
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        backgroundColor: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 2,
      }}
    >
      <Typography variant="h3" gutterBottom>
        Game Over
      </Typography>
      <Typography variant="h5">
        Total Score: {totalScore}
      </Typography>
      <Typography variant="h5">
        Missed Obstacles: {missedObstacles}
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRestart}
          sx={{ mr: 2 }}
        >
          Restart Game
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleHome}
        >
          Home
        </Button>
      </Box>
    </Box>
  );
};

export default ScoreDisplay;
