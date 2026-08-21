import { useState, useCallback, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import "./App.css";

import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { cartService } from "./services/cart.service.js";
import { sellerService } from "./services/seller.service.js";
import Header from "./components/Header/Header.jsx";
import Gallery from "./components/Gallery/Gallery.jsx";
import ProductDetail from "./components/ProductDetail/ProductDetail.jsx";
import CartModal from "./components/CartModal/CartModal.jsx";
import Profile from "./components/Profile/Profile.jsx";
import Checkout from "./components/Checkout/Checkout.jsx";
import SellerRegistration from "./components/Seller/SellerRegistration.jsx";
import SellerDashboard from "./components/Seller/SellerDashboard.jsx";
import SellerProductCreate from "./components/Seller/SellerProductCreate.jsx";
import OrderTracking from "./components/OrderTracking/OrderTracking.jsx";
import BuyerOrders from "./components/Orders/BuyerOrders.jsx";
import BuyerOrderTracking from "./components/Orders/BuyerOrderTracking.jsx";
import SellerOrders from "./components/Seller/SellerOrders.jsx";
import ShippingLabel from "./components/Seller/ShippingLabel.jsx";
import { LoginForm } from "./components/auth/LoginForm.jsx";
import { RegisterForm } from "./components/auth/RegisterForm.jsx";

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [authView, setAuthView] = useState(null);
  const [cart, setCart] = useState(null);
  const [cartNotice, setCartNotice] = useState("");
  const [sellerId, setSellerId] = useState(() => localStorage.getItem('sellerId'));

  const isSeller = user?.role === 'seller' || user?.role === 'ROLE_SELLER' || user?.role === 'SELLER';

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return null;
    }
    try {
      const data = await cartService.getCart();
      setCart(data);
      return data;
    } catch {
      setCart(null);
      return null;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    async function loadCart() {
      try {
        const data = await cartService.getCart();
        if (!cancelled) setCart(data);
      } catch {
        if (!cancelled) setCart(null);
      }
    }

    loadCart();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !isSeller || sellerId) return;
    let cancelled = false;

    async function loadSellerId() {
      const storedSellerId = localStorage.getItem('sellerId');
      if (storedSellerId) {
        const existing = await sellerService.getById(storedSellerId).catch(() => null);
        if (!cancelled && existing) {
          setSellerId(existing.id);
          return;
        }
      }

      if (user?.sellerId) {
        const existing = await sellerService.getById(user.sellerId).catch(() => null);
        if (!cancelled && existing) {
          setSellerId(existing.id);
          localStorage.setItem('sellerId', existing.id);
          return;
        }
      }

      const data = await sellerService.getAll().catch(() => null);
      if (cancelled) return;
      const list = Array.isArray(data) ? data : (data?.content || []);
      const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
      const mine = list.find((s) => s.fullname === fullName);
      if (mine && !cancelled) {
        setSellerId(mine.id);
        localStorage.setItem('sellerId', mine.id);
      }
    }

    loadSellerId();
    return () => { cancelled = true; };
  }, [isAuthenticated, isSeller, sellerId, user?.firstName, user?.lastName, user?.sellerId]);

  const handleCartClick = () => {
    if (!isAuthenticated) {
      setAuthView("login");
      return;
    }
    setIsCartOpen(true);
  };

  const handleAddToCart = async (product, quantity) => {
    if (!isAuthenticated) {
      setAuthView("login");
      return;
    }
    try {
      await cartService.addItem(product.id, quantity);
      await refreshCart();
      setCartNotice(`${product.name} agregado al carrito`);
      setTimeout(() => setCartNotice(""), 2500);
    } catch (err) {
      setCartNotice(err.response?.data?.message || "No se pudo agregar al carrito");
      setTimeout(() => setCartNotice(""), 2500);
    }
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate("/checkout");
  };

  const handleLogout = () => {
    logout();
    setCart(null);
    navigate("/");
  };

  const goToProfile = () => {
    if (!isAuthenticated) {
      setAuthView("login");
      return;
    }
    navigate("/profile");
  };

  const goToOrders = () => {
    if (!isAuthenticated) {
      setAuthView("login");
      return;
    }
    navigate("/profile/orders");
  };

  const handleSellerRegistered = (id) => {
    setSellerId(id);
    localStorage.setItem('sellerId', id);
    navigate("/seller/dashboard");
  };

  const goToSellerDashboard = async (id) => {
    let dashId = id || sellerId || localStorage.getItem('sellerId');

    if (!dashId && isSeller) {
      const storedId = localStorage.getItem('sellerId');
      if (storedId) {
        const existing = await sellerService.getById(storedId).catch(() => null);
        if (existing) dashId = existing.id;
      }
      if (!dashId && user?.sellerId) {
        const existing = await sellerService.getById(user.sellerId).catch(() => null);
        if (existing) dashId = existing.id;
      }
      if (!dashId) {
        const data = await sellerService.getAll().catch(() => null);
        const list = Array.isArray(data) ? data : (data?.content || []);
        const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
        const mine = list.find((s) => s.fullname === fullName);
        if (mine) dashId = mine.id;
      }
      if (!dashId && user?.id) {
        const existing = await sellerService.getById(user.id).catch(() => null);
        if (existing) dashId = existing.id;
      }
    }

    if (dashId) {
      setSellerId(dashId);
      localStorage.setItem('sellerId', dashId);
    }

    if (isSeller) {
      navigate("/seller/dashboard");
    } else {
      navigate("/seller");
    }
  };

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="app">
      {!isAuthPage && (
        <Header
          onCartClick={handleCartClick}
          onAuthClick={() => setAuthView("login")}
          onLogoutClick={handleLogout}
          onProfileClick={goToProfile}
          onSellerClick={() => navigate("/seller")}
          onSellerDashboard={() => goToSellerDashboard()}
          isAuthenticated={isAuthenticated}
          user={user}
          cartCount={cart?.itemCount || 0}
          onOrdersClick={goToOrders}
        />
      )}

      <main>
        <Routes>
          <Route path="/" element={<Gallery onProductClick={(p) => navigate(`/product/${p.id}`)} />} />
          <Route path="/product/:id" element={<ProductDetail onBack={() => navigate("/")} onAddToCart={handleAddToCart} />} />
          <Route path="/profile" element={<Profile onBack={() => navigate("/")} />} />
          <Route path="/profile/orders" element={<BuyerOrders />} />
          <Route path="/profile/orders/:orderId/tracking" element={<BuyerOrderTracking />} />
          <Route path="/checkout" element={<Checkout onBack={() => navigate("/")} onSuccess={() => refreshCart()} />} />
          <Route path="/order" element={<OrderTracking onBack={() => navigate("/")} />} />
          <Route path="/order/:orderId" element={<OrderTracking onBack={() => navigate("/")} />} />
          <Route path="/seller" element={<SellerRegistration onBack={() => navigate("/profile")} onSellerRegistered={handleSellerRegistered} />} />
          <Route path="/seller/dashboard" element={<SellerDashboard sellerId={sellerId} onBack={() => navigate("/profile")} onNavigate={(path) => navigate(path)} />} />
          <Route path="/seller/orders" element={<SellerOrders sellerId={sellerId} onBack={() => navigate('/seller/dashboard')} />} />
          <Route path="/seller/orders/:orderId/shipping-label" element={<ShippingLabel />} />
          <Route path="/seller/products/new" element={<SellerProductCreate sellerId={sellerId} onBack={() => navigate("/seller/dashboard")} />} />
          <Route
            path="/login"
            element={(
              <LoginForm
                onSwitchToRegister={() => navigate("/register")}
                onSuccess={() => navigate("/")}
              />
            )}
          />
          <Route
            path="/register"
            element={(
              <RegisterForm
                onSwitchToLogin={() => navigate("/login")}
                onSuccess={() => navigate("/")}
              />
            )}
          />
          <Route path="*" element={<Gallery onProductClick={(p) => navigate(`/product/${p.id}`)} />} />
        </Routes>
      </main>

      {cartNotice && <div className="app__toast">{cartNotice}</div>}

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
        cart={cart}
        onCartChange={refreshCart}
      />

      {authView === "login" && (
        <LoginForm
          onSwitchToRegister={() => setAuthView("register")}
          onSuccess={() => setAuthView(null)}
        />
      )}

      {authView === "register" && (
        <RegisterForm
          onSwitchToLogin={() => setAuthView("login")}
          onSuccess={() => setAuthView(null)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;