import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUser, updateUser, CartItem } from '../utils/localStorage';
import { ShoppingCart, Trash2 } from 'lucide-react';

export const Cart = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const user = getUser(currentUser!);
    if (user) {
      setCart(user.cart);
    }
  }, [currentUser]);

  const removeFromCart = (id: number) => {
    const user = getUser(currentUser!);
    if (user) {
      const updatedCart = user.cart.filter(item => item.id !== id);
      updateUser(currentUser!, { cart: updatedCart });
      setCart(updatedCart);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <ShoppingCart className="w-10 h-10 text-green-500" />
          My Cart
        </h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-lg">
            <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Your cart is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-lg p-6 flex gap-4">
                  <img src={item.image} alt={item.title} className="w-24 h-24 object-contain rounded" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">From: {item.addedFrom}</p>
                    <p className="text-pink-600 font-bold text-xl">${item.price}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors self-start"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Items</span>
                    <span>{cart.length}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-xl font-bold text-gray-800">
                      <span>Total</span>
                      <span className="text-pink-600">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
