import ProductCard from "../ProductCard/ProductCard";
import "./Gallery.css";

const figmaImages = {
    a: "https://www.figma.com/api/mcp/asset/955dbb7e-4c9a-45c7-a45a-636cfb28de3d.png",
    b: "https://www.figma.com/api/mcp/asset/7325b519-f041-4596-b0f0-5959ce2b2c2c.png",
    c: "https://www.figma.com/api/mcp/asset/2b8108a8-3555-4d2d-8b3c-2c773c080e75.png",
    d: "https://www.figma.com/api/mcp/asset/fdd6e6e1-a06a-44d7-996f-266290390f4c.png",
};

function Gallery() {
    const products = [
        {
            id: 1,
            name: "Gafas Inteligente con IA 2026, ...",
            price: "50.000",
            oldPrice: "70.000",
            rating: 5,
            image: figmaImages.a,
        },
        {
            id: 2,
            name: "Mini Freidora de Huevos 4 en 1, ...",
            price: "20.000",
            oldPrice: "50.000",
            rating: 5,
            image: figmaImages.b,
        },
        {
            id: 3,
            name: "Juego para Parejas en Español - ...",
            price: "20.000",
            oldPrice: "50.000",
            rating: 5,
            image: figmaImages.c,
        },
        {
            id: 4,
            name: "1 pza. Frasco recargable para p...",
            price: "20.000",
            oldPrice: "50.000",
            rating: 5,
            image: figmaImages.d,
        },
        {
            id: 5,
            name: "Gafas Inteligente con IA 2026, ...",
            price: "50.000",
            oldPrice: "70.000",
            rating: 5,
            image: figmaImages.a,
        },
        {
            id: 6,
            name: "Mini Freidora de Huevos 4 en 1, ...",
            price: "20.000",
            oldPrice: "50.000",
            rating: 5,
            image: figmaImages.b,
        },
        {
            id: 7,
            name: "Juego para Parejas en Español - ...",
            price: "20.000",
            oldPrice: "50.000",
            rating: 5,
            image: figmaImages.c,
        },
        {
            id: 8,
            name: "1 pza. Frasco recargable para p...",
            price: "20.000",
            oldPrice: "50.000",
            rating: 5,
            image: figmaImages.d,
        },
    ];

    return (
        <section className="gallery">
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