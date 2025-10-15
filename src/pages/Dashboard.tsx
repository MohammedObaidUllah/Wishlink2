import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUser, getUsers, updateUser } from '../utils/localStorage';
import { Plus, Users, ShoppingCart, List, UserPlus, Check, X, ShoppingBag } from 'lucide-react';

export const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser(currentUser!));
  const [allUsers, setAllUsers] = useState(getUsers());

  useEffect(() => {
    refreshData();
  }, [currentUser]);

  const refreshData = () => {
    setUser(getUser(currentUser!));
    setAllUsers(getUsers());
  };

  const handleAcceptRequest = (username: string) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      friends: [...user.friends, username],
      pendingRequests: user.pendingRequests.filter(u => u !== username)
    };

    const requester = getUser(username);
    if (requester) {
      updateUser(username, {
        friends: [...requester.friends, currentUser!],
        sentRequests: requester.sentRequests.filter(u => u !== currentUser!)
      });
    }

    updateUser(currentUser!, updatedUser);
    refreshData();
  };

  const handleRejectRequest = (username: string) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      pendingRequests: user.pendingRequests.filter(u => u !== username)
    };

    const requester = getUser(username);
    if (requester) {
      updateUser(username, {
        sentRequests: requester.sentRequests.filter(u => u !== currentUser!)
      });
    }

    updateUser(currentUser!, updatedUser);
    refreshData();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in-down">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Welcome back, {currentUser}! 👋
          </h1>
          <p className="text-gray-600 text-lg">Manage your wishlists and connect with friends</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <button
            onClick={() => navigate('/products')}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all border-2 border-transparent hover:border-orange-300 group animate-fade-in"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-orange-100 rounded-lg group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-800 text-lg">Browse Products</h3>
            <p className="text-sm text-gray-600 mt-1">Find items to add</p>
          </button>

          <button
            onClick={() => navigate('/wishlists/create')}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all border-2 border-transparent hover:border-pink-300 group animate-fade-in"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-pink-100 rounded-lg group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-pink-500" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-800 text-lg">Create Wishlist</h3>
            <p className="text-sm text-gray-600 mt-1">Start a new wishlist</p>
          </button>

          <button
            onClick={() => navigate('/wishlists')}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all border-2 border-transparent hover:border-purple-300 group animate-fade-in"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-purple-100 rounded-lg group-hover:scale-110 transition-transform">
                <List className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-800 text-lg">View Wishlists</h3>
            <p className="text-sm text-gray-600 mt-1">Browse all wishlists</p>
          </button>

          <button
            onClick={() => navigate('/friends')}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all border-2 border-transparent hover:border-blue-300 group animate-fade-in"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-800 text-lg">Friends</h3>
            <p className="text-sm text-gray-600 mt-1">{user.friends.length} friends</p>
          </button>

          <button
            onClick={() => navigate('/cart')}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all border-2 border-transparent hover:border-green-300 group animate-fade-in"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-green-100 rounded-lg group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-800 text-lg">My Cart</h3>
            <p className="text-sm text-gray-600 mt-1">{user.cart.length} items</p>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-pink-500" />
              Friend Requests
            </h2>
            {user.pendingRequests.length === 0 ? (
              <p className="text-gray-500 text-sm">No pending requests</p>
            ) : (
              <div className="space-y-3">
                {user.pendingRequests.map((username) => (
                  <div key={username} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">{username}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(username)}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRejectRequest(username)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <List className="w-5 h-5 text-purple-500" />
              My Wishlists
            </h2>
            {user.wishlists.length === 0 ? (
              <p className="text-gray-500 text-sm">No wishlists yet</p>
            ) : (
              <div className="space-y-3">
                {user.wishlists.map((wishlist) => (
                  <div
                    key={wishlist.id}
                    onClick={() => navigate(`/wishlists/${wishlist.id}`)}
                    className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg hover:shadow-md transition-all cursor-pointer border border-pink-200"
                  >
                    <h3 className="font-semibold text-gray-800">{wishlist.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{wishlist.items.length} items</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-white rounded-full text-xs font-medium text-pink-600">
                      {wishlist.category}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
