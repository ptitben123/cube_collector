import React, { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import { ArrowLeft, Check, Plus, X } from 'lucide-react';

interface InventoryProps {
  onBack: () => void;
}

interface CustomSkinForm {
  name: string;
  description: string;
  color: string;
  isRounded: boolean;
  rotate: boolean;
  glow: boolean;
  pulse: boolean;
  border: boolean;
  borderColor: string;
  shadow: boolean;
  shadowColor: string;
  trail: boolean;
  trailColor: string;
  shape: 'square' | 'circle' | 'triangle' | 'diamond' | 'star' | 'hexagon';
}

const defaultCustomSkin: CustomSkinForm = {
  name: '',
  description: '',
  color: '#ffffff',
  isRounded: false,
  rotate: false,
  glow: false,
  pulse: false,
  border: false,
  borderColor: '#ffffff',
  shadow: false,
  shadowColor: '#000000',
  trail: false,
  trailColor: '#ffffff',
  shape: 'square'
};

const Inventory: React.FC<InventoryProps> = ({ onBack }) => {
  const { 
    skins, 
    unlockedSkins, 
    activeSkin, 
    setActiveSkin, 
    score, 
    createCustomSkin,
    collectibleSkins,
    unlockedCollectibleSkins,
    activeCollectibleSkin,
    setActiveCollectibleSkin
  } = useGameContext();
  
  const [activeTab, setActiveTab] = useState<'player' | 'collectibles'>('player');
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [customSkin, setCustomSkin] = useState<CustomSkinForm>(defaultCustomSkin);
  const [previewKey, setPreviewKey] = useState(0);

  const handleCreateSkin = () => {
    if (score >= 30000) {
      createCustomSkin(customSkin);
      setShowCustomizer(false);
      setCustomSkin(defaultCustomSkin);
    }
  };

  const updateCustomSkin = (updates: Partial<CustomSkinForm>) => {
    setCustomSkin(prev => ({ ...prev, ...updates }));
    setPreviewKey(prev => prev + 1);
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
          className={`${skin.pulse ? 'animate-pulse' : ''}`}
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
          className={`${size} ${skin.pulse ? 'animate-pulse' : ''} flex items-center justify-center text-xl font-bold`}
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
    <div className="w-full max-w-4xl p-6 bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-700 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold">Inventory</h2>
        {score >= 30000 && !showCustomizer && activeTab === 'player' && (
          <button
            onClick={() => setShowCustomizer(true)}
            className="p-2 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors"
          >
            <Plus size={24} />
          </button>
        )}
        {showCustomizer && (
          <button
            onClick={() => setShowCustomizer(false)}
            className="p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-6 bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('player')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            activeTab === 'player' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
          }`}
        >
          Player Skins
        </button>
        <button
          onClick={() => setActiveTab('collectibles')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            activeTab === 'collectibles' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
          }`}
        >
          Collectible Skins
        </button>
      </div>

      {showCustomizer && activeTab === 'player' ? (
        <div className="mb-6 space-y-4">
          <h3 className="text-xl font-semibold">Create Custom Skin</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={customSkin.name}
                  onChange={(e) => updateCustomSkin({ name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 rounded-md"
                  placeholder="Skin name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={customSkin.description}
                  onChange={(e) => updateCustomSkin({ description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 rounded-md"
                  placeholder="Skin description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Main Color</label>
                <input
                  type="color"
                  value={customSkin.color}
                  onChange={(e) => updateCustomSkin({ color: e.target.value })}
                  className="w-full h-10 bg-gray-700 rounded-md cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Shape</label>
                <select
                  value={customSkin.shape}
                  onChange={(e) => updateCustomSkin({ shape: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-700 rounded-md"
                >
                  <option value="square">Square</option>
                  <option value="circle">Circle</option>
                  <option value="triangle">Triangle</option>
                  <option value="diamond">Diamond</option>
                  <option value="star">Star</option>
                  <option value="hexagon">Hexagon</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Effects</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={customSkin.isRounded}
                      onChange={(e) => updateCustomSkin({ isRounded: e.target.checked })}
                      className="rounded"
                    />
                    <span>Rounded</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={customSkin.rotate}
                      onChange={(e) => updateCustomSkin({ rotate: e.target.checked })}
                      className="rounded"
                    />
                    <span>Rotate</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={customSkin.glow}
                      onChange={(e) => updateCustomSkin({ glow: e.target.checked })}
                      className="rounded"
                    />
                    <span>Glow</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={customSkin.pulse}
                      onChange={(e) => updateCustomSkin({ pulse: e.target.checked })}
                      className="rounded"
                    />
                    <span>Pulse</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={customSkin.border}
                    onChange={(e) => updateCustomSkin({ border: e.target.checked })}
                    className="rounded"
                  />
                  <span>Border</span>
                </label>
                {customSkin.border && (
                  <input
                    type="color"
                    value={customSkin.borderColor}
                    onChange={(e) => updateCustomSkin({ borderColor: e.target.value })}
                    className="w-full h-10 bg-gray-700 rounded-md cursor-pointer"
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={customSkin.shadow}
                    onChange={(e) => updateCustomSkin({ shadow: e.target.checked })}
                    className="rounded"
                  />
                  <span>Shadow</span>
                </label>
                {customSkin.shadow && (
                  <input
                    type="color"
                    value={customSkin.shadowColor}
                    onChange={(e) => updateCustomSkin({ shadowColor: e.target.value })}
                    className="w-full h-10 bg-gray-700 rounded-md cursor-pointer"
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={customSkin.trail}
                    onChange={(e) => updateCustomSkin({ trail: e.target.checked })}
                    className="rounded"
                  />
                  <span>Trail</span>
                </label>
                {customSkin.trail && (
                  <input
                    type="color"
                    value={customSkin.trailColor}
                    onChange={(e) => updateCustomSkin({ trailColor: e.target.value })}
                    className="w-full h-10 bg-gray-700 rounded-md cursor-pointer"
                  />
                )}
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Preview</h4>
                <div className="w-full aspect-square bg-gray-900 rounded-lg flex items-center justify-center">
                  <div key={previewKey}>
                    {renderSkinPreview(customSkin)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleCreateSkin}
            disabled={!customSkin.name || score < 30000}
            className={`w-full py-3 rounded-lg ${
              customSkin.name && score >= 30000
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-gray-700 cursor-not-allowed'
            }`}
          >
            Create Skin (30,000 points)
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeTab === 'player' ? (
            Object.entries(skins)
              .filter(([id]) => unlockedSkins.includes(id))
              .map(([id, skin]) => {
                const isActive = activeSkin.name === skin.name;
                
                return (
                  <div 
                    key={id}
                    className={`p-4 rounded-lg flex flex-col items-center ${
                      isActive ? 'bg-blue-800 border border-blue-500' : 'bg-gray-700'
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-center h-16">
                      {renderSkinPreview(skin)}
                    </div>
                    
                    <div className="text-center mb-3">
                      <h3 className="text-lg font-medium">{skin.name}</h3>
                      <p className="text-gray-400 text-sm">{skin.description}</p>
                    </div>
                    
                    {isActive ? (
                      <div className="bg-green-600 p-2 rounded-full">
                        <Check size={20} />
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveSkin(id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
                      >
                        Equip
                      </button>
                    )}
                  </div>
                );
              })
          ) : (
            Object.entries(collectibleSkins)
              .filter(([id]) => unlockedCollectibleSkins.includes(id))
              .map(([id, skin]) => {
                const isActive = activeCollectibleSkin.name === skin.name;
                
                return (
                  <div 
                    key={id}
                    className={`p-4 rounded-lg flex flex-col items-center ${
                      isActive ? 'bg-blue-800 border border-blue-500' : 'bg-gray-700'
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-center h-12">
                      {renderSkinPreview(skin, true)}
                    </div>
                    
                    <div className="text-center mb-3">
                      <h3 className="text-lg font-medium">{skin.name}</h3>
                      <p className="text-gray-400 text-sm">{skin.description}</p>
                    </div>
                    
                    {isActive ? (
                      <div className="bg-green-600 p-2 rounded-full">
                        <Check size={20} />
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveCollectibleSkin(id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
                      >
                        Equip
                      </button>
                    )}
                  </div>
                );
              })
          )}

          {((activeTab === 'player' && unlockedSkins.length <= 1) || 
            (activeTab === 'collectibles' && unlockedCollectibleSkins.length <= 1)) && (
            <div className="col-span-full text-center p-4 bg-gray-700 rounded-lg">
              <p>Your inventory is empty! Visit the shop to buy some skins.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Inventory;