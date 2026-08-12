import "./Header.css";
import logo from "../../assets/logo.png";

function Header({ onCartClick }) {
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

                        <span className="header__search-icon">
                            ⌕
                        </span>

                        <input
                            type="text"
                            placeholder="Ropa para hombre"
                            aria-label="Buscar productos"
                        />

                    </div>

                </div>


                {/* ACCIONES */}
                <div className="header__actions">

                    <button
                        type="button"
                        className="header__login"
                    >
                        Login / Register
                    </button>

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