import React, { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import { Trophy, Gift, Lock, Check } from 'lucide-react';

interface TrophyRoadProps {
  onBack: () => void;
}

const TrophyRoad: React.FC<TrophyRoadProps> = ({ onBack }) => {
  const { 
    trophies, 
    totalCollected, 
    claimedTrophies, 
    claimTrophyReward,
    skins,
    collectibleSkins,
    botSkins
  } = useGameContext();
  
  const [hoveredTrophy, setHoveredTrophy] = useState<string | null>(null);

  const getRewardDisplay = (trophy: any) => {
    if (trophy.reward.type === 'points') {
      return `${trophy.reward.value} Points`;
    } else if (trophy.reward.type === 'skin') {
      const skin = skins[trophy.reward.value];
      return skin ? `Player Skin: ${skin.name}` : 'Player Skin';
    } else if (trophy.reward.type === 'collectible_skin') {
      const skin = collectibleSkins[trophy.reward.value];
      return skin ? `Collectible Skin: ${skin.name}` : 'Collectible Skin';
    } else if (trophy.reward.type === 'bot_skin') {
      const skin = botSkins[trophy.reward.value];
      return skin ? `Bot Skin: ${skin.name}` : 'Bot Skin';
    } else if (trophy.reward.type === 'multiplier') {
      return `${trophy.reward.value}x Point Multiplier`;
    }
    return 'Unknown Reward';
  };

  const getTrophyStatus = (trophy: any) => {
    const isCompleted = totalCollected >= trophy.requirement;
    const isClaimed = claimedTrophies.includes(trophy.id);
    
    if (isClaimed) return 'claimed';
    if (isCompleted) return 'ready';
    return 'locked';
  };

  const handleTrophyClick = (trophy: any) => {
    const status = getTrophyStatus(trophy);
    if (status === 'ready') {
      claimTrophyReward(trophy.id);
    }
  };

  return (
    <div className="w-full max-w-7xl p-6 bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold">Trophy Road</h2>
        <div className="px-4 py-2 bg-blue-600 rounded-md">
          <span className="font-bold">{totalCollected} Collected</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Progress: {totalCollected} / 50,000</span>
          <span>{((totalCollected / 50000) * 100).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((totalCollected / 50000) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Horizontal Trophy Road */}
      <div className="relative">
        <div className="flex overflow-x-auto pb-4 space-x-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {trophies.map((trophy, index) => {
            const status = getTrophyStatus(trophy);
            const isHovered = hoveredTrophy === trophy.id;
            
            return (
              <div key={trophy.id} className="relative flex-shrink-0">
                {/* Connection Line */}
                {index < trophies.length - 1 && (
                  <div className="absolute top-1/2 left-full w-4 h-0.5 bg-gray-600 transform -translate-y-1/2 z-0" />
                )}
                
                {/* Trophy Box */}
                <div
                  className={`relative w-32 h-32 bg-gray-600 rounded-lg border-2 transition-all duration-200 cursor-pointer z-10 ${
                    status === 'claimed' 
                      ? 'border-green-500 bg-green-900' 
                      : status === 'ready'
                      ? 'border-yellow-500 bg-yellow-900 hover:bg-yellow-800 animate-pulse'
                      : 'border-gray-500 hover:bg-gray-500'
                  }`}
                  onMouseEnter={() => setHoveredTrophy(trophy.id)}
                  onMouseLeave={() => setHoveredTrophy(null)}
                  onClick={() => handleTrophyClick(trophy)}
                >
                  {/* Trophy Icon */}
                  <div className="flex flex-col items-center justify-center h-full p-2">
                    <div className="mb-2">
                      {status === 'claimed' ? (
                        <Check size={24} className="text-green-400" />
                      ) : status === 'ready' ? (
                        <Gift size={24} className="text-yellow-400" />
                      ) : (
                        <Lock size={24} className="text-gray-400" />
                      )}
                    </div>
                    
                    {/* Trophy Info */}
                    <div className="text-center">
                      <div className="text-xs font-medium text-white mb-1 leading-tight">
                        {trophy.name}
                      </div>
                      <div className="text-xs text-gray-300">
                        {trophy.requirement.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Hover Tooltip */}
                  {isHovered && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-20">
                      <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg border border-gray-600 min-w-48">
                        <div className="text-sm font-bold mb-1">{trophy.name}</div>
                        <div className="text-xs text-gray-300 mb-2">{trophy.description}</div>
                        <div className="text-xs">
                          <div className="text-yellow-400 font-medium">Reward:</div>
                          <div className="text-white">{getRewardDisplay(trophy)}</div>
                        </div>
                        <div className="text-xs mt-2">
                          <div className="text-blue-400">Progress:</div>
                          <div className="text-white">
                            {Math.min(totalCollected, trophy.requirement).toLocaleString()} / {trophy.requirement.toLocaleString()}
                          </div>
                        </div>
                        {status === 'ready' && (
                          <div className="text-xs text-green-400 mt-1 font-medium">
                            Click to claim!
                          </div>
                        )}
                      </div>
                      {/* Tooltip Arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-600 border border-gray-500 rounded"></div>
          <span className="text-gray-400">Locked</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-900 border border-yellow-500 rounded"></div>
          <span className="text-gray-400">Ready to Claim</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-900 border border-green-500 rounded"></div>
          <span className="text-gray-400">Claimed</span>
        </div>
      </div>
    </div>
  );
};

export default TrophyRoad;