import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { productService } from '../../services/product.service';
import { sellerService } from '../../services/seller.service';
import ReviewsSection from './ReviewsSection.jsx';
import ShippingInfo from './ShippingInfo.jsx';
import './ProductDetail.css';

function buildImageUrl(url) {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const base = import.meta.env.VITE_API_BASE_URL || '';
    return `${base}/api/v1/products/images?key=${encodeURIComponent(url)}`;
}

function ProductDetail({ onBack, onAddToCart }) {
    const { id: urlId } = useParams();
    const [product, setProduct] = useState(null);
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        let cancelled = false;

        async function fetchProduct() {
            try {
                const data = await productService.getById(urlId);
                if (cancelled) return;
                setProduct(data);

                if (data.sellerId) {
                    try {
                        const sellerData = await sellerService.getById(data.sellerId);
                        if (!cancelled) setSeller(sellerData);
                    } catch {
                        // seller not critical
                    }
                }
            } catch {
                // handle error
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchProduct();
        return () => { cancelled = true; };
    }, [urlId]);

    if (loading) {
        return (
            <div className="product-detail">
                <div className="product-detail__loading">Cargando producto...</div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-detail">
                <div className="product-detail__error">
                    <p>Producto no encontrado</p>
                    <button type="button" onClick={onBack}>Volver</button>
                </div>
            </div>
        );
    }

    const images = (product.images || []).map(buildImageUrl);
    const formatPrice = (price) => new Intl.NumberFormat('es-CO').format(price);

    return (
        <div className="product-detail">
            <div className="product-detail__container">

                <button type="button" className="product-detail__back" onClick={onBack}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Volver
                </button>

                <div className="product-detail__layout">

                    {/* IMAGENES */}
                    <div className="product-detail__gallery">
                        {images.length > 0 && (
                            <>
                                <div className="product-detail__thumbnails">
                                    {images.map((img, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            className={`product-detail__thumb ${i === selectedImage ? 'product-detail__thumb--active' : ''}`}
                                            onClick={() => setSelectedImage(i)}
                                        >
                                            <img src={img} alt={`Vista ${i + 1}`} />
                                        </button>
                                    ))}
                                </div>
                                <div className="product-detail__main-image">
                                    <img src={images[selectedImage]} alt={product.name} />
                                </div>
                            </>
                        )}
                    </div>

                    {/* INFO */}
                    <div className="product-detail__info">

                        <h1 className="product-detail__name">{product.name}</h1>

                        <div className="product-detail__meta">
                            <span className="product-detail__stock">
                                {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                            </span>
                            {seller && (
                                <span className="product-detail__seller">
                                    Vendido por <strong>{seller.tradeName || seller.fullname}</strong>
                                    {seller.isVerified && (
                                        <svg className="product-detail__verified" width="14" height="14" viewBox="0 0 24 24" fill="#2778d4" stroke="none">
                                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </span>
                            )}
                        </div>

                        <div className="product-detail__price-section">
                            <span className="product-detail__price">${formatPrice(product.price)} COP</span>
                        </div>

                        {/* CANTIDAD */}
                        <div className="product-detail__quantity-section">
                            <label className="product-detail__quantity-label">Cantidad:</label>
                            <div className="product-detail__quantity-controls">
                                <button
                                    type="button"
                                    className="product-detail__qty-btn"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                >
                                    -
                                </button>
                                <span className="product-detail__qty-value">{quantity}</span>
                                <button
                                    type="button"
                                    className="product-detail__qty-btn"
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    disabled={quantity >= product.stock}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* AGREGAR AL CARRITO */}
                        <button
                            type="button"
                            className="product-detail__add-cart"
                            onClick={() => onAddToCart?.(product, quantity)}
                            disabled={product.stock === 0}
                        >
                            {product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
                        </button>

                        <ShippingInfo />

                    </div>

                </div>

                {/* REVIEWS */}
                <ReviewsSection productId={urlId} />

            </div>
        </div>
    );
}

export default ProductDetail;
