import { useState, useRef, useEffect } from "react";
import "./Header.css";
import logo from "../../assets/logo.png";

function Header({ onCartClick, onAuthClick, onLogoutClick, isAuthenticated, onProfileClick, user, cartCount = 0, onOrdersClick, onSellerClick, onSellerDashboard }) {
    const isSeller = user?.role === 'seller' || user?.role === 'ROLE_SELLER' || user?.role === 'SELLER';
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const menuRef = useRef(null);

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
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [menuOpen]);

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
                                <svg className="header__login-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                <span className="header__login-text">{user?.firstName || 'Mi Cuenta'}</span>
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
                            <svg className="header__login-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            <span className="header__login-text">Login / Register</span>
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

                {/* HAMBURGUESA (solo visible en movil via CSS) */}
                <button
                    type="button"
                    className="header__hamburger"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Menu"
                >
                    <span className={`header__hamburger-line${menuOpen ? ' header__hamburger-line--open' : ''}`} />
                    <span className={`header__hamburger-line${menuOpen ? ' header__hamburger-line--open' : ''}`} />
                    <span className={`header__hamburger-line${menuOpen ? ' header__hamburger-line--open' : ''}`} />
                </button>

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

            {/* MENU HAMBURGUESA OVERLAY (solo visible en movil via CSS) */}
            {menuOpen && (
                <div className="header__menu-overlay" onClick={() => setMenuOpen(false)}>
                    <nav className="header__menu" ref={menuRef} onClick={(e) => e.stopPropagation()}>
                        <div className="header__menu-header">
                            <img src={logo} alt="EliteShop" className="header__menu-logo" />
                            <span className="header__menu-brand">EliteShop</span>
                            <button type="button" className="header__menu-close" onClick={() => setMenuOpen(false)} aria-label="Cerrar menu">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* BUSCADOR DENTRO DEL MENU */}
                        <div className="header__menu-search">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input type="text" placeholder="Buscar productos" aria-label="Buscar productos" />
                        </div>

                        <div className="header__menu-divider" />

                        {/* CATEGORIAS DENTRO DEL MENU */}
                        <div className="header__menu-categories">
                            {categories.map((category) => (
                                <a href="#" key={category} onClick={() => setMenuOpen(false)}>{category}</a>
                            ))}
                        </div>

                        <div className="header__menu-divider" />

                        {isAuthenticated ? (
                            <>
                                <button type="button" className="header__menu-item" onClick={() => { setMenuOpen(false); onProfileClick?.(); }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    Mi Perfil
                                </button>
                                <button type="button" className="header__menu-item" onClick={() => { setMenuOpen(false); onOrdersClick?.(); }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                    </svg>
                                    Mis Pedidos
                                </button>
                                {isSeller ? (
                                    <button type="button" className="header__menu-item" onClick={() => { setMenuOpen(false); onSellerDashboard?.(); }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                            <path d="M2 17l10 5 10-5" />
                                            <path d="M2 12l10 5 10-5" />
                                        </svg>
                                        Mi Panel de Ventas
                                    </button>
                                ) : (
                                    <button type="button" className="header__menu-item" onClick={() => { setMenuOpen(false); onSellerClick?.(); }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                            <path d="M2 17l10 5 10-5" />
                                            <path d="M2 12l10 5 10-5" />
                                        </svg>
                                        Ser vendedor
                                    </button>
                                )}
                            </>
                        ) : (
                            <button type="button" className="header__menu-item header__menu-item--primary" onClick={() => { setMenuOpen(false); onAuthClick?.(); }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                    <polyline points="10 17 15 12 10 7" />
                                    <line x1="15" y1="12" x2="3" y2="12" />
                                </svg>
                                Iniciar Sesion
                            </button>
                        )}
                        <button type="button" className="header__menu-item" onClick={() => { setMenuOpen(false); onCartClick?.(); }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1" />
                                <circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                            Mi Carrito
                            {cartCount > 0 && <span className="header__menu-badge">{cartCount}</span>}
                        </button>
                        <button type="button" className="header__menu-item">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            Ayuda
                        </button>
                        {isAuthenticated && (
                            <>
                                <div className="header__menu-divider" />
                                <button type="button" className="header__menu-item header__menu-item--danger" onClick={() => { setMenuOpen(false); onLogoutClick?.(); }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                    Cerrar Sesion
                                </button>
                            </>
                        )}
                    </nav>
                </div>
            )}

        </header>
    );
}

export default Header;
