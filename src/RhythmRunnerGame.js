import React, { useRef, useState, useEffect } from 'react';
import { Howl, Howler } from 'howler';
import Meyda from 'meyda';

const RhythmRunnerGame = () => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const cleanupRef = useRef(false);
    const [gameStarted, setGameStarted] = useState(false);

    // Start game when the user clicks the button.
    const startGame = () => {
        // Resume AudioContext if needed.
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
            Howler.ctx.resume().then(() => {
                console.log('AudioContext resumed.');
            });
        }
        setGameStarted(true);
    };

    useEffect(() => {
        if (!gameStarted) return;

        // Reset cleanup flag.
        cleanupRef.current = false;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let beatDetected = false;

        // Initialize Howler with your audio track (ensure the file is in public folder).
        const sound = new Howl({
            src: ['/your-audio-track.mp3'],
            html5: true,
            volume: 1.0,
        });

        // Log audio events.
        sound.on('play', () => {
            console.log('Audio is playing.');
        });
        sound.on('playerror', (id, error) => {
            console.error('Audio play error:', error);
        });

        // Basic player variables.
        const playerWidth = 30;
        const playerHeight = 30;
        const playerX = 50;
        let playerY = canvas.height - playerHeight - 20; // Starting on the ground.
        let jumpVelocity = 0;
        let isJumping = false;
        const gravity = 0.5;

        // Event listener for jump.
        const handleKeyDown = (e) => {
            if ((e.key === ' ' || e.key === 'ArrowUp') && !isJumping) {
                jumpVelocity = -10;
                isJumping = true;
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        // Use an array for obstacles.
        let obstacles = [];

        // Function to spawn an obstacle with properties based on the current energy.
        // Function to spawn an obstacle with properties based on the normalized energy.
        const spawnObstacle = (energyValue) => {
            // Normalize the energy value to be between 0 and 1.
            const normalizedEnergy = Math.min(energyValue, 1);

            // Standardize the speed: map normalizedEnergy to a range between minSpeed and maxSpeed.
            const minSpeed = 2;
            const maxSpeed = 5;
            const obstacleSpeed = minSpeed + normalizedEnergy * (maxSpeed - minSpeed);

            // Optionally, you can also standardize size in a similar way.
            const obstacleWidth = playerWidth + normalizedEnergy * 20;
            const obstacleHeight = playerHeight + normalizedEnergy * 10;

            obstacles.push({
                x: canvas.width,
                y: canvas.height - playerHeight - 20,
                width: obstacleWidth,
                height: obstacleHeight,
                speed: obstacleSpeed,
                color: 'green',
            });
        };


        // Once the sound loads, set up Meyda and start the audio.
        sound.once('load', () => {
            if (cleanupRef.current) return;

            const audioContext = Howler.ctx;
            const soundNode = sound._sounds[0]._node;

            // Create a media source from the Howler-managed audio element.
            const source = audioContext.createMediaElementSource(soundNode);
            // Connect to destination so the audio is audible.
            source.connect(audioContext.destination);

            let lastSpawnTime = 0;

            const analyzer = Meyda.createMeydaAnalyzer({
                audioContext: audioContext,
                source: source,
                bufferSize: 512,
                featureExtractors: ['energy'],
                callback: (features) => {
                    // Get the current time
                    const now = Date.now();

                    // Set a new threshold if desired (e.g., 0.7 instead of 0.5)
                    if (features.energy > 1.2 && now - lastSpawnTime > 900) {
                        beatDetected = true;
                        spawnObstacle(features.energy);
                        lastSpawnTime = now;  // update the last spawn time
                    }
                },
            });

            analyzer.start();
            sound.play();

            // Main game loop.
            const gameLoop = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Update player jump.
                if (isJumping) {
                    playerY += jumpVelocity;
                    jumpVelocity += gravity;
                    // Ground collision.
                    if (playerY >= canvas.height - playerHeight - 20) {
                        playerY = canvas.height - playerHeight - 20;
                        isJumping = false;
                        jumpVelocity = 0;
                    }
                }
                // Draw the player.
                ctx.fillStyle = 'blue';
                ctx.fillRect(playerX, playerY, playerWidth, playerHeight);

                // Update and draw obstacles.
                obstacles = obstacles.filter(obstacle => {
                    obstacle.x -= obstacle.speed;
                    // Flash red if a beat was just detected.
                    if (beatDetected) {
                        obstacle.color = 'red';
                    } else {
                        obstacle.color = 'green';
                    }
                    ctx.fillStyle = obstacle.color;
                    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                    // Only keep obstacles that are still on the screen.
                    return obstacle.x + obstacle.width > 0;
                });

                // Reset the beat flag (so obstacles don't flash continuously).
                beatDetected = false;

                animationRef.current = requestAnimationFrame(gameLoop);
            };

            animationRef.current = requestAnimationFrame(gameLoop);

            return () => {
                cleanupRef.current = true;
                cancelAnimationFrame(animationRef.current);
                analyzer.stop();
                window.removeEventListener('keydown', handleKeyDown);
            };
        });

        // Cleanup in case the component unmounts before the sound loads.
        return () => {
            cleanupRef.current = true;
            cancelAnimationFrame(animationRef.current);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [gameStarted]);

    return (
        <div>
            {!gameStarted && <button onClick={startGame}>Start Game</button>}
            {gameStarted && (
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={400}
                    style={{ border: '1px solid black' }}
                />
            )}
        </div>
    );
};

export default RhythmRunnerGame;
