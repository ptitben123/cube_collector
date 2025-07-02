import React, { useState, useEffect } from 'react';
import Game from './components/Game';
import MainMenu from './components/MainMenu';
import Shop from './components/Shop';
import Inventory from './components/Inventory';
import Settings from './components/Settings';
import Profile from './components/Profile';
import { GameProvider } from './context/GameContext';

function App() {
  const [currentScreen, setCurrentScreen] = useState('menu');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      switch (hash) {
        case '#/shop':
          setCurrentScreen('shop');
          break;
        case '#/inventory':
          setCurrentScreen('inventory');
          break;
        case '#/game':
          setCurrentScreen('game');
          break;
        case '#/settings':
          setCurrentScreen('settings');
          break;
        case '#/profile':
          setCurrentScreen('profile');
          break;
        default:
          setCurrentScreen('menu');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <GameProvider>
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        {currentScreen === 'game' && <Game onExit={() => { window.location.hash = ''; }} />}
        {currentScreen === 'shop' && <Shop onBack={() => { window.location.hash = '#/game'; }} />}
        {currentScreen === 'inventory' && <Inventory onBack={() => { window.location.hash = '#/game'; }} />}
        {currentScreen === 'settings' && <Settings onBack={() => { window.location.hash = ''; }} />}
        {currentScreen === 'profile' && <Profile onBack={() => { window.location.hash = ''; }} />}
        {currentScreen === 'menu' && (
          <MainMenu
            onPlay={() => { window.location.hash = '#/game'; }}
            onSettings={() => { window.location.hash = '#/settings'; }}
            onProfile={() => { window.location.hash = '#/profile'; }}
          />
        )}
      </div>
    </GameProvider>
  );
}

export default App;