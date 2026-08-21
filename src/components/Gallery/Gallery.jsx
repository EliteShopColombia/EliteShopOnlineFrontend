import { useState, useEffect } from "react";
import ProductCard from "../ProductCard/ProductCard";
import { productService } from "../../services/product.service";
import "./Gallery.css";

const fallbackProducts = [
    {
        id: "1",
        name: "Gafas Inteligente con IA 2026, ...",
        price: 50000,
        oldPrice: 70000,
        rating: 5,
        image: "https://www.figma.com/api/mcp/asset/955dbb7e-4c9a-45c7-a45a-636cfb28de3d.png",
    },
    {
        id: "2",
        name: "Mini Freidora de Huevos 4 en 1, ...",
        price: 20000,
        oldPrice: 50000,
        rating: 5,
        image: "https://www.figma.com/api/mcp/asset/7325b519-f041-4596-b0f0-5959ce2b2c2c.png",
    },
    {
        id: "3",
        name: "Juego para Parejas en Español - ...",
        price: 20000,
        oldPrice: 50000,
        rating: 5,
        image: "https://www.figma.com/api/mcp/asset/2b8108a8-3555-4d2d-8b3c-2c773c080e75.png",
    },
    {
        id: "4",
        name: "1 pza. Frasco recargable para p...",
        price: 20000,
        oldPrice: 50000,
        rating: 5,
        image: "https://www.figma.com/api/mcp/asset/fdd6e6e1-a06a-44d7-996f-266290390f4c.png",
    },
    {
        id: "5",
        name: "Gafas Inteligente con IA 2026, ...",
        price: 50000,
        oldPrice: 70000,
        rating: 5,
        image: "https://www.figma.com/api/mcp/asset/955dbb7e-4c9a-45c7-a45a-636cfb28de3d.png",
    },
    {
        id: "6",
        name: "Mini Freidora de Huevos 4 en 1, ...",
        price: 20000,
        oldPrice: 50000,
        rating: 5,
        image: "https://www.figma.com/api/mcp/asset/7325b519-f041-4596-b0f0-5959ce2b2c2c.png",
    },
    {
        id: "7",
        name: "Juego para Parejas en Español - ...",
        price: 20000,
        oldPrice: 50000,
        rating: 5,
        image: "https://www.figma.com/api/mcp/asset/2b8108a8-3555-4d2d-8b3c-2c773c080e75.png",
    },
    {
        id: "8",
        name: "1 pza. Frasco recargable para p...",
        price: 20000,
        oldPrice: 50000,
        rating: 5,
        image: "https://www.figma.com/api/mcp/asset/fdd6e6e1-a06a-44d7-996f-266290390f4c.png",
    },
];

function adaptProduct(p) {
    const rawImage = p.image || p.productImage || p.images?.[0] || '';
    let imageUrl = '';
    if (typeof rawImage === 'string') {
        if (rawImage.startsWith('http')) {
            imageUrl = rawImage;
        } else if (rawImage) {
            const base = import.meta.env.VITE_API_BASE_URL || '';
            imageUrl = `${base}/api/v1/products/images?key=${encodeURIComponent(rawImage)}`;
        }
    } else {
        imageUrl = rawImage?.imageUrl || '';
    }

    return {
        id: p.id || p.productId,
        name: p.name || p.productName || '',
        price: p.price ?? p.productPrice ?? 0,
        oldPrice: p.oldPrice ?? null,
        rating: p.rating ?? 0,
        image: imageUrl,
    };
}

function Gallery({ onProductClick }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function fetchProducts() {
            try {
                const result = await productService.getAll(0, 50);
                if (!cancelled && result.content?.length) {
                    setProducts(result.content.map(adaptProduct));
                } else if (!cancelled) {
                    setProducts(fallbackProducts);
                }
            } catch {
                if (!cancelled) {
                    setProducts(fallbackProducts);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchProducts();
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return (
            <section className="gallery">
                <div className="gallery__grid">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="product-card product-card--skeleton" />
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="gallery">
            <div className="gallery__grid">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onClick={onProductClick}
                    />
                ))}
            </div>
        </section>
    );
}

export default Gallery;
