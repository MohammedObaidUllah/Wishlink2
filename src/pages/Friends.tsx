import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUser, getUsers, updateUser } from '../utils/localStorage';
import { Users, UserPlus, UserMinus } from 'lucide-react';

export const Friends = () => {
  const { currentUser } = useAuth();
  const [user, setUser] = useState(getUser(currentUser!));
  const [allUsers, setAllUsers] = useState(getUsers());

  useEffect(() => {
    refreshData();
  }, [currentUser]);

  const refreshData = () => {
    setUser(getUser(currentUser!));
    setAllUsers(getUsers());
  };

  const handleSendRequest = (username: string) => {
    if (!user) return;

    const recipient = getUser(username);
    if (!recipient) return;

    updateUser(currentUser!, {
      sentRequests: [...user.sentRequests, username]
    });

    updateUser(username, {
      pendingRequests: [...recipient.pendingRequests, currentUser!]
    });

    refreshData();
  };

  const handleRemoveFriend = (username: string) => {
    if (!user) return;

    const friend = getUser(username);
    if (!friend) return;

    updateUser(currentUser!, {
      friends: user.friends.filter(f => f !== username)
    });

    updateUser(username, {
      friends: friend.friends.filter(f => f !== currentUser!)
    });

    refreshData();
  };

  const nonFriends = allUsers.filter(
    u => u.username !== currentUser &&
    !user?.friends.includes(u.username) &&
    !user?.sentRequests.includes(u.username) &&
    !user?.pendingRequests.includes(u.username)
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <Users className="w-10 h-10 text-blue-500" />
          Friends
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              My Friends ({user.friends.length})
            </h2>
            {user.friends.length === 0 ? (
              <p className="text-gray-500 text-sm">No friends yet. Send some requests!</p>
            ) : (
              <div className="space-y-3">
                {user.friends.map((friendName) => (
                  <div key={friendName} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {friendName[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{friendName}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveFriend(friendName)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove friend"
                    >
                      <UserMinus className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Add Friends
            </h2>
            {nonFriends.length === 0 ? (
              <p className="text-gray-500 text-sm">No users to add</p>
            ) : (
              <div className="space-y-3">
                {nonFriends.map((u) => (
                  <div key={u.username} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        {u.username[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{u.username}</span>
                    </div>
                    <button
                      onClick={() => handleSendRequest(u.username)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}

            {user.sentRequests.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-600 mb-3">Sent Requests</h3>
                <div className="space-y-2">
                  {user.sentRequests.map((username) => (
                    <div key={username} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <span className="text-sm text-gray-700">{username} - Pending</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
