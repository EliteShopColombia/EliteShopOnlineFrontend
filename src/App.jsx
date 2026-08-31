import { useState, useCallback, useEffect, useRef } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import "./App.css";

import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { cartService } from "./services/cart.service.js";
import { parseApiError } from "./helpers/api.helpers.js";
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
import AdminLayout from "./components/Admin/AdminLayout.jsx";
import AdminDashboard from "./components/Admin/AdminDashboard.jsx";
import AdminCustomers from "./components/Admin/AdminCustomers.jsx";
import AdminSellers from "./components/Admin/AdminSellers.jsx";
import AdminSellerDetail from "./components/Admin/AdminSellerDetail.jsx";
import AdminOrders from "./components/Admin/AdminOrders.jsx";
import { LoginForm } from "./components/auth/LoginForm.jsx";
import { RegisterForm } from "./components/auth/RegisterForm.jsx";
import FAQ from "./components/FAQ/FAQ.jsx";

function AppContent() {
  const { auth, user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [authView, setAuthView] = useState(null);
  const [cart, setCart] = useState(null);
  const [cartNotice, setCartNotice] = useState("");
  const sellerId = auth?.sellerId || null;

  const isSeller = user?.role === 'seller' || user?.role === 'ROLE_SELLER' || user?.role === 'SELLER';

  // --- Estado de filtros de productos ---
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const debounceTimerRef = useRef(null);

  const handleSearch = useCallback((query) => {
    // Limpiar debounce anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setSearchQuery(query);
    }, 300);
  }, []);

  const handleCategoryChange = useCallback((category) => {
    setActiveCategory(category);
    // Si cambia categoría, resetear búsqueda para mostrar resultados más amplios
    // (opcional: comentar esta línea si quieres mantener la búsqueda al cambiar categoría)
    // setSearchQuery('');
  }, []);

  // Limpiar debounce al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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
      const { error } = parseApiError(err);
      setCartNotice(error || "No se pudo agregar al carrito");
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

  const handleSellerRegistered = () => {
    navigate("/seller/dashboard");
  };

  const goToSellerDashboard = () => {
    if (isSeller) {
      navigate("/seller/dashboard");
    } else {
      navigate("/seller");
    }
  };

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="app">
      {!isAuthPage && !isAdminPage && (
        <Header
          onCartClick={handleCartClick}
          onAuthClick={() => setAuthView("login")}
          onLogoutClick={handleLogout}
          onProfileClick={goToProfile}
          onSellerClick={() => navigate("/seller")}
          onSellerDashboard={() => goToSellerDashboard()}
          onAdminClick={() => navigate("/admin")}
          onHelpClick={() => navigate("/faq")}
          isAuthenticated={isAuthenticated}
          user={user}
          cartCount={cart?.itemCount || 0}
          onOrdersClick={goToOrders}
          searchQuery={searchQuery}
          activeCategory={activeCategory}
          onSearch={handleSearch}
          onCategoryChange={handleCategoryChange}
        />
      )}

      <main>
        <Routes>
          <Route path="/" element={
            <Gallery
              onProductClick={(p) => navigate(`/product/${p.id}`)}
              searchQuery={searchQuery}
              activeCategory={activeCategory}
            />
          } />
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
          <Route path="/seller/products/:productId/edit" element={<SellerProductCreate sellerId={sellerId} onBack={() => navigate("/seller/dashboard")} />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="sellers" element={<AdminSellers />} />
            <Route path="sellers/:id" element={<AdminSellerDetail />} />
            <Route path="orders" element={<AdminOrders />} />
          </Route>
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
          <Route path="/faq" element={<FAQ onBack={() => navigate("/")} />} />
          <Route path="*" element={
            <Gallery
              onProductClick={(p) => navigate(`/product/${p.id}`)}
              searchQuery={searchQuery}
              activeCategory={activeCategory}
            />
          } />
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
