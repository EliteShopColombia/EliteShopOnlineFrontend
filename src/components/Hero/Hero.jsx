import "./Hero.css";

function Hero() {
  return (
    <section className="hero">
      <div className="hero__content">
        <p className="hero__subtitle">Bienvenido a EliteShop</p>

        <h1>Encuentra todo lo que necesitas</h1>

        <p className="hero__description">
          Descubre productos seleccionados para ti y disfruta de una
          experiencia de compra sencilla y moderna.
        </p>

        <button className="hero__button">
          Explorar productos
        </button>
      </div>
    </section>
  );
}

export default Hero;