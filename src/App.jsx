import { useState } from "react";
import "./App.css";

import Header from "./components/Header/Header.jsx";
import Hero from "./components/Hero/Hero.jsx";
import Gallery from "./components/Gallery/Gallery.jsx";
import CartModal from "./components/CartModal/CartModal.jsx";

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="app">
      <Header
        onCartClick={() => setIsCartOpen(true)}
      />

      <main>
        <Gallery />
      </main>

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
}

export default App;