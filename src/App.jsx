import { useState } from "react";
import "./App.css";

import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Header from "./components/Header/Header.jsx";
import Gallery from "./components/Gallery/Gallery.jsx";
import CartModal from "./components/CartModal/CartModal.jsx";
import { LoginForm } from "./components/auth/LoginForm.jsx";
import { RegisterForm } from "./components/auth/RegisterForm.jsx";

function AppContent() {
  const { isAuthenticated, logout } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [authView, setAuthView] = useState(null);

  return (
    <div className="app">
      <Header
        onCartClick={() => setIsCartOpen(true)}
        onAuthClick={() => setAuthView("login")}
        onLogoutClick={logout}
        isAuthenticated={isAuthenticated}
      />

      <main>
        <Gallery />
      </main>

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
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
