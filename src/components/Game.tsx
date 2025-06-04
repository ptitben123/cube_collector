import React, { useEffect, useRef, useState } from 'react';
import { useGameContext } from '../context/GameContext';
import { ShoppingBag, Package, X, Trophy } from 'lucide-react';

interface GameProps {
  onExit: () => void;
}

const Game: React.FC<GameProps> = ({ onExit }) => {
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [cubePosition, setCubePosition] = useState({ x: 0, y: 0 });
  const [collectibles, setCollectibles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [nextId, setNextId] = useState(0);
  const [showTrophies, setShowTrophies] = useState(false);
  const [lastSpawnTime, setLastSpawnTime] = useState(Date.now());
  
  const { 
    score, 
    addPoints,
    controls,
    activeSkin,
    getUpgradeEffect,
    totalCollected,
    addCollected,
    trophies,
    claimedTrophies,
    claimTrophyReward
  } = useGameContext();
  
  const cubeSize = 30;
  const collectibleSize = 15;
  const speed = getUpgradeEffect('speed');
  const magnetRange = getUpgradeEffect('magnet');
  const spawnRateReduction = getUpgradeEffect('spawn');
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Handle key presses
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
      
      // Secret keybind for points
      if (e.key === 'p' || e.key === 'P') {
        addPoints(30000);
      }
      
      if (e.key.toLowerCase() === controls.shopKey) {
        onExit();
        window.location.href = '#/shop';
      } else if (e.key.toLowerCase() === controls.inventoryKey) {
        onExit();
        window.location.href = '#/inventory';
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [controls, onExit, addPoints]);

  // Game loop
  useEffect(() => {
    let animationFrameId: number;
    
    const gameLoop = () => {
      const now = Date.now();
      const spawnInterval = 1000 * (1 - spawnRateReduction);
      
      // Spawn new collectible if enough time has passed
      if (now - lastSpawnTime >= spawnInterval && gameAreaRef.current) {
        const bounds = gameAreaRef.current.getBoundingClientRect();
        const newCollectible = {
          id: nextId,
          x: Math.random() * (bounds.width - collectibleSize),
          y: Math.random() * (bounds.height - collectibleSize)
        };
        setCollectibles(prev => [...prev, newCollectible]);
        setNextId(prev => prev + 1);
        setLastSpawnTime(now);
      }

      // Move cube based on keys pressed
      let newX = cubePosition.x;
      let newY = cubePosition.y;
      
      if (keysPressed.current[controls.upKey]) {
        newY -= speed;
      }
      if (keysPressed.current[controls.downKey]) {
        newY += speed;
      }
      if (keysPressed.current[controls.leftKey]) {
        newX -= speed;
      }
      if (keysPressed.current[controls.rightKey]) {
        newX += speed;
      }

      // Keep cube within bounds
      if (gameAreaRef.current) {
        const bounds = gameAreaRef.current.getBoundingClientRect();
        newX = Math.max(0, Math.min(newX, bounds.width - cubeSize));
        newY = Math.max(0, Math.min(newY, bounds.height - cubeSize));
      }

      setCubePosition({ x: newX, y: newY });

      // Check collisions with collectibles
      const collidedIds: number[] = [];
      collectibles.forEach(collectible => {
        const dx = (newX + cubeSize/2) - (collectible.x + collectibleSize/2);
        const dy = (newY + cubeSize/2) - (collectible.y + collectibleSize/2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= (cubeSize/2 + collectibleSize/2 + magnetRange)) {
          collidedIds.push(collectible.id);
          addPoints(1);
          addCollected();
        }
      });

      if (collidedIds.length > 0) {
        setCollectibles(prev => prev.filter(c => !collidedIds.includes(c.id)));
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [cubePosition, collectibles, controls, speed, magnetRange, spawnRateReduction, nextId, lastSpawnTime, addPoints, addCollected]);

  const getTrophyColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'from-orange-700 to-orange-500';
      case 'silver': return 'from-gray-400 to-gray-300';
      case 'gold': return 'from-yellow-500 to-yellow-300';
      case 'diamond': return 'from-blue-400 to-cyan-300';
      case 'legendary': return 'from-purple-600 to-pink-500';
      default: return 'from-gray-700 to-gray-600';
    }
  };

  return (
    <div className="w-full max-w-3xl flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-4 px-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Score: {score}</h2>
          <span className="text-gray-400">Collected: {totalCollected}</span>
        </div>
        <div className="flex gap-2">
          <button
            className="bg-purple-600 hover:bg-purple-700 p-2 rounded-full transition-colors"
            onClick={() => setShowTrophies(!showTrophies)}
          >
            <Trophy size={20} />
          </button>
          <button 
            className="bg-blue-600 hover:bg-blue-700 p-2 rounded-full transition-colors"
            onClick={() => { onExit(); window.location.href = '#/shop'; }}
          >
            <ShoppingBag size={20} />
          </button>
          <button 
            className="bg-green-600 hover:bg-green-700 p-2 rounded-full transition-colors"
            onClick={() => { onExit(); window.location.href = '#/inventory'; }}
          >
            <Package size={20} />
          </button>
          <button 
            className="bg-red-600 hover:bg-red-700 p-2 rounded-full transition-colors"
            onClick={onExit}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {showTrophies && (
        <div className="w-full mb-4 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Trophy Road</h3>
          <div className="space-y-3">
            {trophies.map((trophy, index) => {
              const isClaimed = claimedTrophies.includes(trophy.id);
              const isUnlocked = totalCollected >= trophy.requirement;
              const gradientClass = getTrophyColor(trophy.tier);
              
              return (
                <div key={trophy.id} className="relative">
                  {index < trophies.length - 1 && (
                    <div 
                      className={`absolute left-6 top-full w-1 h-3 ${
                        isUnlocked ? 'bg-blue-500' : 'bg-gray-700'
                      }`}
                    />
                  )}
                  
                  <div className={`p-4 rounded-lg bg-gradient-to-r ${gradientClass} flex items-center gap-4`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isClaimed ? 'bg-green-500' : isUnlocked ? 'bg-blue-500' : 'bg-gray-700'
                    }`}>
                      <Trophy size={24} className="text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{trophy.name}</h4>
                        <span className="text-sm">
                          {totalCollected}/{trophy.requirement}
                        </span>
                      </div>
                      <p className="text-sm text-gray-200">{trophy.description}</p>
                      <div className="mt-2 h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ 
                            width: `${Math.min(100, (totalCollected / trophy.requirement) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {isClaimed ? (
                        <span className="px-3 py-1 bg-green-600 rounded-md text-sm">
                          Claimed
                        </span>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => claimTrophyReward(trophy.id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm"
                        >
                          Claim
                        </button>
                      ) : (
                        <span className="px-3 py-1 bg-gray-700 rounded-md text-sm">
                          Locked
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div 
        ref={gameAreaRef}
        className="bg-gray-800 border-2 border-gray-700 rounded-lg w-full h-[500px] relative overflow-hidden"
      >
        <div 
          className={`absolute transition-transform duration-100 ease-out ${
            activeSkin.pulse ? 'animate-pulse' : ''
          }`}
          style={{ 
            left: `${cubePosition.x}px`, 
            top: `${cubePosition.y}px`, 
            width: `${cubeSize}px`, 
            height: `${cubeSize}px`,
            backgroundColor: activeSkin.color,
            borderRadius: activeSkin.isRounded ? '4px' : '0',
            transform: activeSkin.rotate ? 'rotate(45deg)' : 'none',
            boxShadow: [
              activeSkin.glow ? '0 0 10px rgba(255, 255, 255, 0.7)' : '',
              activeSkin.shadow ? `0 0 15px ${activeSkin.shadowColor}` : '',
              activeSkin.border ? `0 0 0 2px ${activeSkin.borderColor}` : ''
            ].filter(Boolean).join(', '),
          }}
        />

        {magnetRange > 0 && (
          <div
            className="absolute border-2 border-blue-500/30 rounded-full pointer-events-none"
            style={{
              left: `${cubePosition.x + cubeSize/2 - (cubeSize/2 + magnetRange)}px`,
              top: `${cubePosition.y + cubeSize/2 - (cubeSize/2 + magnetRange)}px`,
              width: `${cubeSize + magnetRange * 2}px`,
              height: `${cubeSize + magnetRange * 2}px`,
            }}
          />
        )}

        {collectibles.map(collectible => (
          <div 
            key={collectible.id}
            className="absolute bg-yellow-400 animate-pulse"
            style={{ 
              left: `${collectible.x}px`, 
              top: `${collectible.y}px`, 
              width: `${collectibleSize}px`, 
              height: `${collectibleSize}px` 
            }}
          />
        ))}
      </div>

      <div className="mt-4 text-gray-400 text-sm">
        <p>Move: {controls.upKey}/{controls.leftKey}/{controls.downKey}/{controls.rightKey} | Shop: {controls.shopKey} | Inventory: {controls.inventoryKey}</p>
      </div>
    </div>
  );
};

export default Game;