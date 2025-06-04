import React, { useState, useRef } from 'react';
import { useGameContext } from '../context/GameContext';
import { ArrowLeft, Camera, User, Trophy, CreditCard } from 'lucide-react';

interface ProfileProps {
  onBack: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onBack }) => {
  const { 
    nickname,
    updateNickname,
    profilePicture,
    updateProfilePicture,
    totalCollected,
    totalPointsGained,
    score
  } = useGameContext();
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempNickname, setTempNickname] = useState(nickname);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveNickname = () => {
    if (tempNickname.trim()) {
      updateNickname(tempNickname.trim());
      setIsEditing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateProfilePicture(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
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
        <h2 className="text-2xl font-bold">Profile</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-4">
          <div 
            className="w-32 h-32 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center"
            style={profilePicture ? { backgroundImage: `url(${profilePicture})`, backgroundSize: 'cover' } : {}}
          >
            {!profilePicture && <User size={48} className="text-gray-500" />}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
          >
            <Camera size={20} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        {isEditing ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={tempNickname}
              onChange={(e) => setTempNickname(e.target.value)}
              className="px-3 py-2 bg-gray-700 rounded-md"
              placeholder="Enter nickname"
              maxLength={20}
            />
            <button
              onClick={handleSaveNickname}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md"
            >
              Save
            </button>
            <button
              onClick={() => {
                setTempNickname(nickname);
                setIsEditing(false);
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold">{nickname || 'Anonymous Player'}</h3>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white"
            >
              ✎
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-700 p-4 rounded-lg flex flex-col items-center">
          <Trophy size={24} className="mb-2 text-yellow-500" />
          <span className="text-sm text-gray-400">Squares Collected</span>
          <span className="text-2xl font-bold">{totalCollected}</span>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg flex flex-col items-center">
          <CreditCard size={24} className="mb-2 text-green-500" />
          <span className="text-sm text-gray-400">Current Points</span>
          <span className="text-2xl font-bold">{score}</span>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg flex flex-col items-center">
          <CreditCard size={24} className="mb-2 text-blue-500" />
          <span className="text-sm text-gray-400">Total Points Gained</span>
          <span className="text-2xl font-bold">{totalPointsGained}</span>
        </div>
      </div>
    </div>
  );
}

export default Profile;