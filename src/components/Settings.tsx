import React, { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';

interface SettingsProps {
  onBack: () => void;
}

interface KeyBindingConfig {
  label: string;
  key: keyof typeof defaultControls;
  description: string;
}

const defaultControls = {
  upKey: 'w',
  downKey: 's',
  leftKey: 'a',
  rightKey: 'd',
  shopKey: 'e',
  inventoryKey: 'q'
};

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { controls, updateControls, resetProgress } = useGameContext();
  const [activeBinding, setActiveBinding] = useState<string | null>(null);
  const [tempControls, setTempControls] = useState({ ...controls });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const keyBindings: KeyBindingConfig[] = [
    { label: 'Move Up', key: 'upKey', description: 'Key to move the cube up' },
    { label: 'Move Down', key: 'downKey', description: 'Key to move the cube down' },
    { label: 'Move Left', key: 'leftKey', description: 'Key to move the cube left' },
    { label: 'Move Right', key: 'rightKey', description: 'Key to move the cube right' },
    { label: 'Open Shop', key: 'shopKey', description: 'Key to open the shop menu' },
    { label: 'Open Inventory', key: 'inventoryKey', description: 'Key to open the inventory' },
  ];

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (activeBinding) {
      e.preventDefault();
      const key = e.key.toLowerCase();
      
      if (/^[a-z0-9]$/.test(key) || key === 'arrowup' || key === 'arrowdown' || 
          key === 'arrowleft' || key === 'arrowright' || key === 'space') {
        setTempControls(prev => ({
          ...prev,
          [activeBinding]: key
        }));
        setActiveBinding(null);
      }
    }
  };

  const handleSave = () => {
    updateControls(tempControls);
    onBack();
  };

  const handleReset = () => {
    setTempControls(defaultControls);
  };

  const handleResetProgress = () => {
    if (showResetConfirm) {
      resetProgress();
      setShowResetConfirm(false);
      onBack();
    } else {
      setShowResetConfirm(true);
    }
  };

  return (
    <div 
      className="w-full max-w-lg p-6 bg-gray-800 rounded-lg shadow-lg"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-700 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold">Settings</h2>
        <div className="w-10"></div>
      </div>

      <div className="space-y-4 mb-6">
        <h3 className="text-xl font-medium mb-4">Controls</h3>
        
        {keyBindings.map((binding) => (
          <div key={binding.key} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{binding.label}</p>
              <p className="text-sm text-gray-400">{binding.description}</p>
            </div>
            <button
              className={`px-4 py-2 min-w-24 text-center border rounded-md ${
                activeBinding === binding.key 
                  ? 'border-blue-500 bg-blue-900 animate-pulse' 
                  : 'border-gray-600 bg-gray-700'
              }`}
              onClick={() => setActiveBinding(binding.key)}
            >
              {activeBinding === binding.key 
                ? 'Press a key...' 
                : tempControls[binding.key].toUpperCase()}
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between gap-4">
          <button
            onClick={handleReset}
            className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
          >
            Reset Controls
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-md flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <button
            onClick={handleResetProgress}
            className={`w-full py-2 flex items-center justify-center gap-2 rounded-md ${
              showResetConfirm 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <RefreshCw size={18} />
            {showResetConfirm ? 'Click again to confirm reset' : 'Reset All Progress'}
          </button>
          {showResetConfirm && (
            <p className="text-red-400 text-sm mt-2 text-center">
              Warning: This will reset all progress, including points, skins, and upgrades!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;