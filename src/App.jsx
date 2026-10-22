import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Category from './pages/Category';
import ProductDetails from './pages/ProductDetails';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import MyOrders from './pages/MyOrders';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import AuthModal from './components/AuthModal';
import TimedLoginBanner from './components/TimedLoginBanner';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-main font-body">
      {/* Hide customer Navbar on Admin page */}
      {!isAdminPage && <Navbar />}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:id" element={<Category />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success/:orderId" element={<OrderSuccess />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      {/* Hide customer Footer on Admin page */}
      {!isAdminPage && <Footer />}

      {/* Global E-commerce Modals & Overlays (Only for customers on store pages) */}
      {!isAdminPage && (
        <>
          <AuthModal />
          <TimedLoginBanner />
          <CartDrawer />
          <WishlistDrawer />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppContent />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
