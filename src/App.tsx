import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CreateWishlist } from './pages/CreateWishlist';
import { Wishlists } from './pages/Wishlists';
import { WishlistDetail } from './pages/WishlistDetail';
import { Friends } from './pages/Friends';
import { Cart } from './pages/Cart';
import { Products } from './pages/Products';
import { Checkout } from './pages/Checkout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <>
      {currentUser && <Navbar />}
      <Routes>
        <Route path="/login" element={currentUser ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/wishlists/create" element={<ProtectedRoute><CreateWishlist /></ProtectedRoute>} />
        <Route path="/wishlists/edit/:id" element={<ProtectedRoute><CreateWishlist /></ProtectedRoute>} />
        <Route path="/wishlists" element={<ProtectedRoute><Wishlists /></ProtectedRoute>} />
        <Route path="/wishlists/:id" element={<ProtectedRoute><WishlistDetail /></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
