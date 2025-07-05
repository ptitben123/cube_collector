import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameContext } from '../context/GameContext';
import { Trophy, Package, ShoppingCart, Settings, Plus } from 'lucide-react';

interface GameProps {
  onExit: () => void;
}

interface Position {
  x: number;
  y: number;
}

interface Collectible {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

interface Bot {
  id: number;
  x: number;
  y: number;
  targetId: number | null;
  speed: number;
}

const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;
const PLAYER_SIZE = 20;
const COLLECTIBLE_SIZE = 12;
const BOT_SIZE = 16;
const BOT_FARM_HEIGHT = 120;

const Game: React.FC<GameProps> = ({ onExit }) => {
  const { 
    score, 
    addPoints, 
    activeSkin, 
    controls, 
    getUpgradeEffect,
    addCollected,
    activeCollectibleSkin,
    botCount,
    activeBotSkin,
    spendPoints
  } = useGameContext();

  const [playerPos, setPlayerPos] = useState<Position>({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 });
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [combo, setCombo] = useState(0);
  const [comboTimer, setComboTimer] = useState(0);
  const [lastCollectTime, setLastCollectTime] = useState(0);
  const [showParameters, setShowParameters] = useState(false);
  const gameLoopRef = useRef<number>();
  const collectibleIdRef = useRef(0);
  const botIdRef = useRef(0);

  const speed = getUpgradeEffect('speed');
  const pointMultiplier = getUpgradeEffect('points');
  const magnetRange = getUpgradeEffect('magnet');
  const spawnRateBonus = getUpgradeEffect('spawn');
  const bonusChance = getUpgradeEffect('bonus');
  const comboMultiplier = getUpgradeEffect('combo');

  // Initialize bots based on botCount
  useEffect(() => {
    const newBots: Bot[] = [];
    for (let i = 0; i < botCount; i++) {
      newBots.push({
        id: botIdRef.current++,
        x: Math.random() * (GAME_WIDTH - BOT_SIZE),
        y: GAME_HEIGHT + Math.random() * (BOT_FARM_HEIGHT - BOT_SIZE),
        targetId: null,
        speed: 1.5
      });
    }
    setBots(newBots);
  }, [botCount]);

  const spawnCollectible = useCallback(() => {
    const newCollectible: Collectible = {
      id: collectibleIdRef.current++,
      x: Math.random() * (GAME_WIDTH - COLLECTIBLE_SIZE),
      y: Math.random() * (GAME_HEIGHT - COLLECTIBLE_SIZE),
      collected: false
    };
    setCollectibles(prev => [...prev, newCollectible]);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    setKeys(prev => new Set(prev).add(key));

    if (key === controls.shopKey) {
      window.location.hash = '#/shop';
    } else if (key === controls.inventoryKey) {
      window.location.hash = '#/inventory';
    }
  }, [controls]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    setKeys(prev => {
      const newKeys = new Set(prev);
      newKeys.delete(key);
      return newKeys;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const updatePlayerPosition = useCallback(() => {
    setPlayerPos(prev => {
      let newX = prev.x;
      let newY = prev.y;

      if (keys.has(controls.leftKey)) newX -= speed;
      if (keys.has(controls.rightKey)) newX += speed;
      if (keys.has(controls.upKey)) newY -= speed;
      if (keys.has(controls.downKey)) newY += speed;

      newX = Math.max(0, Math.min(GAME_WIDTH - PLAYER_SIZE, newX));
      newY = Math.max(0, Math.min(GAME_HEIGHT - PLAYER_SIZE, newY));

      return { x: newX, y: newY };
    });
  }, [keys, speed, controls]);

  const updateBots = useCallback(() => {
    setBots(prevBots => {
      return prevBots.map(bot => {
        // Find available collectibles in the main game area
        const availableCollectibles = collectibles.filter(c => 
          !c.collected && 
          c.y < GAME_HEIGHT &&
          !prevBots.some(otherBot => otherBot.id !== bot.id && otherBot.targetId === c.id)
        );

        // If bot doesn't have a target or target is collected, find a new one
        if (!bot.targetId || !availableCollectibles.find(c => c.id === bot.targetId)) {
          if (availableCollectibles.length > 0) {
            // Find closest collectible
            const closest = availableCollectibles.reduce((closest, current) => {
              const distToCurrent = Math.sqrt(Math.pow(current.x - bot.x, 2) + Math.pow(current.y - bot.y, 2));
              const distToClosest = Math.sqrt(Math.pow(closest.x - bot.x, 2) + Math.pow(closest.y - bot.y, 2));
              return distToCurrent < distToClosest ? current : closest;
            });
            bot.targetId = closest.id;
          } else {
            bot.targetId = null;
          }
        }

        // Move towards target
        if (bot.targetId) {
          const target = collectibles.find(c => c.id === bot.targetId);
          if (target && !target.collected) {
            const dx = target.x - bot.x;
            const dy = target.y - bot.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 5) {
              bot.x += (dx / distance) * bot.speed;
              bot.y += (dy / distance) * bot.speed;
            }

            // Keep bot in bounds
            bot.x = Math.max(0, Math.min(GAME_WIDTH - BOT_SIZE, bot.x));
            bot.y = Math.max(0, Math.min(GAME_HEIGHT + BOT_FARM_HEIGHT - BOT_SIZE, bot.y));
          }
        } else {
          // Return to bot farm area if no target
          if (bot.y < GAME_HEIGHT) {
            bot.y += bot.speed;
          }
        }

        return bot;
      });
    });
  }, [collectibles]);

  const checkCollisions = useCallback(() => {
    const now = Date.now();
    
    setCollectibles(prev => {
      return prev.map(collectible => {
        if (collectible.collected) return collectible;

        // Check player collision
        const playerDistance = Math.sqrt(
          Math.pow(playerPos.x + PLAYER_SIZE/2 - collectible.x - COLLECTIBLE_SIZE/2, 2) +
          Math.pow(playerPos.y + PLAYER_SIZE/2 - collectible.y - COLLECTIBLE_SIZE/2, 2)
        );

        // Check bot collisions
        const botCollision = bots.some(bot => {
          const botDistance = Math.sqrt(
            Math.pow(bot.x + BOT_SIZE/2 - collectible.x - COLLECTIBLE_SIZE/2, 2) +
            Math.pow(bot.y + BOT_SIZE/2 - collectible.y - COLLECTIBLE_SIZE/2, 2)
          );
          return botDistance < (BOT_SIZE + COLLECTIBLE_SIZE) / 2;
        });

        if (playerDistance < (PLAYER_SIZE + COLLECTIBLE_SIZE) / 2 + magnetRange || botCollision) {
          let points = Math.floor(10 * pointMultiplier);
          
          // Combo system (only for player collections)
          if (!botCollision) {
            if (now - lastCollectTime < 2000) {
              setCombo(prev => prev + 1);
              setComboTimer(3000);
              points = Math.floor(points * (1 + combo * comboMultiplier));
            } else {
              setCombo(1);
              setComboTimer(3000);
            }
            setLastCollectTime(now);
          }

          // Bonus chance
          if (Math.random() < bonusChance) {
            points *= 2;
          }

          addPoints(points);
          addCollected();
          
          return { ...collectible, collected: true };
        }

        return collectible;
      });
    });
  }, [playerPos, bots, magnetRange, pointMultiplier, combo, comboMultiplier, bonusChance, lastCollectTime, addPoints, addCollected]);

  const gameLoop = useCallback(() => {
    updatePlayerPosition();
    updateBots();
    checkCollisions();

    // Reduced spawn rate - was 0.02, now 0.008 (much slower)
    if (Math.random() < 0.008 + spawnRateBonus * 0.1) {
      // Also limit maximum collectibles on screen
      if (collectibles.filter(c => !c.collected).length < 8) {
        spawnCollectible();
      }
    }

    // Remove collected collectibles after a delay
    setCollectibles(prev => prev.filter(c => !c.collected || Date.now() - lastCollectTime < 500));

    // Update combo timer
    setComboTimer(prev => Math.max(0, prev - 16));
    if (comboTimer <= 0) {
      setCombo(0);
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [updatePlayerPosition, updateBots, checkCollisions, spawnCollectible, spawnRateBonus, lastCollectTime, comboTimer, collectibles]);

  useEffect(() => {
    // Initial collectibles - reduced from 5 to 3
    for (let i = 0; i < 3; i++) {
      spawnCollectible();
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop, spawnCollectible]);

  const handleBuyBot = () => {
    if (score >= 10000) {
      spendPoints(10000, '');
      // The bot will be added automatically through the botCount context
    }
  };

  const renderSkin = (skin: any, size: string, isBot = false) => {
    const baseStyle: React.CSSProperties = {
      backgroundColor: skin.color,
      boxShadow: [
        skin.glow ? '0 0 10px rgba(255, 255, 255, 0.7)' : '',
        skin.shadow ? `0 0 15px ${skin.shadowColor}` : '',
        skin.border ? `0 0 0 2px ${skin.borderColor}` : ''
      ].filter(Boolean).join(', ')
    };

    if (skin.shape === 'circle') {
      return (
        <div 
          className={`${size} rounded-full ${skin.pulse ? 'animate-pulse' : ''} ${isBot ? 'flex items-center justify-center' : ''}`}
          style={baseStyle}
        >
          {isBot && <span className="text-xs">🤖</span>}
        </div>
      );
    } else if (skin.shape === 'triangle') {
      const sizeNum = parseInt(size.split('-')[1]);
      return (
        <div 
          className={`${skin.pulse ? 'animate-pulse' : ''} ${isBot ? 'relative' : ''}`}
          style={{
            width: 0,
            height: 0,
            borderLeft: `${sizeNum/2}px solid transparent`,
            borderRight: `${sizeNum/2}px solid transparent`,
            borderBottom: `${sizeNum}px solid ${skin.color}`,
            backgroundColor: 'transparent',
            filter: skin.glow ? 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.7))' : 'none'
          }}
        >
          {isBot && <span className="absolute top-full left-1/2 transform -translate-x-1/2 text-xs">🤖</span>}
        </div>
      );
    } else if (skin.shape === 'diamond') {
      return (
        <div 
          className={`${size} ${skin.pulse ? 'animate-pulse' : ''} ${isBot ? 'flex items-center justify-center' : ''}`}
          style={{
            ...baseStyle,
            transform: 'rotate(45deg)',
            borderRadius: skin.isRounded ? '4px' : '0'
          }}
        >
          {isBot && <span className="text-xs transform -rotate-45">🤖</span>}
        </div>
      );
    } else if (skin.shape === 'star') {
      return (
        <div 
          className={`${size} ${skin.pulse ? 'animate-pulse' : ''} flex items-center justify-center text-xl font-bold`}
          style={{ 
            color: skin.color, 
            filter: skin.glow ? 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.7))' : 'none'
          }}
        >
          {isBot ? '🤖' : '★'}
        </div>
      );
    } else if (skin.shape === 'hexagon') {
      return (
        <div 
          className={`${size} ${skin.pulse ? 'animate-pulse' : ''} ${isBot ? 'flex items-center justify-center' : ''}`}
          style={{
            backgroundColor: skin.color,
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            filter: skin.glow ? 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.7))' : 'none'
          }}
        >
          {isBot && <span className="text-xs">🤖</span>}
        </div>
      );
    } else {
      // Default square/rectangle
      return (
        <div 
          className={`${size} ${skin.pulse ? 'animate-pulse' : ''} ${isBot ? 'flex items-center justify-center' : ''}`}
          style={{
            ...baseStyle,
            borderRadius: skin.isRounded ? '4px' : '0',
            transform: skin.rotate ? 'rotate(45deg)' : 'none'
          }}
        >
          {isBot && <span className="text-xs">🤖</span>}
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      {/* Game UI */}
      <div className="flex justify-between items-center w-full max-w-4xl mb-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onExit}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
          >
            Exit Game
          </button>
          <div className="px-4 py-2 bg-blue-600 rounded-md">
            <span className="font-bold">{score} Points</span>
          </div>
          {combo > 1 && comboTimer > 0 && (
            <div className="px-3 py-1 bg-yellow-600 rounded-md animate-pulse">
              <span className="font-bold">Combo x{combo}</span>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowParameters(!showParameters)}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md flex items-center gap-2"
          >
            <Settings size={20} />
            Parameters
          </button>
          <button 
            onClick={() => window.location.hash = '#/trophies'}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-md flex items-center gap-2"
          >
            <Trophy size={20} />
            Trophies
          </button>
          <button 
            onClick={() => window.location.hash = '#/inventory'}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md flex items-center gap-2"
          >
            <Package size={20} />
            Inventory ({controls.inventoryKey.toUpperCase()})
          </button>
          <button 
            onClick={() => window.location.hash = '#/shop'}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md flex items-center gap-2"
          >
            <ShoppingCart size={20} />
            Shop ({controls.shopKey.toUpperCase()})
          </button>
        </div>
      </div>

      {/* Parameters Panel */}
      {showParameters && (
        <div className="w-full max-w-4xl mb-4 p-4 bg-gray-800 rounded-lg border border-gray-600">
          <h3 className="text-lg font-semibold mb-3">Current Parameters</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Speed</div>
              <div className="font-bold">{speed.toFixed(1)}</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Point Multiplier</div>
              <div className="font-bold">{pointMultiplier.toFixed(1)}x</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Magnet Range</div>
              <div className="font-bold">{magnetRange.toFixed(0)}px</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Spawn Rate</div>
              <div className="font-bold">+{(spawnRateBonus * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Bonus Chance</div>
              <div className="font-bold">{(bonusChance * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400">Combo Multiplier</div>
              <div className="font-bold">{comboMultiplier.toFixed(1)}x</div>
            </div>
          </div>
        </div>
      )}

      {/* Game Area */}
      <div className="relative bg-gray-800 border-2 border-gray-600 rounded-lg overflow-hidden">
        <div 
          className="relative"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT + BOT_FARM_HEIGHT }}
        >
          {/* Main Game Area */}
          <div 
            className="absolute top-0 left-0 bg-gray-700"
            style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          >
            {/* Player */}
            <div
              className="absolute transition-all duration-75"
              style={{
                left: playerPos.x,
                top: playerPos.y,
                width: PLAYER_SIZE,
                height: PLAYER_SIZE
              }}
            >
              {renderSkin(activeSkin, 'w-5 h-5')}
            </div>

            {/* Collectibles */}
            {collectibles.map(collectible => (
              <div
                key={collectible.id}
                className={`absolute transition-all duration-200 ${collectible.collected ? 'opacity-0 scale-150' : ''}`}
                style={{
                  left: collectible.x,
                  top: collectible.y,
                  width: COLLECTIBLE_SIZE,
                  height: COLLECTIBLE_SIZE
                }}
              >
                {renderSkin(activeCollectibleSkin, 'w-3 h-3')}
              </div>
            ))}

            {/* Bots in main area */}
            {bots.filter(bot => bot.y < GAME_HEIGHT).map(bot => (
              <div
                key={bot.id}
                className="absolute transition-all duration-100"
                style={{
                  left: bot.x,
                  top: bot.y,
                  width: BOT_SIZE,
                  height: BOT_SIZE
                }}
              >
                {renderSkin(activeBotSkin, 'w-4 h-4', true)}
              </div>
            ))}
          </div>

          {/* Bot Farm Area */}
          <div 
            className="absolute bottom-0 left-0 bg-gray-600 border-t-2 border-gray-500"
            style={{ width: GAME_WIDTH, height: BOT_FARM_HEIGHT }}
          >
            <div className="flex justify-between items-center p-3">
              <div>
                <div className="text-sm font-medium text-gray-300">
                  Bot Farm ({botCount} bots)
                </div>
                <div className="text-xs text-gray-400">
                  Bots automatically collect squares for you
                </div>
              </div>
              
              <button
                onClick={handleBuyBot}
                disabled={score < 10000}
                className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                  score >= 10000 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gray-700 cursor-not-allowed'
                }`}
              >
                <Plus size={16} />
                Buy Bot (10,000 pts)
              </button>
            </div>
            
            {/* Bots in farm area */}
            {bots.filter(bot => bot.y >= GAME_HEIGHT).map(bot => (
              <div
                key={bot.id}
                className="absolute transition-all duration-100"
                style={{
                  left: bot.x,
                  top: bot.y - GAME_HEIGHT,
                  width: BOT_SIZE,
                  height: BOT_SIZE
                }}
              >
                {renderSkin(activeBotSkin, 'w-4 h-4', true)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls Info */}
      <div className="mt-4 text-center text-gray-400 text-sm">
        <p>Use {controls.upKey.toUpperCase()}{controls.leftKey.toUpperCase()}{controls.downKey.toUpperCase()}{controls.rightKey.toUpperCase()} to move • Press {controls.shopKey.toUpperCase()} for Shop • Press {controls.inventoryKey.toUpperCase()} for Inventory</p>
      </div>
    </div>
  );
};

export default Game;