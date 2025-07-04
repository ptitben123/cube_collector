import React, { useEffect, useRef, useState } from 'react';
import { useGameContext } from '../context/GameContext';
import { ShoppingBag, Package, X, Trophy, Gauge, Zap, Magnet, Clock, Gift, Target } from 'lucide-react';

interface GameProps {
  onExit: () => void;
}

const Game: React.FC<GameProps> = ({ onExit }) => {
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [cubePosition, setCubePosition] = useState({ x: 0, y: 0 });
  const [collectibles, setCollectibles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [nextId, setNextId] = useState(0);
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
    claimTrophyReward,
    upgradeLevel,
    pointMultiplier,
    activeCollectibleSkin
  } = useGameContext();
  
  const cubeSize = 30;
  const collectibleSize = 15;
  const speed = getUpgradeEffect('speed');
  const magnetRange = getUpgradeEffect('magnet');
  const spawnRateReduction = getUpgradeEffect('spawn');
  const pointsMultiplier = getUpgradeEffect('points');
  const bonusChance = getUpgradeEffect('bonus');
  const comboMultiplier = getUpgradeEffect('combo');
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

  const getParameterIcon = (param: string) => {
    switch (param) {
      case 'speed': return <Gauge size={16} className="text-blue-400" />;
      case 'points': return <Zap size={16} className="text-yellow-400" />;
      case 'magnet': return <Magnet size={16} className="text-purple-400" />;
      case 'spawn': return <Clock size={16} className="text-green-400" />;
      case 'bonus': return <Gift size={16} className="text-pink-400" />;
      case 'combo': return <Target size={16} className="text-orange-400" />;
      default: return null;
    }
  };

  const formatParameterValue = (param: string, value: number) => {
    // Ensure value is a valid number, default to 0 if undefined/null
    const safeValue = value ?? 0;
    
    switch (param) {
      case 'speed': return `${safeValue.toFixed(1)} px/frame`;
      case 'points': return `${safeValue.toFixed(1)}x`;
      case 'magnet': return `${safeValue.toFixed(0)} px`;
      case 'spawn': return `${(safeValue * 100).toFixed(0)}% faster`;
      case 'bonus': return `${(safeValue * 100).toFixed(0)}% chance`;
      case 'combo': return `${safeValue.toFixed(1)}x`;
      default: return safeValue.toString();
    }
  };

  const renderPlayerCube = () => {
    const baseStyle: React.CSSProperties = {
      left: `${cubePosition.x}px`,
      top: `${cubePosition.y}px`,
      width: `${cubeSize}px`,
      height: `${cubeSize}px`,
      backgroundColor: activeSkin.color,
      boxShadow: [
        activeSkin.glow ? '0 0 10px rgba(255, 255, 255, 0.7)' : '',
        activeSkin.shadow ? `0 0 15px ${activeSkin.shadowColor}` : '',
        activeSkin.border ? `0 0 0 2px ${activeSkin.borderColor}` : ''
      ].filter(Boolean).join(', ')
    };

    const className = `absolute transition-transform duration-100 ease-out ${
      activeSkin.pulse ? 'animate-pulse' : ''
    }`;

    if (activeSkin.shape === 'circle') {
      return (
        <div 
          className={`${className} rounded-full`}
          style={baseStyle}
        />
      );
    } else if (activeSkin.shape === 'triangle') {
      return (
        <div 
          className={className}
          style={{
            ...baseStyle,
            width: 0,
            height: 0,
            borderLeft: `${cubeSize/2}px solid transparent`,
            borderRight: `${cubeSize/2}px solid transparent`,
            borderBottom: `${cubeSize}px solid ${activeSkin.color}`,
            backgroundColor: 'transparent',
            filter: activeSkin.glow ? 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.7))' : 'none'
          }}
        />
      );
    } else if (activeSkin.shape === 'diamond') {
      return (
        <div 
          className={className}
          style={{
            ...baseStyle,
            transform: 'rotate(45deg)',
            borderRadius: activeSkin.isRounded ? '4px' : '0'
          }}
        />
      );
    } else if (activeSkin.shape === 'star') {
      return (
        <div 
          className={`${className} flex items-center justify-center text-2xl font-bold`}
          style={{
            ...baseStyle,
            color: activeSkin.color,
            backgroundColor: 'transparent',
            filter: activeSkin.glow ? 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.7))' : 'none'
          }}
        >
          ★
        </div>
      );
    } else if (activeSkin.shape === 'hexagon') {
      return (
        <div 
          className={className}
          style={{
            ...baseStyle,
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            filter: activeSkin.glow ? 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.7))' : 'none'
          }}
        />
      );
    } else {
      // Default square
      return (
        <div 
          className={className}
          style={{
            ...baseStyle,
            borderRadius: activeSkin.isRounded ? '4px' : '0',
            transform: activeSkin.rotate ? 'rotate(45deg)' : 'none'
          }}
        />
      );
    }
  };

  const renderCollectible = (collectible: { id: number; x: number; y: number }) => {
    const baseStyle: React.CSSProperties = {
      left: `${collectible.x}px`,
      top: `${collectible.y}px`,
      width: `${collectibleSize}px`,
      height: `${collectibleSize}px`,
      backgroundColor: activeCollectibleSkin.color,
      filter: activeCollectibleSkin.glow ? 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.7))' : 'none'
    };

    const className = `absolute ${activeCollectibleSkin.pulse ? 'animate-pulse' : ''}`;

    if (activeCollectibleSkin.shape === 'circle') {
      return (
        <div 
          key={collectible.id}
          className={`${className} rounded-full`}
          style={baseStyle}
        />
      );
    } else if (activeCollectibleSkin.shape === 'triangle') {
      return (
        <div 
          key={collectible.id}
          className={className}
          style={{
            ...baseStyle,
            width: 0,
            height: 0,
            borderLeft: `${collectibleSize/2}px solid transparent`,
            borderRight: `${collectibleSize/2}px solid transparent`,
            borderBottom: `${collectibleSize}px solid ${activeCollectibleSkin.color}`,
            backgroundColor: 'transparent'
          }}
        />
      );
    } else if (activeCollectibleSkin.shape === 'diamond') {
      return (
        <div 
          key={collectible.id}
          className={className}
          style={{
            ...baseStyle,
            transform: 'rotate(45deg)'
          }}
        />
      );
    } else if (activeCollectibleSkin.shape === 'star') {
      return (
        <div 
          key={collectible.id}
          className={`${className} flex items-center justify-center text-xs font-bold`}
          style={{
            ...baseStyle,
            color: activeCollectibleSkin.color,
            backgroundColor: 'transparent'
          }}
        >
          ★
        </div>
      );
    } else if (activeCollectibleSkin.shape === 'hexagon') {
      return (
        <div 
          key={collectible.id}
          className={className}
          style={{
            ...baseStyle,
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
          }}
        />
      );
    } else {
      // Default square
      return (
        <div 
          key={collectible.id}
          className={className}
          style={baseStyle}
        />
      );
    }
  };

  return (
    <div className="w-full max-w-7xl flex gap-6">
      {/* Trophy Road Sidebar */}
      <div className="w-80 bg-gray-800 rounded-lg p-4 h-[600px] overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={24} className="text-yellow-500" />
          <h3 className="text-lg font-semibold">Trophy Road</h3>
        </div>
        
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
                
                <div className={`p-3 rounded-lg bg-gradient-to-r ${gradientClass} flex items-center gap-3`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isClaimed ? 'bg-green-500' : isUnlocked ? 'bg-blue-500' : 'bg-gray-700'
                  }`}>
                    <Trophy size={20} className="text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm truncate">{trophy.name}</h4>
                      <span className="text-xs whitespace-nowrap ml-2">
                        {totalCollected}/{trophy.requirement}
                      </span>
                    </div>
                    <p className="text-xs text-gray-200 mb-2">{trophy.description}</p>
                    <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ 
                          width: `${Math.min(100, (totalCollected / trophy.requirement) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="ml-2">
                    {isClaimed ? (
                      <span className="px-2 py-1 bg-green-600 rounded text-xs">
                        ✓
                      </span>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => claimTrophyReward(trophy.id)}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                      >
                        Claim
                      </button>
                    ) : (
                      <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                        🔒
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 px-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">Score: {score}</h2>
            <span className="text-gray-400">Collected: {totalCollected}</span>
          </div>
          <div className="flex gap-2">
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

        {/* Game Area */}
        <div 
          ref={gameAreaRef}
          className="bg-gray-800 border-2 border-gray-700 rounded-lg w-full h-[500px] relative overflow-hidden"
        >
          {renderPlayerCube()}

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

          {collectibles.map(collectible => renderCollectible(collectible))}
        </div>

        {/* Controls Info */}
        <div className="mt-4 text-gray-400 text-sm text-center">
          <p>Move: {controls.upKey}/{controls.leftKey}/{controls.downKey}/{controls.rightKey} | Shop: {controls.shopKey} | Inventory: {controls.inventoryKey}</p>
        </div>
      </div>

      {/* Parameters Sidebar */}
      <div className="w-80 bg-gray-800 rounded-lg p-4 h-[600px] overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <Gauge size={24} className="text-blue-500" />
          <h3 className="text-lg font-semibold">Parameters</h3>
        </div>
        
        <div className="space-y-4">
          {/* Current Skins */}
          <div className="p-3 bg-gray-700 rounded-lg">
            <h4 className="text-sm font-medium mb-2 text-gray-300">Active Skins</h4>
            
            {/* Player Skin */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 flex items-center justify-center">
                {activeSkin.shape === 'circle' ? (
                  <div 
                    className={`w-8 h-8 rounded-full ${activeSkin.pulse ? 'animate-pulse' : ''}`}
                    style={{ 
                      backgroundColor: activeSkin.color,
                      boxShadow: [
                        activeSkin.glow ? '0 0 8px rgba(255, 255, 255, 0.7)' : '',
                        activeSkin.shadow ? `0 0 10px ${activeSkin.shadowColor}` : '',
                        activeSkin.border ? `0 0 0 1px ${activeSkin.borderColor}` : ''
                      ].filter(Boolean).join(', ')
                    }}
                  />
                ) : activeSkin.shape === 'triangle' ? (
                  <div 
                    className={activeSkin.pulse ? 'animate-pulse' : ''}
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: '16px solid transparent',
                      borderRight: '16px solid transparent',
                      borderBottom: `32px solid ${activeSkin.color}`,
                      filter: activeSkin.glow ? 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.7))' : 'none'
                    }}
                  />
                ) : activeSkin.shape === 'star' ? (
                  <div 
                    className={`text-lg ${activeSkin.pulse ? 'animate-pulse' : ''}`}
                    style={{ 
                      color: activeSkin.color,
                      filter: activeSkin.glow ? 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.7))' : 'none'
                    }}
                  >
                    ★
                  </div>
                ) : activeSkin.shape === 'hexagon' ? (
                  <div 
                    className={`w-8 h-8 ${activeSkin.pulse ? 'animate-pulse' : ''}`}
                    style={{ 
                      backgroundColor: activeSkin.color,
                      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                      filter: activeSkin.glow ? 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.7))' : 'none'
                    }}
                  />
                ) : (
                  <div 
                    className={`w-8 h-8 ${activeSkin.pulse ? 'animate-pulse' : ''}`}
                    style={{ 
                      backgroundColor: activeSkin.color,
                      borderRadius: activeSkin.isRounded ? '2px' : '0',
                      transform: activeSkin.rotate || activeSkin.shape === 'diamond' ? 'rotate(45deg)' : 'none',
                      boxShadow: [
                        activeSkin.glow ? '0 0 8px rgba(255, 255, 255, 0.7)' : '',
                        activeSkin.shadow ? `0 0 10px ${activeSkin.shadowColor}` : '',
                        activeSkin.border ? `0 0 0 1px ${activeSkin.borderColor}` : ''
                      ].filter(Boolean).join(', ')
                    }}
                  />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Player: {activeSkin.name}</p>
                <p className="text-xs text-gray-400">{activeSkin.description}</p>
              </div>
            </div>

            {/* Collectible Skin */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 flex items-center justify-center">
                {activeCollectibleSkin.shape === 'circle' ? (
                  <div 
                    className={`w-6 h-6 rounded-full ${activeCollectibleSkin.pulse ? 'animate-pulse' : ''}`}
                    style={{ 
                      backgroundColor: activeCollectibleSkin.color,
                      filter: activeCollectibleSkin.glow ? 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.7))' : 'none'
                    }}
                  />
                ) : activeCollectibleSkin.shape === 'triangle' ? (
                  <div 
                    className={activeCollectibleSkin.pulse ? 'animate-pulse' : ''}
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: '12px solid transparent',
                      borderRight: '12px solid transparent',
                      borderBottom: `24px solid ${activeCollectibleSkin.color}`,
                      filter: activeCollectibleSkin.glow ? 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.7))' : 'none'
                    }}
                  />
                ) : activeCollectibleSkin.shape === 'star' ? (
                  <div 
                    className={`text-sm ${activeCollectibleSkin.pulse ? 'animate-pulse' : ''}`}
                    style={{ 
                      color: activeCollectibleSkin.color,
                      filter: activeCollectibleSkin.glow ? 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.7))' : 'none'
                    }}
                  >
                    ★
                  </div>
                ) : activeCollectibleSkin.shape === 'hexagon' ? (
                  <div 
                    className={`w-6 h-6 ${activeCollectibleSkin.pulse ? 'animate-pulse' : ''}`}
                    style={{ 
                      backgroundColor: activeCollectibleSkin.color,
                      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                      filter: activeCollectibleSkin.glow ? 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.7))' : 'none'
                    }}
                  />
                ) : (
                  <div 
                    className={`w-6 h-6 ${activeCollectibleSkin.pulse ? 'animate-pulse' : ''}`}
                    style={{ 
                      backgroundColor: activeCollectibleSkin.color,
                      transform: activeCollectibleSkin.shape === 'diamond' ? 'rotate(45deg)' : 'none',
                      filter: activeCollectibleSkin.glow ? 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.7))' : 'none'
                    }}
                  />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Collectible: {activeCollectibleSkin.name}</p>
                <p className="text-xs text-gray-400">{activeCollectibleSkin.description}</p>
              </div>
            </div>
          </div>

          {/* Global Multipliers */}
          <div className="p-3 bg-gray-700 rounded-lg">
            <h4 className="text-sm font-medium mb-2 text-gray-300">Global Effects</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <Zap size={14} className="text-yellow-400" />
                  Point Multiplier
                </span>
                <span className="text-sm font-medium">{(pointMultiplier ?? 1).toFixed(1)}x</span>
              </div>
            </div>
          </div>

          {/* Upgrade Effects */}
          <div className="p-3 bg-gray-700 rounded-lg">
            <h4 className="text-sm font-medium mb-3 text-gray-300">Upgrade Effects</h4>
            <div className="space-y-3">
              {Object.entries({
                speed: speed,
                points: pointsMultiplier,
                magnet: magnetRange,
                spawn: spawnRateReduction,
                bonus: bonusChance,
                combo: comboMultiplier
              }).map(([param, value]) => {
                const level = upgradeLevel[param] || 0;
                return (
                  <div key={param} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2 capitalize">
                        {getParameterIcon(param)}
                        {param === 'points' ? 'Point Bonus' : param}
                      </span>
                      <span className="text-sm font-medium">
                        {formatParameterValue(param, value)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Level {level}</span>
                      <span>{level > 0 ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div className="h-1 w-full bg-gray-600 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ 
                          width: `${level > 0 ? Math.min(100, (level / 10) * 100) : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Game Stats */}
          <div className="p-3 bg-gray-700 rounded-lg">
            <h4 className="text-sm font-medium mb-2 text-gray-300">Game Stats</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Current Score</span>
                <span className="font-medium">{score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Collected</span>
                <span className="font-medium">{totalCollected.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Collectibles</span>
                <span className="font-medium">{collectibles.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Trophies Claimed</span>
                <span className="font-medium">{claimedTrophies.length}/{trophies.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;