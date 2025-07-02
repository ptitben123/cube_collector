import React, { useState, useEffect } from 'react';
import { useGameContext } from '../context/GameContext';
import { ArrowLeft, Search, UserPlus, UserMinus, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FriendsProps {
  onBack: () => void;
}

const Friends: React.FC<FriendsProps> = ({ onBack }) => {
  const { 
    friends, 
    pendingFriends,
    addFriend,
    removeFriend,
    acceptFriendRequest,
    rejectFriendRequest
  } = useGameContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    nickname: string;
    profile_picture: string | null;
  }>>([]);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 3) {
        setSearchResults([]);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, nickname, profile_picture')
        .ilike('nickname', `%${searchQuery}%`)
        .limit(5);

      if (error) {
        console.error('Error searching users:', error);
        return;
      }

      setSearchResults(data || []);
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <div className="w-full max-w-2xl p-6 bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-700 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold">Friends</h2>
        <div className="w-10"></div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-2 bg-gray-700 rounded-lg overflow-hidden">
            {searchResults.map((user) => {
              const isFriend = friends.some(f => f.id === user.id);
              const isPending = pendingFriends.some(f => f.id === user.id);

              return (
                <div 
                  key={user.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-600"
                >
                  <div className="flex items-center gap-3">
                    {user.profile_picture ? (
                      <img 
                        src={user.profile_picture} 
                        alt={user.nickname}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-lg">{user.nickname[0]}</span>
                      </div>
                    )}
                    <span>{user.nickname}</span>
                  </div>

                  {!isFriend && !isPending && (
                    <button
                      onClick={() => addFriend(user.id)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full"
                    >
                      <UserPlus size={20} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pending Friend Requests */}
      {pendingFriends.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Pending Requests</h3>
          <div className="space-y-2">
            {pendingFriends.map((friend) => (
              <div 
                key={friend.id}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {friend.profilePicture ? (
                    <img 
                      src={friend.profilePicture} 
                      alt={friend.nickname}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-lg">{friend.nickname[0]}</span>
                    </div>
                  )}
                  <span>{friend.nickname}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => acceptFriendRequest(friend.id)}
                    className="p-2 bg-green-600 hover:bg-green-700 rounded-full"
                  >
                    <Check size={20} />
                  </button>
                  <button
                    onClick={() => rejectFriendRequest(friend.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Friends</h3>
        <div className="space-y-2">
          {friends.length === 0 ? (
            <p className="text-center text-gray-400 py-4">
              No friends yet. Use the search bar to find friends!
            </p>
          ) : (
            friends.map((friend) => (
              <div 
                key={friend.id}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {friend.profilePicture ? (
                    <img 
                      src={friend.profilePicture} 
                      alt={friend.nickname}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-lg">{friend.nickname[0]}</span>
                    </div>
                  )}
                  <div>
                    <div>{friend.nickname}</div>
                    <div className={`text-sm ${
                      friend.status === 'online' ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {friend.status === 'online' ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeFriend(friend.id)}
                  className="p-2 bg-red-600 hover:bg-red-700 rounded-full"
                >
                  <UserMinus size={20} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Friends;