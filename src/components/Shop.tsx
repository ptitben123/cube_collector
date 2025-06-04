import React from 'react';
import { useGameContext } from '../context/GameContext';
import { ArrowLeft } from 'lucide-react';

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
    getUpgradeEffect
  } = useGameContext();

  const handlePurchase = (skinId: string, price: number) => {
    if (score >= price) {
      spendPoints(price, skinId);
    }
  };

  return (
    <div className="w-full max-w-2xl p-6 bg-gray-800 rounded-lg shadow-lg">
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

      {/* Upgrades Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Upgrades</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Skins Section */}
      <h3 className="text-xl font-semibold mb-4">Skins</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(skins)
          .filter(([id, skin]) => id !== 'default' && !skin.exclusive)
          .map(([id, skin]) => {
            const isUnlocked = unlockedSkins.includes(id);
            
            return (
              <div 
                key={id}
                className="p-4 bg-gray-700 rounded-lg flex flex-col items-center"
              >
                <div 
                  className="w-16 h-16 mb-3"
                  style={{ 
                    backgroundColor: skin.color,
                    borderRadius: skin.isRounded ? '4px' : '0',
                    transform: skin.rotate ? 'rotate(45deg)' : 'none',
                    boxShadow: skin.glow ? '0 0 10px rgba(255, 255, 255, 0.7)' : 'none',
                  }}
                />
                <h3 className="text-lg font-medium">{skin.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{skin.description}</p>
                
                {isUnlocked ? (
                  <span className="px-4 py-2 bg-green-700 rounded-md">Purchased</span>
                ) : (
                  <button
                    onClick={() => handlePurchase(id, skin.price)}
                    disabled={score < skin.price}
                    className={`px-4 py-2 rounded-md ${
                      score >= skin.price 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-600 cursor-not-allowed'
                    }`}
                  >
                    Buy for {skin.price} points
                  </button>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Shop;