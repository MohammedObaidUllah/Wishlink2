import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUser, updateUser, getUsers, Wishlist } from '../utils/localStorage';
import { ArrowLeft, Edit, Trash2, Share2, ShoppingCart, MessageCircle, Send, Check } from 'lucide-react';

export const WishlistDetail = () => {
  const { currentUser } = useAuth();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [owner, setOwner] = useState<string>('');
  const [comment, setComment] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    const ownerUsername = location.state?.owner || currentUser;
    const user = getUser(ownerUsername!);
    if (user) {
      const found = user.wishlists.find(w => w.id === id);
      if (found) {
        setWishlist(found);
        setOwner(ownerUsername!);
      }
    }
  }, [id, currentUser, location]);

  const handleDelete = () => {
    if (!confirm('Delete this wishlist?')) return;

    const user = getUser(owner);
    if (user) {
      updateUser(owner, {
        wishlists: user.wishlists.filter(w => w.id !== id)
      });
      navigate('/dashboard');
    }
  };

  const handleAddToCart = (item: any) => {
    const user = getUser(currentUser!);
    if (user) {
      const cartItem = { ...item, addedFrom: wishlist?.title || 'Unknown' };
      if (!user.cart.find(i => i.id === item.id)) {
        updateUser(currentUser!, {
          cart: [...user.cart, cartItem]
        });
        alert('Added to cart!');
      }
    }
  };

  const toggleItemSelection = (itemId: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleCheckoutSelected = () => {
    if (selectedItems.size === 0) {
      alert('Please select at least one item');
      return;
    }

    const user = getUser(currentUser!);
    if (!user || !wishlist) return;

    const itemsToAdd = wishlist.items.filter(item => selectedItems.has(item.id));
    const updatedCart = [...user.cart];

    itemsToAdd.forEach(item => {
      const cartItem = { ...item, addedFrom: wishlist.title };
      if (!updatedCart.find(i => i.id === item.id)) {
        updatedCart.push(cartItem);
      }
    });

    updateUser(currentUser!, { cart: updatedCart });
    setSelectedItems(new Set());
    navigate('/checkout');
  };

  const getSelectedTotal = () => {
    if (!wishlist) return 0;
    return wishlist.items
      .filter(item => selectedItems.has(item.id))
      .reduce((sum, item) => sum + item.price, 0);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !wishlist) return;

    const newComment = {
      id: Date.now().toString(),
      username: currentUser!,
      text: comment,
      timestamp: Date.now()
    };

    const ownerUser = getUser(owner);
    if (ownerUser) {
      const updatedWishlists = ownerUser.wishlists.map(w =>
        w.id === id ? { ...w, comments: [...w.comments, newComment] } : w
      );
      updateUser(owner, { wishlists: updatedWishlists });
      setWishlist({ ...wishlist, comments: [...wishlist.comments, newComment] });
      setComment('');
    }
  };

  const handleShare = (platform: string) => {
    const url = `${window.location.origin}/wishlists/${id}`;
    const text = `Check out my wishlist: ${wishlist?.title}`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'instagram':
        alert('Instagram sharing: Copy this link and share in your story or bio: ' + url);
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        break;
    }
  };

  if (!wishlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <p className="text-gray-500">Wishlist not found</p>
      </div>
    );
  }

  const isOwner = owner === currentUser;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/wishlists')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Wishlists
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{wishlist.title}</h1>
              <p className="text-gray-600">{wishlist.description}</p>
              <p className="text-sm text-gray-500 mt-2">by {owner}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowShare(!showShare)}
                className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>

              {isOwner && (
                <>
                  <button
                    onClick={() => navigate(`/wishlists/edit/${id}`)}
                    className="p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {showShare && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-gray-700 mb-3">Share this wishlist:</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleShare('whatsapp')} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  WhatsApp
                </button>
                <button onClick={() => handleShare('twitter')} className="px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors">
                  Twitter
                </button>
                <button onClick={() => handleShare('instagram')} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all">
                  Instagram
                </button>
                <button onClick={() => handleShare('copy')} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                  Copy Link
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Items ({wishlist.items.length})</h2>
              {!isOwner && selectedItems.size > 0 && (
                <div className="text-sm font-medium text-pink-600 bg-pink-50 px-4 py-2 rounded-lg">
                  {selectedItems.size} selected
                </div>
              )}
            </div>
            {wishlist.items.length === 0 ? (
              <p className="text-gray-500">No items in this wishlist yet</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlist.items.map((item) => {
                    const isSelected = selectedItems.has(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer border-2 ${
                          isSelected ? 'border-pink-500 bg-pink-50' : 'border-transparent'
                        }`}
                      >
                        {!isOwner && (
                          <div className="flex items-start justify-between mb-3">
                            <button
                              onClick={() => toggleItemSelection(item.id)}
                              className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-pink-500 border-pink-500'
                                  : 'border-gray-300 hover:border-pink-400'
                              }`}
                            >
                              {isSelected && <Check className="w-4 h-4 text-white" />}
                            </button>
                          </div>
                        )}
                        <img src={item.image} alt={item.title} className="w-full h-48 object-contain mb-3 rounded" />
                        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{item.title}</h3>
                        <p className="text-pink-600 font-bold text-lg mb-3">${item.price}</p>
                        {!isOwner && (
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Add to Cart
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!isOwner && selectedItems.size > 0 && (
                  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
                    <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{selectedItems.size} items selected</p>
                        <p className="text-2xl font-bold text-pink-600">${getSelectedTotal().toFixed(2)}</p>
                      </div>
                      <button
                        onClick={handleCheckoutSelected}
                        className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Checkout Selected Items
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className={`bg-white rounded-xl shadow-lg p-8 ${selectedItems.size > 0 && !isOwner ? 'mb-32' : ''}`}>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-purple-500" />
            Comments ({wishlist.comments.length})
          </h2>

          {!isOwner && (
            <form onSubmit={handleAddComment} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {wishlist.comments.length === 0 ? (
              <p className="text-gray-500 text-sm">No comments yet</p>
            ) : (
              wishlist.comments.map((c) => (
                <div key={c.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {c.username[0].toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800">{c.username}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(c.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 ml-10">{c.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
