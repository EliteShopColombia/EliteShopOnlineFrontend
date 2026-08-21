import { useState, useRef, useEffect } from "react";
import "./Header.css";
import logo from "../../assets/logo.png";

function Header({ onCartClick, onAuthClick, onLogoutClick, isAuthenticated, onProfileClick, user, cartCount = 0, onOrdersClick, onSellerClick, onSellerDashboard }) {
    const isSeller = user?.role === 'seller' || user?.role === 'ROLE_SELLER' || user?.role === 'SELLER';
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const categories = [
        "Categorías",
        "Medicina",
        "Deportes",
        "Belleza",
        "Ropa",
        "Tecnología",
        "Manualidades",
        "Juguetes",
        "Automotriz",
        "Otro",
    ];

    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="header">

            <div className="header__top">

                {/* LOGO + NOMBRE */}
                <a
                    href="/"
                    className="header__brand"
                >
                    <img
                        src={logo}
                        alt="EliteShop"
                        className="header__logo"
                    />

                    <span>EliteShop</span>
                </a>


                {/* BUSCADOR */}
                <div className="header__search-container">

                    <div className="header__search-bar">

                        <svg className="header__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>

                        <input
                            type="text"
                            placeholder="Ropa para hombre"
                            aria-label="Buscar productos"
                        />

                    </div>

                </div>


                {/* ACCIONES */}
                <div className="header__actions">

                    {isAuthenticated ? (
                        <div className="header__profile" ref={dropdownRef}>
                            <button
                                type="button"
                                className="header__login"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                {user?.firstName || 'Mi Cuenta'}
                            </button>

                            {dropdownOpen && (
                                <div className="header__dropdown">
                                    <button
                                        type="button"
                                        className="header__dropdown-item"
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            onProfileClick?.();
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        Mi Perfil
                                    </button>
                                    <button
                                        type="button"
                                        className="header__dropdown-item"
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            onOrdersClick?.();
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                            <line x1="16" y1="13" x2="8" y2="13" />
                                            <line x1="16" y1="17" x2="8" y2="17" />
                                            <polyline points="10 9 9 9 8 9" />
                                        </svg>
                                        Mis Pedidos
                                    </button>
                                    {isSeller ? (
                                        <button
                                            type="button"
                                            className="header__dropdown-item"
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                onSellerDashboard?.();
                                            }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                                <path d="M2 17l10 5 10-5" />
                                                <path d="M2 12l10 5 10-5" />
                                            </svg>
                                            Mi Panel de Ventas
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="header__dropdown-item"
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                onSellerClick?.();
                                            }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                                <path d="M2 17l10 5 10-5" />
                                                <path d="M2 12l10 5 10-5" />
                                            </svg>
                                            Ser vendedor
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="header__dropdown-item header__dropdown-item--danger"
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            onLogoutClick?.();
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                            <polyline points="16 17 21 12 16 7" />
                                            <line x1="21" y1="12" x2="9" y2="12" />
                                        </svg>
                                        Cerrar Sesion
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            type="button"
                            className="header__login"
                            onClick={onAuthClick}
                        >
                            Login / Register
                        </button>
                    )}

                    <button
                        type="button"
                        className="header__help"
                        aria-label="Ayuda"
                    >
                        ?
                    </button>

                    <button
                        type="button"
                        className="header__cart"
                        onClick={onCartClick}
                        aria-label="Carrito"
                    >
                        🛒
                        {cartCount > 0 && (
                            <span className="header__cart-badge">{cartCount}</span>
                        )}
                    </button>

                </div>

            </div>


            {/* CATEGORÍAS */}
            <nav className="header__categories">

                {categories.map((category) => (
                    <a
                        href="#"
                        key={category}
                    >
                        {category}
                    </a>
                ))}

            </nav>

        </header>
    );
}

export default Header;
