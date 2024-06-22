import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Flex, Text, VStack, Select } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const SNAKE_SPEEDS = {
  easy: 300,
  medium: 200,
  hard: 100,
};

const GRID_SIZES = {
  small: 10,
  medium: 20,
  large: 30,
};

const THEMES = {
  classic: {
    snakeColor: 'green.500',
    foodColor: 'red.500',
    backgroundColor: 'white',
  },
  dark: {
    snakeColor: 'green.200',
    foodColor: 'red.200',
    backgroundColor: 'gray.800',
  },
};

const getRandomFoodPosition = (gridSize) => {
  return {
    x: Math.floor(Math.random() * gridSize),
    y: Math.floor(Math.random() * gridSize),
  };
};

const Index = () => {
  const [snake, setSnake] = useState([{ x: 8, y: 8 }]);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState(getRandomFoodPosition(GRID_SIZES.medium));
  const [isGameOver, setIsGameOver] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [difficulty, setDifficulty] = useState('medium');
  const [gridSize, setGridSize] = useState('medium');
  const [theme, setTheme] = useState('classic');

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

      if (head.x >= GRID_SIZES[gridSize] || head.x < 0 || head.y >= GRID_SIZES[gridSize] || head.y < 0) {
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
        setFood(getRandomFoodPosition(GRID_SIZES[gridSize]));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gridSize]);

  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(moveSnake, SNAKE_SPEEDS[difficulty]);
    return () => clearInterval(interval);
  }, [moveSnake, isGameOver, difficulty]);

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
    setSnake([{ x: 8, y: 8 }]);
    setDirection({ x: 1, y: 0 });
    setFood(getRandomFoodPosition(GRID_SIZES[gridSize]));
    setIsGameOver(false);
  };

  return (
    <Flex direction="column" align="center" justify="center" height="100vh" bg={THEMES[theme].backgroundColor}>
      <Box position="relative" width={`${GRID_SIZES[gridSize] * 20}px`} height={`${GRID_SIZES[gridSize] * 20}px`} border="1px solid black" onTouchStart={(e) => {
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
          <motion.div key={index} position="absolute" width="20px" height="20px" bg={THEMES[theme].snakeColor} style={{ left: segment.x * 20, top: segment.y * 20 }} />
        ))}
        <motion.div position="absolute" width="20px" height="20px" bg={THEMES[theme].foodColor} style={{ left: food.x * 20, top: food.y * 20 }} />
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
      <Flex mt={4} direction="column" align="center">
        <Text>Difficulty</Text>
        <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </Select>
        <Text mt={4}>Grid Size</Text>
        <Select value={gridSize} onChange={(e) => setGridSize(e.target.value)}>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </Select>
        <Text mt={4}>Theme</Text>
        <Select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="classic">Classic</option>
          <option value="dark">Dark</option>
        </Select>
      </Flex>
    </Flex>
  );
};

export default Index;