// src/components/GameScreen/GameScreen.js

import React, { useState, useEffect, useRef, useContext } from "react";
import { Box, Button, Typography } from "@mui/material";
import { Howl, Howler } from "howler";
import { GameContext } from '../../context/GameContext'; // Import GameContext

const ROWS = [30, 50, 70]; // Three fixed row positions

const GameScreen = ({ song, level, onGameOver }) => {
  const [playerRow, setPlayerRow] = useState(1); // Middle row by default
  const [isPlaying, setIsPlaying] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const soundRef = useRef(null);
  
  const {
    totalScore,
    addScore,
    incrementMissedObstacles,
    missedObstacles,
    remainingMisses, // Destructure remainingMisses
    MAX_MISSES,
  } = useContext(GameContext); // Destructure necessary functions and variables

  // Function to detect peaks in the music frequency
  const detectPeaks = () => {
    if (!analyserRef.current) return;

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const avgFreq =
      dataArrayRef.current.reduce((sum, value) => sum + value, 0) /
      dataArrayRef.current.length;
    console.log(avgFreq);

    if (avgFreq > 30) {  // Adjust the threshold for obstacle generation sensitivity
      console.log("Peak detected! Adding obstacle.");
      setObstacles((prevObstacles) => [
        ...prevObstacles,
        { id: Date.now(), position: 100, row: Math.floor(Math.random() * 3) },
      ]);
    }

    setTimeout(() => requestAnimationFrame(detectPeaks), 500); // Slower detection for better rhythm matching
  };

  // Function to start the game and play the music
  const startGame = () => {
    const sound = new Howl({
      src: [song],
      html5: true,
      autoplay: false,
      loop: false,
      volume: 0.5,
      onplay: () => {
        console.log("Music started!");

        const ctx = Howler.ctx;

        // Create the analyser only once
        if (!analyserRef.current) {
          analyserRef.current = ctx.createAnalyser();
          analyserRef.current.fftSize = 256;
          analyserRef.current.smoothingTimeConstant = 0.8;
          dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
        }

        // Connect the sound node to analyser directly
        const sourceNode = ctx.createMediaElementSource(sound._sounds[0]._node);
        sourceNode.connect(analyserRef.current);
        analyserRef.current.connect(ctx.destination);

        setTimeout(() => detectPeaks(), 1000);
      },
      onend: () => {
        console.log("Level completed!");
        if (soundRef.current) {
          soundRef.current.stop();
        }
        onGameOver(true); // Level completed successfully
      },
    });

    sound.play();
    soundRef.current = sound;
    setIsPlaying(true);
  };

  // Handle player movement in 3 rows
  const handlePlayerMove = (e) => {
    if (e.key === "ArrowUp" && playerRow > 0) {
      setPlayerRow(playerRow - 1);
    }
    if (e.key === "ArrowDown" && playerRow < ROWS.length - 1) {
      setPlayerRow(playerRow + 1);
    }
  };

  // Check collision and update score
  useEffect(() => {
    obstacles.forEach((obstacle) => {
      if (obstacle.position < 15 && obstacle.row === playerRow) {
        addScore(10); // Adds 10 points to totalScore
        setObstacles((prevObstacles) => prevObstacles.filter((o) => o.id !== obstacle.id));
      }
    });
  }, [obstacles, playerRow, addScore]);

  // Update obstacles movement
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setObstacles((prev) =>
          prev
            .map((obstacle) => ({
              ...obstacle,
              position: obstacle.position - 2,  // Adjust speed for better visibility
            }))
            .filter((obstacle) => {
              if (obstacle.position <= 0) {
                // Obstacle passed without being hit
                incrementMissedObstacles(); // Increments missedObstacles by 1
                return false;
              }
              return true;
            })
        );
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isPlaying, incrementMissedObstacles]);

  // Check if missedObstacles >= MAX_MISSES to trigger game over
  useEffect(() => {
    if (missedObstacles >= MAX_MISSES) {
      // Stop the music when the player fails
      if (soundRef.current) {
        soundRef.current.stop();
      }
      // alert("You missed too many obstacles. Game Over."); // Removed alert
      onGameOver(false); // Trigger game over
    }
  }, [missedObstacles, onGameOver, MAX_MISSES]);

  // Handle player movement event listeners
  useEffect(() => {
    if (isPlaying) {
      window.addEventListener("keydown", handlePlayerMove);
      return () => window.removeEventListener("keydown", handlePlayerMove);
    }
  }, [isPlaying, playerRow]);

  // Reset game state when level changes
  useEffect(() => {
    if (isPlaying) {
      if (soundRef.current) {
        soundRef.current.stop();
      }
      setIsPlaying(false);
      setObstacles([]);
      setPlayerRow(1); // Reset player to middle row
      // Optionally reset other states if necessary
    }
  }, [level]);

  // Cleanup on component unmount to stop music
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.stop();
      }
    };
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        backgroundColor: "black",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        flexDirection: "column",
      }}
    >
      { /* Display Remaining Misses in Top-Left Corner */ }
      {isPlaying && (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            padding: "8px 16px",
            borderRadius: "8px",
          }}
        >
          <Typography variant="subtitle1">
            Remaining Misses: {remainingMisses}
          </Typography>
        </Box>
      )}

      {!isPlaying ? (
        <Button variant="contained" color="primary" size="large" onClick={startGame}>
          Start Level {level}
        </Button>
      ) : (
        <>
          <Typography variant="h4">Score: {totalScore}</Typography> {/* Display Global Score */}

          {/* Player Block in the 3-row system */}
          <Box
            sx={{
              position: "absolute",
              left: "10%",
              bottom: `${ROWS[playerRow]}%`,
              width: "50px",
              height: "50px",
              backgroundColor: "cyan",
            }}
          />

          {/* Obstacles in the 3-row system */}
          {obstacles.map((obstacle) => (
            <Box
              key={obstacle.id}
              sx={{
                position: "absolute",
                left: `${obstacle.position}%`,
                bottom: `${ROWS[obstacle.row]}%`,
                width: "50px",
                height: "50px",
                backgroundColor: "red",
              }}
            />
          ))}
        </>
      )}
    </Box>
  );
};

export default GameScreen;
