import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUser, updateUser, WishlistItem } from '../utils/localStorage';
import { ShoppingBag, Plus, Search, Filter } from 'lucide-react';

export const Products = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<WishlistItem[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<WishlistItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<WishlistItem | null>(null);

  useEffect(() => {
    fetch('https://fakestoreapi.com/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setFilteredProducts(data);
        const uniqueCategories = ['all', ...new Set(data.map((p: any) => p.category))];
        setCategories(uniqueCategories);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  const handleAddToWishlist = (product: WishlistItem) => {
    setSelectedProduct(product);
    setShowWishlistModal(true);
  };

  const addToWishlist = (wishlistId: string) => {
    if (!selectedProduct) return;

    const user = getUser(currentUser!);
    if (!user) return;

    const updatedWishlists = user.wishlists.map(w => {
      if (w.id === wishlistId) {
        if (!w.items.find(i => i.id === selectedProduct.id)) {
          return { ...w, items: [...w.items, selectedProduct] };
        }
      }
      return w;
    });

    updateUser(currentUser!, { wishlists: updatedWishlists });
    setShowWishlistModal(false);
    setSelectedProduct(null);
    alert('Added to wishlist!');
  };

  const user = getUser(currentUser!);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <ShoppingBag className="w-10 h-10 text-pink-500" />
            Browse Products
          </h1>
          <p className="text-gray-600">Discover amazing products to add to your wishlists</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all appearance-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-lg">
            <div className="animate-spin w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-1 transition-all"
              >
                <div className="h-64 bg-gray-50 flex items-center justify-center p-4">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="p-4">
                  <p className="text-xs text-gray-500 uppercase mb-2">{product.category}</p>
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 h-12">
                    {product.title}
                  </h3>
                  <p className="text-2xl font-bold text-pink-600 mb-4">${product.price}</p>

                  <button
                    onClick={() => handleAddToWishlist(product)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add to Wishlist
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center shadow-lg">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        )}
      </div>

      {showWishlistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Select Wishlist</h2>

            {!user || user.wishlists.length === 0 ? (
              <p className="text-gray-500 mb-6">You don't have any wishlists yet. Create one first!</p>
            ) : (
              <div className="space-y-3 mb-6">
                {user.wishlists.map((wishlist) => (
                  <button
                    key={wishlist.id}
                    onClick={() => addToWishlist(wishlist.id)}
                    className="w-full p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg hover:shadow-md transition-all text-left border-2 border-transparent hover:border-pink-300"
                  >
                    <h3 className="font-semibold text-gray-800">{wishlist.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{wishlist.items.length} items</p>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setShowWishlistModal(false);
                setSelectedProduct(null);
              }}
              className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
