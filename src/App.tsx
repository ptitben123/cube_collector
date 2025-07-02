import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase, initializeUserData } from './lib/supabase';
import Game from './components/Game';
import MainMenu from './components/MainMenu';
import Shop from './components/Shop';
import Inventory from './components/Inventory';
import Settings from './components/Settings';
import Profile from './components/Profile';
import Friends from './components/Friends';
import Auth from './components/Auth';
import { GameProvider } from './context/GameContext';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear any existing session
    supabase.auth.signOut();
    
    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      
      if (session?.user) {
        setIsLoading(true);
        const success = await initializeUserData(session.user.id);
        if (!success) {
          setError('Failed to load user data');
        }
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
        case '#/friends':
          setCurrentScreen('friends');
          break;
        default:
          setCurrentScreen('menu');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <Auth />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading your game data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <GameProvider session={session}>
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        {currentScreen === 'game' && <Game onExit={() => { window.location.hash = ''; }} />}
        {currentScreen === 'shop' && <Shop onBack={() => { window.location.hash = '#/game'; }} />}
        {currentScreen === 'inventory' && <Inventory onBack={() => { window.location.hash = '#/game'; }} />}
        {currentScreen === 'settings' && <Settings onBack={() => { window.location.hash = ''; }} />}
        {currentScreen === 'profile' && <Profile onBack={() => { window.location.hash = ''; }} />}
        {currentScreen === 'friends' && <Friends onBack={() => { window.location.hash = ''; }} />}
        {currentScreen === 'menu' && (
          <MainMenu
            onPlay={() => { window.location.hash = '#/game'; }}
            onSettings={() => { window.location.hash = '#/settings'; }}
            onProfile={() => { window.location.hash = '#/profile'; }}
            onFriends={() => { window.location.hash = '#/friends'; }}
          />
        )}
      </div>
    </GameProvider>
  );
}

export default App;