import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Typography } from "@mui/material";
import { Howl, Howler } from "howler";

const ROWS = [30, 50, 70]; // Three fixed row positions

const GameScreen = ({ song, level, onGameOver }) => {
  const [score, setScore] = useState(0);
  const [playerRow, setPlayerRow] = useState(1); // Middle row by default
  const [isPlaying, setIsPlaying] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const soundRef = useRef(null);

  const detectPeaks = () => {
    if (!analyserRef.current) return;

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const avgFreq =
      dataArrayRef.current.reduce((sum, value) => sum + value, 0) /
      dataArrayRef.current.length;
    console.log(avgFreq);

    if (avgFreq > 80) {  // Adjust the threshold for obstacle generation sensitivity
      console.log("Peak detected! Adding obstacle.");
      setObstacles((prevObstacles) => [
        ...prevObstacles,
        { id: Date.now(), position: 100, row: Math.floor(Math.random() * 3) },
      ]);
    }

    setTimeout(() => requestAnimationFrame(detectPeaks), 500); // Slower detection for better rhythm matching
  };

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
        onGameOver(true);
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
        setScore((prevScore) => prevScore + 10);
        setObstacles((prevObstacles) => prevObstacles.filter((o) => o.id !== obstacle.id));
      }
    });
  }, [obstacles, playerRow]);

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
            .filter((obstacle) => obstacle.position > -10)
        );
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      window.addEventListener("keydown", handlePlayerMove);
      return () => window.removeEventListener("keydown", handlePlayerMove);
    }
  }, [isPlaying, playerRow]);

  useEffect(() => {
  if (isPlaying) {
    // Stop the current game and reset state for the new level
    if (soundRef.current) {
      soundRef.current.stop();
    }
    setIsPlaying(false);
    setObstacles([]);
    setScore(0);
  }
}, [level]);


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
      {!isPlaying ? (
        <Button variant="contained" color="primary" size="large" onClick={startGame}>
          Start Level {level}
        </Button>
      ) : (
        <>
          <Typography variant="h4">Score: {score}</Typography>

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
