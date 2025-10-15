import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, LogOut, RotateCcw, ShoppingBag, List, Users, ShoppingCart, LayoutDashboard } from 'lucide-react';
import { resetStorage } from '../utils/localStorage';

export const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleReset = () => {
    if (confirm('Reset all data? This will clear everything and reload default users.')) {
      resetStorage();
      logout();
      window.location.reload();
    }
  };

  if (!currentUser) return null;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            <Heart className="w-7 h-7 text-pink-500" fill="currentColor" />
            WishLink
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-all hover:scale-110">
              <LayoutDashboard className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Dashboard</span>
            </Link>

            <Link to="/products" className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-all hover:scale-110">
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Products</span>
            </Link>

            <Link to="/wishlists" className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-all hover:scale-110">
              <List className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Wishlists</span>
            </Link>

            <Link to="/friends" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-all hover:scale-110">
              <Users className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Friends</span>
            </Link>

            <Link to="/cart" className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-all hover:scale-110">
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Cart</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 hidden md:inline">
              Welcome, <span className="text-pink-600">{currentUser}</span>
            </span>

            <button
              onClick={handleReset}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Reset All Data"
            >
              <RotateCcw className="w-5 h-5 text-gray-600" />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
