import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import logo from "../../assets/logo.png";
import { PRODUCT_CATEGORIES } from "../../constants/categories";
import CategoryIcon from "../shared/CategoryIcon";

function Icon({ size = 18, children }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

const icons = {
    user: (
        <>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </>
    ),
    orders: (
        <>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
        </>
    ),
    store: (
        <>
            <path d="M12 2 2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
        </>
    ),
    shield: (
        <>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
        </>
    ),
    logout: (
        <>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </>
    ),
    close: (
        <>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </>
    ),
    search: (
        <>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </>
    ),
    cart: (
        <>
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </>
    ),
    help: (
        <>
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </>
    ),
    login: (
        <>
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
        </>
    ),
    grid: (
        <>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </>
    ),
    chevronDown: <path d="m6 9 6 6 6-6" />,
};

function Header({
    onCartClick,
    onAuthClick,
    onLogoutClick,
    isAuthenticated,
    onProfileClick,
    user,
    cartCount = 0,
    onOrdersClick,
    onSellerClick,
    onSellerDashboard,
    onAdminClick,
    onHelpClick,
    searchQuery,
    activeCategory,
    onSearch,
    onCategoryChange,
}) {
    const navigate = useNavigate();
    const isSeller = user?.role === 'seller' || user?.role === 'ROLE_SELLER' || user?.role === 'SELLER';
    const isAdmin = user?.role === 'admin' || user?.role === 'ROLE_ADMIN';
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [categoriesOpen, setCategoriesOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [localSearch, setLocalSearch] = useState(searchQuery || '');
    const dropdownRef = useRef(null);
    const categoriesRef = useRef(null);
    const menuRef = useRef(null);
    const searchInputRef = useRef(null);
    const mobileSearchRef = useRef(null);

    // Debounce: disparar búsqueda 400ms después de que el usuario deja de escribir
    useEffect(() => {
        if (!onSearch) return;
        const timer = setTimeout(() => {
            onSearch(localSearch);
        }, 400);
        return () => clearTimeout(timer);
    }, [localSearch, onSearch]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
            if (categoriesRef.current && !categoriesRef.current.contains(e.target)) {
                setCategoriesOpen(false);
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

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setCategoriesOpen(false);
                setDropdownOpen(false);
                setMenuOpen(false);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onSearch?.(localSearch);
        navigate("/");
    };

    const applyCategory = (categoryValue) => {
        onCategoryChange?.(categoryValue);
        setCategoriesOpen(false);
        setMenuOpen(false);
        navigate("/");
    };

    const resetCatalog = () => {
        setLocalSearch('');
        onSearch?.('');
        onCategoryChange?.('');
    };

    const handleClearSearch = () => {
        setLocalSearch('');
        onSearch?.('');
        searchInputRef.current?.focus();
    };

    const handleMobileClearSearch = () => {
        setLocalSearch('');
        onSearch?.('');
        mobileSearchRef.current?.focus();
    };



    return (
        <>
        <header className="header">

            <div className="header__top">

                {/* LOGO + NOMBRE */}
                <Link
                    to="/"
                    className="header__brand"
                    aria-label="EliteShop, ir al inicio"
                    onClick={resetCatalog}
                >
                    <img src={logo} alt="" className="header__logo" />
                    <span className="header__wordmark">EliteShop</span>
                </Link>

                {/* NAVEGACIÓN DE CATEGORÍAS */}
                <div className="header__categories-wrap" ref={categoriesRef}>
                    <button
                        type="button"
                        className={`header__categories-trigger${categoriesOpen ? " header__categories-trigger--open" : ""}`}
                        onClick={() => setCategoriesOpen((open) => !open)}
                        aria-haspopup="menu"
                        aria-expanded={categoriesOpen}
                        aria-controls="header-mega"
                    >
                        <Icon size={18}>{icons.grid}</Icon>
                        <span>Categorías</span>
                        <span className="header__categories-chevron">
                            <Icon size={14}>{icons.chevronDown}</Icon>
                        </span>
                    </button>

                    {categoriesOpen && (
                        <div id="header-mega" className="header__mega" role="menu" aria-label="Categorías">
                            <div className="header__mega-head">
                                <span>Categorías</span>
                                <Link to="/categorias" onClick={() => setCategoriesOpen(false)}>
                                    Ver todas las categorías
                                </Link>
                            </div>
                            <div className="header__mega-grid">
                                {PRODUCT_CATEGORIES.map(({ value, label }) => (
                                    <button
                                        type="button"
                                        role="menuitem"
                                        key={value}
                                        className={`header__mega-item${activeCategory === value ? " header__mega-item--active" : ""}`}
                                        aria-current={activeCategory === value ? "true" : undefined}
                                        onClick={() => applyCategory(value)}
                                    >
                                        <CategoryIcon category={value} size={18} />
                                        <span>{label}</span>
                                    </button>
                                ))}
                            </div>
                            <button
                                type="button"
                                className="header__mega-footer"
                                onClick={() => applyCategory("")}
                            >
                                <span>Encuentra productos para cada momento</span>
                                <span>Ver catálogo</span>
                            </button>
                        </div>
                    )}
                </div>


                {/* BUSCADOR */}
                <div className="header__search-container">

                    <form className="header__search-bar" onSubmit={handleSearchSubmit} role="search">

                        <span className="header__search-icon">
                            <Icon size={19}>{icons.search}</Icon>
                        </span>

                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Buscar productos…"
                            aria-label="Buscar productos"
                            enterKeyHint="search"
                            autoComplete="off"
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                        />

                        {localSearch && (
                            <button
                                type="button"
                                className="header__search-clear"
                                onClick={handleClearSearch}
                                aria-label="Limpiar búsqueda"
                            >
                                <Icon size={14}>{icons.close}</Icon>
                            </button>
                        )}

                    </form>

                </div>


                {/* ACCIONES */}
                <div className="header__actions">

                    {isAuthenticated ? (
                        <div className="header__profile" ref={dropdownRef}>
                            <button
                                type="button"
                                className="header__login"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                aria-haspopup="menu"
                                aria-expanded={dropdownOpen}
                            >
                                <span className="header__login-icon">
                                    <Icon size={17}>{icons.user}</Icon>
                                </span>
                                <span className="header__login-text">{user?.firstName || 'Mi cuenta'}</span>
                            </button>

                            {dropdownOpen && (
                                <div className="header__dropdown" role="menu">
                                    <button
                                        type="button"
                                        className="header__dropdown-item"
                                        role="menuitem"
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            onProfileClick?.();
                                        }}
                                    >
                                        <Icon size={16}>{icons.user}</Icon>
                                        Mi perfil
                                    </button>
                                    {!isAdmin && (
                                        <>
                                            <button
                                                type="button"
                                                className="header__dropdown-item"
                                                role="menuitem"
                                                onClick={() => {
                                                    setDropdownOpen(false);
                                                    onOrdersClick?.();
                                                }}
                                            >
                                                <Icon size={16}>{icons.orders}</Icon>
                                                Mis pedidos
                                            </button>
                                            {isSeller ? (
                                                <button
                                                    type="button"
                                                    className="header__dropdown-item"
                                                    role="menuitem"
                                                    onClick={() => {
                                                        setDropdownOpen(false);
                                                        onSellerDashboard?.();
                                                    }}
                                                >
                                                    <Icon size={16}>{icons.store}</Icon>
                                                    Mi panel de ventas
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="header__dropdown-item"
                                                    role="menuitem"
                                                    onClick={() => {
                                                        setDropdownOpen(false);
                                                        onSellerClick?.();
                                                    }}
                                                >
                                                    <Icon size={16}>{icons.store}</Icon>
                                                    Ser vendedor
                                                </button>
                                            )}
                                        </>
                                    )}
                                    {isAdmin && (
                                        <button
                                            type="button"
                                            className="header__dropdown-item"
                                            role="menuitem"
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                onAdminClick?.();
                                            }}
                                        >
                                            <Icon size={16}>{icons.shield}</Icon>
                                            Panel admin
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="header__dropdown-item header__dropdown-item--danger"
                                        role="menuitem"
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            onLogoutClick?.();
                                        }}
                                    >
                                        <Icon size={16}>{icons.logout}</Icon>
                                        Cerrar sesión
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
                            <span className="header__login-icon">
                                <Icon size={17}>{icons.user}</Icon>
                            </span>
                            <span className="header__login-text">Ingresar</span>
                        </button>
                    )}

                    <button
                        type="button"
                        className="header__help"
                        aria-label="Ayuda"
                        onClick={onHelpClick}
                    >
                        <Icon size={19}>{icons.help}</Icon>
                    </button>

                    <button
                        type="button"
                        className="header__cart"
                        onClick={onCartClick}
                        aria-label={cartCount > 0 ? `Carrito, ${cartCount} productos` : "Carrito"}
                    >
                        <Icon size={20}>{icons.cart}</Icon>
                        {cartCount > 0 && (
                            <span className="header__cart-badge" aria-hidden="true">{cartCount}</span>
                        )}
                    </button>

                </div>

                {/* HAMBURGUESA (solo visible en móvil y tablet) */}
                <button
                    type="button"
                    className="header__hamburger"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                    aria-expanded={menuOpen}
                    aria-controls="menu-movil"
                >
                    <span className={`header__hamburger-line${menuOpen ? ' header__hamburger-line--open' : ''}`} />
                    <span className={`header__hamburger-line${menuOpen ? ' header__hamburger-line--open' : ''}`} />
                    <span className={`header__hamburger-line${menuOpen ? ' header__hamburger-line--open' : ''}`} />
                </button>

            </div>
        </header>

            {/* MENÚ (móvil y tablet) */}
            {menuOpen && (
                <div className="header__menu-overlay" onClick={() => setMenuOpen(false)}>
                    <nav
                        id="menu-movil"
                        className="header__menu"
                        aria-label="Menú"
                        ref={menuRef}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="header__menu-header">
                            <img src={logo} alt="" className="header__menu-logo" />
                            <span className="header__menu-brand">EliteShop</span>
                            <button
                                type="button"
                                className="header__menu-close"
                                onClick={() => setMenuOpen(false)}
                                aria-label="Cerrar menú"
                            >
                                <Icon size={20}>{icons.close}</Icon>
                            </button>
                        </div>

                        {/* BUSCADOR DENTRO DEL MENÚ */}
                        <form className="header__menu-search" role="search" onSubmit={(e) => { e.preventDefault(); onSearch?.(localSearch); setMenuOpen(false); navigate("/"); }}>
                            <Icon size={18}>{icons.search}</Icon>
                            <input
                                ref={mobileSearchRef}
                                type="text"
                                placeholder="Buscar productos"
                                aria-label="Buscar productos"
                                enterKeyHint="search"
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                            />
                            {localSearch && (
                                <button type="button" className="header__menu-search-clear" onClick={handleMobileClearSearch} aria-label="Limpiar búsqueda">
                                    <Icon size={13}>{icons.close}</Icon>
                                </button>
                            )}
                        </form>

                        <p className="header__menu-label">Categorías</p>

                        <div className="header__menu-categories">
                            <button
                                type="button"
                                className={`header__menu-category-btn${!activeCategory ? ' header__menu-category-btn--active' : ''}`}
                                aria-pressed={!activeCategory}
                                onClick={() => applyCategory('')}
                            >
                                Todo
                            </button>
                            {PRODUCT_CATEGORIES.map(({ value, label }) => (
                                <button
                                    type="button"
                                    key={value}
                                    className={`header__menu-category-btn${activeCategory === value ? ' header__menu-category-btn--active' : ''}`}
                                    aria-pressed={activeCategory === value}
                                    onClick={() => applyCategory(value)}
                                >
                                    {label}
                                </button>
                            ))}
                            <Link
                                to="/categorias"
                                className="header__menu-category-btn header__menu-category-btn--all"
                                onClick={() => setMenuOpen(false)}
                            >
                                Ver todas
                            </Link>
                        </div>

                        <div className="header__menu-divider" />

                        <p className="header__menu-label">Cuenta</p>

                        {isAuthenticated ? (
                            <>
                                <button type="button" className="header__menu-item" onClick={() => { setMenuOpen(false); onProfileClick?.(); }}>
                                    <Icon size={18}>{icons.user}</Icon>
                                    Mi perfil
                                </button>
                                {!isAdmin && (
                                    <>
                                        <button type="button" className="header__menu-item" onClick={() => { setMenuOpen(false); onOrdersClick?.(); }}>
                                            <Icon size={18}>{icons.orders}</Icon>
                                            Mis pedidos
                                        </button>
                                        {isSeller ? (
                                            <button type="button" className="header__menu-item" onClick={() => { setMenuOpen(false); onSellerDashboard?.(); }}>
                                                <Icon size={18}>{icons.store}</Icon>
                                                Mi panel de ventas
                                            </button>
                                        ) : (
                                            <button type="button" className="header__menu-item" onClick={() => { setMenuOpen(false); onSellerClick?.(); }}>
                                                <Icon size={18}>{icons.store}</Icon>
                                                Ser vendedor
                                            </button>
                                        )}
                                    </>
                                )}
                                {isAdmin && (
                                    <button
                                        type="button"
                                        className="header__menu-item"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            onAdminClick?.();
                                        }}
                                    >
                                        <Icon size={18}>{icons.shield}</Icon>
                                        Panel admin
                                    </button>
                                )}
                            </>
                        ) : (
                            <button type="button" className="header__menu-item header__menu-item--primary" onClick={() => { setMenuOpen(false); onAuthClick?.(); }}>
                                <Icon size={18}>{icons.login}</Icon>
                                Iniciar sesión
                            </button>
                        )}
                        <button type="button" className="header__menu-item" onClick={() => { setMenuOpen(false); onCartClick?.(); }}>
                            <Icon size={18}>{icons.cart}</Icon>
                            Mi carrito
                            {cartCount > 0 && <span className="header__menu-badge">{cartCount}</span>}
                        </button>
                        <button type="button" className="header__menu-item" onClick={() => { setMenuOpen(false); onHelpClick?.(); }}>
                            <Icon size={18}>{icons.help}</Icon>
                            Ayuda
                        </button>
                        {isAuthenticated && (
                            <>
                                <div className="header__menu-divider" />
                                <button type="button" className="header__menu-item header__menu-item--danger" onClick={() => { setMenuOpen(false); onLogoutClick?.(); }}>
                                    <Icon size={18}>{icons.logout}</Icon>
                                    Cerrar sesión
                                </button>
                            </>
                        )}
                    </nav>
                </div>
            )}
        </>
    );
}

export default Header;
