import React from "react";
import { Button, Container, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const OpeningScreen = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box textAlign="center" marginTop={10}>
        <Typography variant="h2" gutterBottom>
          Block Runner
        </Typography>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Rhythm-based 2D running game!
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate("/level/1")}
        >
          Start Game
        </Button>
      </Box>
    </Container>
  );
};

export default OpeningScreen;
