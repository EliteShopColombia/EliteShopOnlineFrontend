import { useState, useEffect, useMemo } from "react";
import ProductCard from "../ProductCard/ProductCard";
import Hero from "../Hero/Hero";
import { productService } from "../../services/product.service";
import { reviewService } from "../../services/review.service";
import { CATEGORY_LABELS } from "../../constants/categories";
import DEMO_PRODUCTS from "../../constants/demoProducts";
import "./Gallery.css";



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

function Gallery({ onProductClick, onAddToCart, searchQuery, activeCategory, onCategorySelect }) {
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
                    // Las calificaciones se cargan bajo demanda para los productos
                    // visibles (ver efecto de ratings); antes se lanzaba una petición
                    // por cada producto del catálogo a la vez.
                } else {
                    setAllProducts(DEMO_PRODUCTS);
                }
            } catch {
                if (!cancelled) {
                    setAllProducts(DEMO_PRODUCTS);
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

    // 4) Calificaciones: solo de los productos visibles y de forma secuencial.
    // Evita el pico de peticiones que se producía al cargar todo el catálogo.
    useEffect(() => {
        let cancelled = false;
        const pending = visibleProducts.filter((p) => ratingsMap[p.id] === undefined);
        if (pending.length === 0) return;

        (async () => {
            for (const product of pending) {
                if (cancelled) return;
                try {
                    const data = await reviewService.getByProduct(product.id);
                    const list = Array.isArray(data) ? data : data?.content || [];
                    const rating =
                        list.length > 0
                            ? parseFloat(
                                  (
                                      list.reduce((acc, r) => acc + (r.qualify || r.productQualify || 0), 0) /
                                      list.length
                                  ).toFixed(1)
                              )
                            : 0;
                    if (!cancelled) {
                        setRatingsMap((prev) => ({ ...prev, [product.id]: rating }));
                    }
                } catch {
                    if (!cancelled) {
                        setRatingsMap((prev) => ({ ...prev, [product.id]: 0 }));
                    }
                }
            }
        })();

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visibleProducts]);

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
            <section className="gallery" id="catalogo">
                <div className="gallery__empty">
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <p className="gallery__empty-title">No encontramos productos</p>
                    <p className="gallery__empty-text">
                        {searchQuery
                            ? `No hay resultados para "${searchQuery}". Prueba con otra palabra o cambia de categoría.`
                            : 'No hay productos en esta categoría. Explora el catálogo completo.'
                        }
                    </p>
                </div>
            </section>
        );
    }

    // Skeleton de carga inicial
    if (loading) {
        return (
            <section className="gallery" aria-busy="true" aria-label="Cargando catálogo">
                <div className="gallery__grid">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="product-card product-card--skeleton" />
                    ))}
                </div>
            </section>
        );
    }

    const showHero = !searchQuery && !activeCategory;
    const categoryLabel = activeCategory
        ? CATEGORY_LABELS[activeCategory] || activeCategory
        : '';
    const title = searchQuery ? 'Resultados' : categoryLabel || 'Catálogo';

    return (
        <>
            {showHero && <Hero onCategorySelect={onCategorySelect} />}

            <section className="gallery" id="catalogo" aria-labelledby="catalog-title">
                <header className="gallery__head">
                    <h2 id="catalog-title" className="gallery__title">{title}</h2>
                    <p className="gallery__subtitle" role="status">
                        {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
                        {searchQuery && ` para "${searchQuery}"`}
                        {!searchQuery && categoryLabel && ` en ${categoryLabel}`}
                    </p>
                </header>

                <div className="gallery__grid">
                    {ratedProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onClick={onProductClick}
                            onAddToCart={onAddToCart}
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
                            Ver más productos
                            <span className="gallery__load-more-count">
                                {filteredProducts.length - visibleCount} restantes
                            </span>
                        </button>
                    </div>
                )}
            </section>
        </>
    );
}

export default Gallery;
