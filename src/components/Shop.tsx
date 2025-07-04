import React, { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import { ArrowLeft, Zap, User, Square } from 'lucide-react';

interface ShopProps {
  onBack: () => void;
}

const Shop: React.FC<ShopProps> = ({ onBack }) => {
  const { 
    score, 
    spendPoints, 
    skins, 
    unlockedSkins,
    upgrades,
    upgradeLevel,
    purchaseUpgrade,
    getUpgradeEffect,
    collectibleSkins,
    unlockedCollectibleSkins,
    purchaseCollectibleSkin
  } = useGameContext();

  const [activeTab, setActiveTab] = useState<'upgrades' | 'player' | 'collectibles'>('upgrades');

  const handlePurchase = (skinId: string, price: number) => {
    if (score >= price) {
      spendPoints(price, skinId);
    }
  };

  const handleCollectiblePurchase = (skinId: string, price: number) => {
    if (score >= price) {
      purchaseCollectibleSkin(skinId, price);
    }
  };

  const renderSkinPreview = (skin: any, isCollectible = false) => {
    const size = isCollectible ? 'w-8 h-8' : 'w-12 h-12';
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
          className={`${size} rounded-full ${skin.pulse ? 'animate-pulse' : ''}`}
          style={baseStyle}
        />
      );
    } else if (skin.shape === 'triangle') {
      return (
        <div 
          className={`${size} ${skin.pulse ? 'animate-pulse' : ''}`}
          style={{
            width: 0,
            height: 0,
            borderLeft: isCollectible ? '16px solid transparent' : '24px solid transparent',
            borderRight: isCollectible ? '16px solid transparent' : '24px solid transparent',
            borderBottom: isCollectible ? `32px solid ${skin.color}` : `48px solid ${skin.color}`,
            backgroundColor: 'transparent',
            filter: skin.glow ? 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.7))' : 'none'
          }}
        />
      );
    } else if (skin.shape === 'diamond') {
      return (
        <div 
          className={`${size} ${skin.pulse ? 'animate-pulse' : ''}`}
          style={{
            ...baseStyle,
            transform: 'rotate(45deg)',
            borderRadius: skin.isRounded ? '4px' : '0'
          }}
        />
      );
    } else if (skin.shape === 'star') {
      return (
        <div 
          className={`${size} ${skin.pulse ? 'animate-pulse' : ''} flex items-center justify-center`}
          style={{ color: skin.color, filter: skin.glow ? 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.7))' : 'none' }}
        >
          ★
        </div>
      );
    } else if (skin.shape === 'hexagon') {
      return (
        <div 
          className={`${size} ${skin.pulse ? 'animate-pulse' : ''}`}
          style={{
            backgroundColor: skin.color,
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            filter: skin.glow ? 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.7))' : 'none'
          }}
        />
      );
    } else {
      // Default square/rectangle
      return (
        <div 
          className={`${size} ${skin.pulse ? 'animate-pulse' : ''}`}
          style={{
            ...baseStyle,
            borderRadius: skin.isRounded ? '4px' : '0',
            transform: skin.rotate ? 'rotate(45deg)' : 'none'
          }}
        />
      );
    }
  };

  return (
    <div className="w-full max-w-6xl p-6 bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-700 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold">Shop</h2>
        <div className="px-4 py-2 bg-yellow-600 rounded-md">
          <span className="font-bold">{score} Points</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-6 bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('upgrades')}
          className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'upgrades' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
          }`}
        >
          <Zap size={20} />
          Upgrades
        </button>
        <button
          onClick={() => setActiveTab('player')}
          className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'player' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
          }`}
        >
          <User size={20} />
          Player Skins
        </button>
        <button
          onClick={() => setActiveTab('collectibles')}
          className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'collectibles' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
          }`}
        >
          <Square size={20} />
          Collectible Skins
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeTab === 'upgrades' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Upgrades</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(upgrades).map(([id, upgrade]) => {
                const currentLevel = upgradeLevel[id] || 0;
                const isMaxLevel = currentLevel >= upgrade.maxLevel;
                const currentEffect = getUpgradeEffect(id);
                
                return (
                  <div 
                    key={id}
                    className="p-4 bg-gray-700 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-medium">{upgrade.name}</h4>
                      <span className="text-sm text-gray-400">
                        Level {currentLevel}/{upgrade.maxLevel}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{upgrade.description}</p>
                    <p className="text-sm text-blue-400 mb-3">
                      Current effect: {currentEffect.toFixed(1)}
                    </p>
                    
                    {isMaxLevel ? (
                      <span className="block text-center px-4 py-2 bg-green-700 rounded-md">
                        Maximum Level
                      </span>
                    ) : (
                      <button
                        onClick={() => purchaseUpgrade(id)}
                        disabled={score < upgrade.price}
                        className={`w-full px-4 py-2 rounded-md ${
                          score >= upgrade.price 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : 'bg-gray-600 cursor-not-allowed'
                        }`}
                      >
                        Upgrade for {upgrade.price} points
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'player' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Player Skins</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(skins)
                .filter(([id, skin]) => id !== 'default' && !skin.exclusive)
                .map(([id, skin]) => {
                  const isUnlocked = unlockedSkins.includes(id);
                  
                  return (
                    <div 
                      key={id}
                      className="p-4 bg-gray-700 rounded-lg flex flex-col items-center"
                    >
                      <div className="mb-3 flex items-center justify-center h-16">
                        {renderSkinPreview(skin)}
                      </div>
                      <h4 className="text-md font-medium text-center mb-1">{skin.name}</h4>
                      <p className="text-gray-400 text-xs text-center mb-3">{skin.description}</p>
                      
                      {isUnlocked ? (
                        <span className="px-3 py-1 bg-green-700 rounded-md text-sm">Purchased</span>
                      ) : (
                        <button
                          onClick={() => handlePurchase(id, skin.price)}
                          disabled={score < skin.price}
                          className={`px-3 py-1 rounded-md text-sm ${
                            score >= skin.price 
                              ? 'bg-blue-600 hover:bg-blue-700' 
                              : 'bg-gray-600 cursor-not-allowed'
                          }`}
                        >
                          {skin.price} pts
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {activeTab === 'collectibles' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Collectible Skins</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(collectibleSkins || {})
                .filter(([id]) => id !== 'default')
                .map(([id, skin]) => {
                  const isUnlocked = unlockedCollectibleSkins?.includes(id);
                  
                  return (
                    <div 
                      key={id}
                      className="p-4 bg-gray-700 rounded-lg flex flex-col items-center"
                    >
                      <div className="mb-3 flex items-center justify-center h-12">
                        {renderSkinPreview(skin, true)}
                      </div>
                      <h4 className="text-md font-medium text-center mb-1">{skin.name}</h4>
                      <p className="text-gray-400 text-xs text-center mb-3">{skin.description}</p>
                      
                      {isUnlocked ? (
                        <span className="px-3 py-1 bg-green-700 rounded-md text-sm">Purchased</span>
                      ) : (
                        <button
                          onClick={() => handleCollectiblePurchase(id, skin.price)}
                          disabled={score < skin.price}
                          className={`px-3 py-1 rounded-md text-sm ${
                            score >= skin.price 
                              ? 'bg-blue-600 hover:bg-blue-700' 
                              : 'bg-gray-600 cursor-not-allowed'
                          }`}
                        >
                          {skin.price} pts
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;