import { useState, useEffect, useMemo } from "react";
import ProductCard from "../ProductCard/ProductCard";
import { productService } from "../../services/product.service";
import { reviewService } from "../../services/review.service";
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
        category: p.category || '',
    };
}

/** Normaliza texto para comparación: minúsculas, sin tildes, sin espacios extra. */
function normalizeText(text) {
    return (text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

const PAGE_SIZE = 20;

function Gallery({ onProductClick, searchQuery, activeCategory }) {
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ratingsMap, setRatingsMap] = useState({});
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    // 1) Cargar todos los productos del backend una sola vez
    useEffect(() => {
        let cancelled = false;

        async function fetchAll() {
            setLoading(true);
            try {
                // Traemos un lote grande para tener todos los productos disponibles
                const result = await productService.getAll({ page: 0, size: 200 });
                if (cancelled) return;

                if (result.content?.length) {
                    const adapted = result.content.map(adaptProduct);
                    setAllProducts(adapted);

                    // Fetch ratings
                    const ratingsResults = await Promise.allSettled(
                        adapted.map(async (product) => {
                            const data = await reviewService.getByProduct(product.id);
                            const list = Array.isArray(data) ? data : data?.content || [];
                            if (list.length > 0) {
                                const sum = list.reduce(
                                    (acc, r) => acc + (r.qualify || r.productQualify || 0),
                                    0
                                );
                                return { id: product.id, rating: parseFloat((sum / list.length).toFixed(1)) };
                            }
                            return { id: product.id, rating: 0 };
                        })
                    );

                    if (cancelled) return;

                    const map = {};
                    ratingsResults.forEach((r) => {
                        if (r.status === "fulfilled") {
                            map[r.value.id] = r.value.rating;
                        }
                    });
                    setRatingsMap(map);
                } else {
                    setAllProducts(fallbackProducts);
                }
            } catch {
                if (!cancelled) {
                    setAllProducts(fallbackProducts);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchAll();
        return () => { cancelled = true; };
    }, []);

    // 2) Filtrado client-side: searchQuery + activeCategory
    const filteredProducts = useMemo(() => {
        let result = allProducts;

        // Filtrar por categoría
        if (activeCategory) {
            result = result.filter(
                (p) => normalizeText(p.category) === normalizeText(activeCategory)
            );
        }

        // Filtrar por búsqueda (coincidencia parcial en nombre)
        if (searchQuery && searchQuery.trim()) {
            const query = normalizeText(searchQuery);
            result = result.filter((p) => normalizeText(p.name).includes(query));
        }

        return result;
    }, [allProducts, searchQuery, activeCategory]);

    // 3) Productos visibles (paginación client-side)
    // visibleCount se resetea naturalmente porque filteredProducts.slice(0, N)
    // retorna todos los resultados si N > longitud del array.
    const visibleProducts = useMemo(
        () => filteredProducts.slice(0, visibleCount),
        [filteredProducts, visibleCount]
    );

    const hasMore = visibleCount < filteredProducts.length;

    // Aplicar ratings a los productos visibles
    const ratedProducts = useMemo(
        () => visibleProducts.map((p) => ({
            ...p,
            rating: ratingsMap[p.id] ?? p.rating,
        })),
        [visibleProducts, ratingsMap]
    );

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + PAGE_SIZE);
    };

    // Estado vacío (sin resultados)
    if (!loading && allProducts.length > 0 && filteredProducts.length === 0) {
        return (
            <section className="gallery">
                <div className="gallery__empty">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <p className="gallery__empty-title">No se encontraron productos</p>
                    <p className="gallery__empty-text">
                        {searchQuery
                            ? `No hay resultados para "${searchQuery}"`
                            : `No hay productos en esta categoría`
                        }
                    </p>
                </div>
            </section>
        );
    }

    // Skeleton de carga inicial
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
            {(searchQuery || activeCategory) && (
                <div className="gallery__filters-bar">
                    <span className="gallery__results-count">
                        {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''}
                        {searchQuery && <> para "<strong>{searchQuery}</strong>"</>}
                        {activeCategory && <> en <strong>{activeCategory}</strong></>}
                    </span>
                </div>
            )}
            <div className="gallery__grid">
                {ratedProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onClick={onProductClick}
                    />
                ))}
            </div>
            {hasMore && (
                <div className="gallery__load-more">
                    <button
                        type="button"
                        className="gallery__load-more-btn"
                        onClick={handleLoadMore}
                    >
                        Cargar más productos ({filteredProducts.length - visibleCount} restantes)
                    </button>
                </div>
            )}
        </section>
    );
}

export default Gallery;
