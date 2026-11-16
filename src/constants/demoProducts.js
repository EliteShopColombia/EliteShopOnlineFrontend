import play5Img from "../assets/images/catalog/play5.jpg";
import kariteImg from "../assets/images/catalog/karite.jpg";
import balonImg from "../assets/images/catalog/balon.jpg";
import automotrizImg from "../assets/images/catalog/automotriz.jpg";
import ninosImg from "../assets/images/catalog/ninos.jpg";
import prendaImg from "../assets/images/catalog/prenda.jpg";

/**
 * Catálogo de demostración con imágenes locales.
 * Se usa cuando la API no está disponible para que la navegación siga siendo
 * completa durante la presentación del proyecto.
 */
const DEMO_PRODUCTS = [
  { id: "1", name: "Consola PlayStation 5 Pro", category: "TECNOLOGIA", bg: "#05060a", price: 2300000, oldPrice: 2600000, rating: 5, image: play5Img },
  { id: "2", name: "Kit de belleza natural Karité", category: "BELLEZA", bg: "#a37f60", price: 89900, oldPrice: 120000, rating: 5, image: kariteImg },
  { id: "3", name: "Balón de fútbol profesional", category: "DEPORTES", bg: "#ffffff", price: 120000, oldPrice: 160000, rating: 5, image: balonImg },
  { id: "4", name: "Accesorios para tu vehículo", category: "AUTOMOTRIZ", bg: "#d5d4d5", price: 150000, oldPrice: 190000, rating: 5, image: automotrizImg },
  { id: "5", name: "Set infantil didáctico", category: "JUGUETES", bg: "#d8dfe5", price: 60000, oldPrice: 80000, rating: 5, image: ninosImg },
  { id: "6", name: "Control inalámbrico DualSense", category: "TECNOLOGIA", bg: "#05060a", price: 250000, oldPrice: 300000, rating: 5, image: play5Img },
  { id: "7", name: "Crema corporal de karité", category: "BELLEZA", bg: "#a37f60", price: 45000, oldPrice: 60000, rating: 5, image: kariteImg },
  { id: "8", name: "Balón de entrenamiento", category: "DEPORTES", bg: "#ffffff", price: 70000, oldPrice: 90000, rating: 5, image: balonImg },
  { id: "9", name: "Prenda deportiva de alto rendimiento", category: "ROPA", bg: "#d9d9d9", price: 79900, oldPrice: 99900, rating: 5, image: prendaImg },
  { id: "10", name: "Kit de manualidades creativas", category: "MANUALIDADES", bg: "#d8dfe5", price: 55000, oldPrice: 75000, rating: 5, image: ninosImg },
];

export default DEMO_PRODUCTS;
