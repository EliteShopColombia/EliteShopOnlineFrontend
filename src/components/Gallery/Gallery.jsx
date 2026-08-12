import ProductCard from "../ProductCard/ProductCard";
import "./Gallery.css";

import prenda from "../../assets/images/Prenda.jpg";
import play5 from "../../assets/images/Play5.jpg";
import ninos from "../../assets/images/Niños.jpg";
import karite from "../../assets/images/Karité.jpg";
import balon from "../../assets/images/Balon.jpg";
import automotriz from "../../assets/images/Automotriz.jpg";

function Gallery() {
const products = [
    {
        id: 1,
        name: "Camiseta Casual",
        price: "120.000",
        oldPrice: "150.000",
        rating: 3.8,
        image: prenda
    },
    {
        id: 2,
        name: "PlayStation 5",
        price: "150.000",
        oldPrice: "200.000",
        rating: 4.8,
        image: play5
    },
    {
        id: 3,
        name: "Juguete para niños",
        price: "95.000",
        oldPrice: "120.000",
        rating: 4.2,
        image: ninos
    },
    {
        id: 4,
        name: "Productos karité",
        price: "180.000",
        oldPrice: "220.000",
        rating: 4.7,
        image: karite
    },
    {
        id: 5,
        name: "Balón deportivo",
        price: "180.000",
        oldPrice: "250.000",
        rating: 4.6,
        image: balon
    },
    {
        id: 6,
        name: "Repuestos automotrices",
        price: "335.000",
        oldPrice: "480.000",
        rating: 4.3,
        image: automotriz
    }
];
    return (
        <section className="gallery">

            <div className="gallery__header">

                <h2>Productos destacados</h2>

            </div>

            <div className="gallery__grid">

                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                    />
                ))}

            </div>

        </section>
    );
}

export default Gallery;