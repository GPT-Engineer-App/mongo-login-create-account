import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Flex, Text, VStack } from '@chakra-ui/react';

const SNAKE_SPEED = 200;
const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 8, y: 8 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };

const getRandomFoodPosition = () => {
  return {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  };
};

const Index = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(getRandomFoodPosition());
  const [isGameOver, setIsGameOver] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const handleKeyDown = useCallback((event) => {
    switch (event.key) {
      case 'ArrowUp':
        if (direction.y === 0) setDirection({ x: 0, y: -1 });
        break;
      case 'ArrowDown':
        if (direction.y === 0) setDirection({ x: 0, y: 1 });
        break;
      case 'ArrowLeft':
        if (direction.x === 0) setDirection({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
        if (direction.x === 0) setDirection({ x: 1, y: 0 });
        break;
      default:
        break;
    }
  }, [direction]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const moveSnake = useCallback(() => {
    setSnake((prevSnake) => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };
      head.x += direction.x;
      head.y += direction.y;

      if (head.x >= GRID_SIZE || head.x < 0 || head.y >= GRID_SIZE || head.y < 0) {
        setIsGameOver(true);
        return prevSnake;
      }

      for (let segment of newSnake) {
        if (segment.x === head.x && segment.y === head.y) {
          setIsGameOver(true);
          return prevSnake;
        }
      }

      newSnake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        setFood(getRandomFoodPosition());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food]);

  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(moveSnake, SNAKE_SPEED);
    return () => clearInterval(interval);
  }, [moveSnake, isGameOver]);

  const handleSwipe = (dx, dy) => {
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0 && direction.x === 0) setDirection({ x: 1, y: 0 });
      else if (dx < 0 && direction.x === 0) setDirection({ x: -1, y: 0 });
    } else {
      if (dy > 0 && direction.y === 0) setDirection({ x: 0, y: 1 });
      else if (dy < 0 && direction.y === 0) setDirection({ x: 0, y: -1 });
    }
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(getRandomFoodPosition());
    setIsGameOver(false);
  };

  return (
    <Flex direction="column" align="center" justify="center" height="100vh">
      <Box position="relative" width="400px" height="400px" border="1px solid black" onTouchStart={(e) => {
        const touch = e.touches[0];
        const startX = touch.clientX;
        const startY = touch.clientY;

        const handleTouchMove = (e) => {
          const touch = e.touches[0];
          const dx = touch.clientX - startX;
          const dy = touch.clientY - startY;
          handleSwipe(dx, dy);
          e.target.removeEventListener('touchmove', handleTouchMove);
        };

        e.target.addEventListener('touchmove', handleTouchMove);
      }}>
        {snake.map((segment, index) => (
          <Box key={index} position="absolute" width="20px" height="20px" bg="green.500" style={{ left: segment.x * 20, top: segment.y * 20 }} />
        ))}
        <Box position="absolute" width="20px" height="20px" bg="red.500" style={{ left: food.x * 20, top: food.y * 20 }} />
      </Box>
      {isGameOver && (
        <Text fontSize="2xl" color="red.500" mt={4}>
          Game Over
        </Text>
      )}
      <Button mt={4} onClick={resetGame}>
        {isGameOver ? 'Restart Game' : 'Reset Game'}
      </Button>
      <Button mt={4} onClick={() => setShowControls(!showControls)}>
        {showControls ? 'Hide Controls' : 'Show Controls'}
      </Button>
      {showControls && (
        <VStack mt={4} spacing={2}>
          <Button onClick={() => direction.y === 0 && setDirection({ x: 0, y: -1 })}>Up</Button>
          <Flex>
            <Button onClick={() => direction.x === 0 && setDirection({ x: -1, y: 0 })}>Left</Button>
            <Button onClick={() => direction.x === 0 && setDirection({ x: 1, y: 0 })}>Right</Button>
          </Flex>
          <Button onClick={() => direction.y === 0 && setDirection({ x: 0, y: 1 })}>Down</Button>
        </VStack>
      )}
    </Flex>
  );
};

export default Index;