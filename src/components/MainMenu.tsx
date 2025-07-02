import React from 'react';
import { Square, Settings, User } from 'lucide-react';
import { useGameContext } from '../context/GameContext';

interface MainMenuProps {
  onPlay: () => void;
  onSettings: () => void;
  onProfile: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onPlay, onSettings, onProfile }) => {
  const { nickname, profilePicture } = useGameContext();

  return (
    <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg text-center">
      <div className="flex justify-center mb-6">
        <div className="relative">
          <Square size={64} className="text-white" />
          <Square size={24} className="text-yellow-400 absolute -right-2 -bottom-2" />
        </div>
      </div>
      
      <h1 className="text-4xl font-bold mb-8 text-white">Cube Collector</h1>
      
      <div className="space-y-4">
        <button 
          onClick={onPlay}
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-lg font-medium transition-colors"
        >
          Play
        </button>
        
        <button 
          onClick={onProfile}
          className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {profilePicture ? (
            <div 
              className="w-6 h-6 rounded-full bg-cover bg-center"
              style={{ backgroundImage: `url(${profilePicture})` }}
            />
          ) : (
            <User size={20} />
          )}
          {nickname || 'Profile'}
        </button>
        
        <button 
          onClick={onSettings}
          className="w-full py-3 px-6 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Settings size={20} />
          Settings
        </button>
      </div>
      
      <div className="mt-8 text-gray-400 text-sm">
        <p>Collect yellow squares to earn points!</p>
        <p>Use points to buy new skins in the shop.</p>
      </div>
    </div>
  );
};

export default MainMenu;