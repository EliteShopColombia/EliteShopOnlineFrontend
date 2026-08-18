import "./ProductCard.css";

function ProductCard({ product }) {

    // Convertimos la calificación decimal
    // en cantidad de estrellas llenas.
    const filledStars = Math.round(Number(product.rating));

    return (
        <article className="product-card">

            {/* IMAGEN */}
            <div className="product-card__image-container">

                <img
                    src={product.image}
                    alt={product.name}
                    className="product-card__image"
                />

            </div>


            {/* INFORMACIÓN */}
            <div className="product-card__info">

                {/* NOMBRE */}
                <h3 className="product-card__name">
                    {product.name}
                </h3>


                {/* PRECIO + CARRITO */}
                <div className="product-card__purchase">

                    <div className="product-card__prices">

                        <span className="product-card__price">
                            ${product.price} COP
                        </span>

                        {product.oldPrice && (
                            <span className="product-card__old-price">
                                ${product.oldPrice} COP
                            </span>
                        )}

                    </div>


                    {/* CARRITO */}
                    <button
                        type="button"
                        className="product-card__cart"
                        aria-label="Agregar al carrito"
                    >

                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.5h7.8a2 2 0 0 0 1.9-1.4L21 7H7" />

                            <circle
                                cx="10"
                                cy="19"
                                r="1.5"
                            />

                            <circle
                                cx="18"
                                cy="19"
                                r="1.5"
                            />
                        </svg>

                    </button>

                </div>


                {/* ESTRELLAS */}
                <div className="product-card__rating">

                    <div className="product-card__stars">

                        {[1, 2, 3, 4, 5].map((star) => (

                            <span
                                key={star}
                                className={
                                    star <= filledStars
                                        ? "star star--active"
                                        : "star"
                                }
                            >
                                ★
                            </span>

                        ))}

                    </div>

                </div>

            </div>

        </article>
    );
}

export default ProductCard;