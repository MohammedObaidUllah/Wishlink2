import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUser, getUsers, Wishlist } from '../utils/localStorage';
import { List, Lock, Globe, Users } from 'lucide-react';

export const Wishlists = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'mine' | 'friends'>('all');
  const [visibleWishlists, setVisibleWishlists] = useState<(Wishlist & { ownerName: string })[]>([]);

  useEffect(() => {
    const user = getUser(currentUser!);
    const allUsers = getUsers();

    if (!user) return;

    let wishlists: (Wishlist & { ownerName: string })[] = [];

    allUsers.forEach((u) => {
      u.wishlists.forEach((wishlist) => {
        const canView =
          wishlist.owner === currentUser ||
          (wishlist.category === 'public' && user.friends.includes(wishlist.owner)) ||
          (wishlist.category === 'selected' && wishlist.selectedFriends.includes(currentUser!));

        if (canView) {
          wishlists.push({ ...wishlist, ownerName: u.username });
        }
      });
    });

    if (filter === 'mine') {
      wishlists = wishlists.filter(w => w.owner === currentUser);
    } else if (filter === 'friends') {
      wishlists = wishlists.filter(w => w.owner !== currentUser);
    }

    setVisibleWishlists(wishlists);
  }, [currentUser, filter]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'public':
        return <Globe className="w-4 h-4" />;
      case 'private':
        return <Lock className="w-4 h-4" />;
      case 'selected':
        return <Users className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
            <List className="w-10 h-10 text-purple-500" />
            Wishlists
          </h1>

          <div className="flex gap-2">
            {['all', 'mine', 'friends'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === f
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {f === 'all' ? 'All' : f === 'mine' ? 'My Wishlists' : "Friends' Wishlists"}
              </button>
            ))}
          </div>
        </div>

        {visibleWishlists.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-lg">
            <p className="text-gray-500 text-lg">No wishlists found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleWishlists.map((wishlist) => (
              <div
                key={`${wishlist.owner}-${wishlist.id}`}
                onClick={() => navigate(`/wishlists/${wishlist.id}`, { state: { owner: wishlist.owner } })}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-1 transition-all cursor-pointer"
              >
                <div className="h-48 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 flex items-center justify-center">
                  {wishlist.items.length > 0 ? (
                    <img
                      src={wishlist.items[0].image}
                      alt={wishlist.title}
                      className="w-32 h-32 object-contain"
                    />
                  ) : (
                    <List className="w-20 h-20 text-white opacity-50" />
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{wishlist.title}</h3>
                    {getCategoryIcon(wishlist.category)}
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {wishlist.description || 'No description'}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      by <span className="font-medium text-pink-600">{wishlist.ownerName}</span>
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      {wishlist.items.length} items
                    </span>
                  </div>

                  {wishlist.comments.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <span className="text-xs text-gray-500">
                        {wishlist.comments.length} comment{wishlist.comments.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
