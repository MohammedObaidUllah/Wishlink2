import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUser, updateUser, WishlistItem } from '../utils/localStorage';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

export const CreateWishlist = () => {
  const { currentUser } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'public' | 'private' | 'selected'>('public');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [showProducts, setShowProducts] = useState(false);
  const [products, setProducts] = useState<WishlistItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const user = getUser(currentUser!);
    if (id && user) {
      const wishlist = user.wishlists.find(w => w.id === id);
      if (wishlist) {
        setTitle(wishlist.title);
        setDescription(wishlist.description);
        setCategory(wishlist.category);
        setSelectedFriends(wishlist.selectedFriends);
        setItems([...wishlist.items]);
      }
    }
  }, [id, currentUser]);

  useEffect(() => {
    fetch('https://fakestoreapi.com/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = getUser(currentUser!);
    if (!user) return;

    const newWishlist = {
      id: id || Date.now().toString(),
      title,
      description,
      category,
      selectedFriends: category === 'selected' ? selectedFriends : [],
      items,
      comments: id ? user.wishlists.find(w => w.id === id)?.comments || [] : [],
      owner: currentUser!
    };

    const updatedWishlists = id
      ? user.wishlists.map(w => w.id === id ? newWishlist : w)
      : [...user.wishlists, newWishlist];

    updateUser(currentUser!, { wishlists: updatedWishlists });
    navigate('/dashboard');
  };

  const addItem = (product: WishlistItem) => {
    if (!items.find(i => i.id === product.id)) {
      setItems([...items, product]);
    }
  };

  const removeItem = (id: number) => {
    setItems(items.filter(i => i.id !== id));
  };

  const toggleFriend = (friend: string) => {
    setSelectedFriends(prev =>
      prev.includes(friend)
        ? prev.filter(f => f !== friend)
        : [...prev, friend]
    );
  };

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const user = getUser(currentUser!);
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            {id ? 'Edit Wishlist' : 'Create New Wishlist'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                placeholder="My Dream Wishlist"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                placeholder="Optional description..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibility
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              >
                <option value="public">Public - All friends can see</option>
                <option value="private">Private - Only me</option>
                <option value="selected">Selected Friends Only</option>
              </select>
            </div>

            {category === 'selected' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Friends
                </label>
                <div className="space-y-2">
                  {user.friends.map((friend) => (
                    <label key={friend} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedFriends.includes(friend)}
                        onChange={() => toggleFriend(friend)}
                        className="w-4 h-4 text-pink-500 rounded"
                      />
                      <span className="text-gray-700">{friend}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Items ({items.length})
                </label>
                <button
                  type="button"
                  onClick={() => setShowProducts(!showProducts)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Items
                </button>
              </div>

              {items.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <img src={item.image} alt={item.title} className="w-16 h-16 object-contain rounded" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                        <p className="text-sm text-pink-600 font-bold">${item.price}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {showProducts && (
                <div className="border-2 border-pink-200 rounded-lg p-4 bg-pink-50">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products..."
                    className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg"
                  />
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {filteredProducts.map((product) => (
                      <div key={product.id} className="flex gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-all">
                        <img src={product.image} alt={product.title} className="w-16 h-16 object-contain rounded" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{product.title}</p>
                          <p className="text-sm text-pink-600 font-bold">${product.price}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addItem(product)}
                          disabled={items.find(i => i.id === product.id) !== undefined}
                          className="px-3 py-1 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                          {items.find(i => i.id === product.id) ? 'Added' : 'Add'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                {id ? 'Update Wishlist' : 'Create Wishlist'}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
