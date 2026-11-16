import "./Categories.css";
import CategoryIcon from "../shared/CategoryIcon";
import tecnologiaImg from "../../assets/images/Play5.jpg";

const FEATURE = {
  value: "TECNOLOGIA",
  label: "Tecnología",
  text: "Audio, imagen y accesorios",
};

const MEDIUM = [
  { value: "BELLEZA", label: "Belleza", text: "Cuidado personal" },
  { value: "ROPA", label: "Ropa", text: "Estilo diario" },
  { value: "DEPORTES", label: "Deportes", text: "Entrena y juega" },
  { value: "JUGUETES", label: "Juguetes", text: "Para todas las edades" },
];

const COMPACT = [
  { value: "MEDICINA", label: "Medicina", text: "Salud y bienestar" },
  { value: "MANUALIDADES", label: "Manualidades", text: "Crea y decora" },
  { value: "AUTOMOTRIZ", label: "Automotriz", text: "Para tu vehículo" },
];

function Categories({ onCategorySelect }) {
  const select = (value) => onCategorySelect?.(value);

  return (
    <section className="categories-page" aria-labelledby="categories-title">
      <header className="categories-page__head">
        <h1 id="categories-title">Todas las categorías</h1>
        <p>Explora el catálogo por lo que te interesa. Ocho categorías, un solo lugar.</p>
      </header>

      <div className="categories-top">
        <button
          type="button"
          className="category-feature"
          style={{ backgroundColor: "#05060a" }}
          onClick={() => select(FEATURE.value)}
          aria-label={`Explorar ${FEATURE.label}`}
        >
          <img src={tecnologiaImg} alt="" loading="eager" />
          <span className="category-feature__shade" aria-hidden="true" />
          <span className="category-feature__badge">Categoría destacada</span>
          <span className="category-feature__arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
          <span className="category-feature__copy">
            <strong>{FEATURE.label}</strong>
            <small>{FEATURE.text}</small>
            <span className="category-feature__cta">Explorar categoría</span>
          </span>
        </button>

        <div className="categories-mosaic">
          {MEDIUM.map((item) => (
            <button
              key={item.value}
              type="button"
              className="category-tile"
              onClick={() => select(item.value)}
            >
              <CategoryIcon category={item.value} size={140} className="category-tile__watermark" />
              <span className="category-tile__icon">
                <CategoryIcon category={item.value} size={24} />
              </span>
              <span className="category-tile__copy">
                <strong>{item.label}</strong>
                <small>{item.text}</small>
              </span>
              <span className="category-tile__arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="categories-bottom">
        {COMPACT.map((item) => (
          <button
            key={item.value}
            type="button"
            className="category-compact"
            onClick={() => select(item.value)}
          >
            <span className="category-compact__icon">
              <CategoryIcon category={item.value} size={20} />
            </span>
            <span className="category-compact__copy">
              <strong>{item.label}</strong>
              <small>{item.text}</small>
            </span>
            <span className="category-compact__arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </span>
          </button>
        ))}

        <button
          type="button"
          className="category-compact category-compact--all"
          onClick={() => select("")}
        >
          <span className="category-compact__copy">
            <strong>Ver todo el catálogo</strong>
            <small>Todos los productos</small>
          </span>
          <span className="category-compact__arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      </div>
    </section>
  );
}

export default Categories;
