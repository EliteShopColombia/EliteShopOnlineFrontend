import "./ProductCard.css";

const priceFormatter = new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 0,
});

function StarIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4-5.8-3-5.8 3 1.1-6.4L2.6 9.4l6.5-.9z" />
        </svg>
    );
}

function CartIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.5h7.8a2 2 0 0 0 1.9-1.4L21 7H7" />
            <circle cx="10" cy="19" r="1.4" />
            <circle cx="18" cy="19" r="1.4" />
        </svg>
    );
}

function ProductCard({ product, onClick, onAddToCart }) {
    const rating = Number(product.rating || 0);
    const hasDiscount =
        Number(product.oldPrice) > 0 && Number(product.oldPrice) > Number(product.price);
    const discount = hasDiscount
        ? Math.round((1 - Number(product.price) / Number(product.oldPrice)) * 100)
        : 0;

    const handleCartClick = (event) => {
        // Evita que el clic abra el detalle del producto.
        event.stopPropagation();
        onAddToCart?.(product, 1);
    };

    return (
        <article
            className="product-card"
            onClick={() => onClick?.(product)}
            role="button"
            tabIndex={0}
            aria-label={`Ver ${product.name}`}
            onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && onClick?.(product)
            }
        >
            <div
                className="product-card__media"
                style={{ backgroundColor: product.bg || "#f1f5f9" }}
            >
                <img
                    src={product.image}
                    alt={product.name}
                    className="product-card__image"
                    decoding="async"
                />

                {discount > 0 && (
                    <span className="product-card__badge">-{discount}%</span>
                )}
            </div>

            <div className="product-card__info">
                <h3 className="product-card__name" title={product.name}>
                    {product.name}
                </h3>

                <div className="product-card__meta">
                    {rating > 0 ? (
                        <span
                            className="product-card__rating"
                            aria-label={`Calificación ${rating.toFixed(1)} de 5`}
                        >
                            <StarIcon />
                            {rating.toFixed(1)}
                        </span>
                    ) : (
                        <span className="product-card__rating product-card__rating--new">
                            Nuevo
                        </span>
                    )}
                </div>

                <div className="product-card__purchase">
                    <div className="product-card__prices">
                        <span className="product-card__price">
                            ${priceFormatter.format(product.price)}
                            <span className="product-card__currency"> COP</span>
                        </span>
                        {hasDiscount && (
                            <span className="product-card__old-price">
                                ${priceFormatter.format(product.oldPrice)}
                            </span>
                        )}
                    </div>

                    <button
                        type="button"
                        className="product-card__cart"
                        aria-label={`Agregar ${product.name} al carrito`}
                        onClick={handleCartClick}
                        onKeyDown={(e) => e.stopPropagation()}
                    >
                        <CartIcon />
                    </button>
                </div>
            </div>
        </article>
    );
}

export default ProductCard;
