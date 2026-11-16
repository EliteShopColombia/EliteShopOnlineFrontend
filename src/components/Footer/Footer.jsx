import { Link } from "react-router-dom";
import "./Footer.css";
import logo from "../../assets/logo.png";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <Link to="/" className="footer__brand-link" aria-label="EliteShop Colombia, ir al inicio">
            <img src={logo} alt="" className="footer__logo" />
            <span className="footer__wordmark">EliteShop</span>
          </Link>
          <p className="footer__tagline">
            Productos seleccionados, pagos seguros y entregas en todo el país.
          </p>
        </div>

        <nav className="footer__nav" aria-label="Enlaces del pie de página">
          <div className="footer__group">
            <h2 className="footer__title">Tienda</h2>
            <Link to="/">Catálogo</Link>
            <Link to="/categorias">Categorías</Link>
            <Link to="/faq">Ayuda</Link>
            <Link to="/seller">Vender en EliteShop</Link>
          </div>

          <div className="footer__group">
            <h2 className="footer__title">Cuenta</h2>
            <Link to="/login">Ingresar</Link>
            <Link to="/register">Crear cuenta</Link>
            <Link to="/profile/orders">Mis pedidos</Link>
          </div>

          <div className="footer__group">
            <h2 className="footer__title">Legal</h2>
            <Link to="/faq">Términos y condiciones</Link>
            <Link to="/faq">Política de privacidad</Link>
          </div>
        </nav>
      </div>

      <div className="footer__bottom">
        <p className="footer__copy">
          © {new Date().getFullYear()} EliteShop Colombia
        </p>
        <ul className="footer__payments" aria-label="Medios de pago">
          <li>ePayco</li>
          <li>Visa</li>
          <li>Mastercard</li>
          <li>PSE</li>
          <li>Nequi</li>
        </ul>
      </div>
    </footer>
  );
}

export default Footer;
