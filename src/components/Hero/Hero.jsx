import { Link } from "react-router-dom";
import "./Hero.css";
import tecnologiaImg from "../../assets/images/Play5.jpg";
import bellezaImg from "../../assets/images/Karité.jpg";
import deportesImg from "../../assets/images/Balon.jpg";

const TILES = [
  { value: "TECNOLOGIA", label: "Tecnología", image: tecnologiaImg, bg: "#05060a" },
  { value: "BELLEZA", label: "Belleza", image: bellezaImg, bg: "#a37f60" },
  { value: "DEPORTES", label: "Deportes", image: deportesImg, bg: "#ffffff" },
];

function Icon({ size = 16, children }) {
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

function Hero({ onCategorySelect }) {
  const scrollToCatalog = () => {
    document.getElementById("catalogo")?.scrollIntoView({ block: "start" });
  };

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__inner">
        <div className="hero__copy">
          <h1 id="hero-title" className="hero__title">
            Lo que buscas, ya está aquí.
          </h1>

          <p className="hero__description">
            Tecnología, hogar, belleza y más. Productos seleccionados, pago
            seguro y entregas en toda Colombia.
          </p>

          <div className="hero__actions">
            <button
              type="button"
              className="hero__cta"
              onClick={scrollToCatalog}
            >
              Explorar catálogo
            </button>

            <Link to="/seller" className="hero__secondary">
              Quiero vender
            </Link>
          </div>

          <ul className="hero__trust">
            <li>
              <Icon>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </Icon>
              Pago seguro
            </li>
            <li>
              <Icon>
                <path d="M1 3h15v13H1z" />
                <path d="M16 8h4l3 3v5h-7z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </Icon>
              Envíos nacionales
            </li>
            <li>
              <Icon>
                <circle cx="12" cy="8" r="6" />
                <path d="m9 14-2 7 5-3 5 3-2-7" />
              </Icon>
              Vendedores verificados
            </li>
          </ul>
        </div>

        <div className="hero__vitrine" aria-label="Categorías destacadas">
          {TILES.map((tile, index) => (
            <button
              key={tile.value}
              type="button"
              className={`hero__tile hero__tile--${index + 1}`}
              style={{ backgroundColor: tile.bg }}
              onClick={() => onCategorySelect?.(tile.value)}
              aria-label={`Ver categoría ${tile.label}`}
            >
              <img
                src={tile.image}
                alt=""
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
              />
              <span className="hero__tile-caption">{tile.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;
