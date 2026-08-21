import { useState, useEffect, useCallback } from "react";
import { cartService } from "../../services/cart.service";
import { productService } from "../../services/product.service";
import "./CartModal.css";

function buildImageUrl(url) {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const base = import.meta.env.VITE_API_BASE_URL || '';
    return `${base}/api/v1/products/images?key=${encodeURIComponent(url)}`;
}

const formatPrice = (value) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value || 0);

function CartModal({ isOpen, onClose, onCheckout, cart, onCartChange }) {
    const [resolvedItems, setResolvedItems] = useState([]);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");

    const refresh = useCallback(async () => {
        if (!onCartChange) return;
        const result = await onCartChange().catch(() => null);
        if (!result) return;
        setError("");
        if (result.items?.length) {
            const items = await Promise.all(
                result.items.map(async (item) => {
                    try {
                        const product = await productService.getById(item.productId);
                        return { ...item, product };
                    } catch {
                        return { ...item, product: null };
                    }
                })
            );
            setResolvedItems(items);
        } else {
            setResolvedItems([]);
        }
    }, [onCartChange]);

    useEffect(() => {
        if (!isOpen) return;
        let cancelled = false;

        async function load() {
            const result = await onCartChange?.().catch(() => null);
            if (cancelled || !result) return;
            setError("");
            if (result.items?.length) {
                const items = await Promise.all(
                    result.items.map(async (item) => {
                        try {
                            const product = await productService.getById(item.productId);
                            return { ...item, product };
                        } catch {
                            return { ...item, product: null };
                        }
                    })
                );
                if (!cancelled) setResolvedItems(items);
            } else if (!cancelled) {
                setResolvedItems([]);
            }
        }

        load();
        return () => { cancelled = true; };
    }, [isOpen, onCartChange]);

    const changeQuantity = async (item, quantity) => {
        if (quantity < 1) return;
        setUpdating(true);
        setError("");
        try {
            await cartService.updateItem(item.id, quantity);
            await refresh();
        } catch (err) {
            setError(err.response?.data?.message || "No se pudo actualizar el item");
        } finally {
            setUpdating(false);
        }
    };

    const removeItem = async (item) => {
        setUpdating(true);
        setError("");
        try {
            await cartService.removeItem(item.id);
            await refresh();
        } catch (err) {
            setError(err.response?.data?.message || "No se pudo eliminar el item");
        } finally {
            setUpdating(false);
        }
    };

    const clearCart = async () => {
        setUpdating(true);
        setError("");
        try {
            await cartService.clearCart();
            await refresh();
        } catch (err) {
            setError(err.response?.data?.message || "No se pudo vaciar el carrito");
        } finally {
            setUpdating(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    const items = resolvedItems.length ? resolvedItems : (cart?.items || []);

    return (
        <div className="cart-modal__overlay" onClick={onClose}>
            <div
                className="cart-modal"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="cart-modal__header">
                    <h2>MI CARRITO</h2>
                    <button
                        className="cart-modal__close"
                        onClick={onClose}
                        aria-label="Cerrar carrito"
                    >
                        ×
                    </button>
                </div>

                {error && <p className="cart-modal__error">{error}</p>}

                <div className="cart-modal__products">
                    {cart === null && !error && <div className="cart-modal__loading">Cargando carrito...</div>}

                    {cart !== null && items.length === 0 && !error && (
                        <div className="cart-modal__empty">Tu carrito esta vacio</div>
                    )}

                    {cart !== null && items.map((item) => {
                        const product = item.product || {};
                        const image = product.images?.length
                            ? buildImageUrl(product.images[0]?.imageUrl || product.images[0])
                            : "";
                        return (
                            <div className="cart-item" key={item.id}>
                                <div className="cart-item__image">
                                    {image ? (
                                        <img src={image} alt={product.name || "Producto"} />
                                    ) : (
                                        <span className="cart-item__placeholder">?</span>
                                    )}
                                </div>

                                <div className="cart-item__info">
                                    <h3>{product.name || "Producto"}</h3>
                                    <span>{formatPrice(item.subtotal)}</span>
                                    <small>CANTIDAD:</small>
                                    <div className="cart-item__qty">
                                        <button
                                            type="button"
                                            onClick={() => changeQuantity(item, item.quantity - 1)}
                                            disabled={updating || item.quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button
                                            type="button"
                                            onClick={() => changeQuantity(item, item.quantity + 1)}
                                            disabled={updating}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <button
                                    className="cart-item__delete"
                                    aria-label={`Eliminar ${product.name || "producto"}`}
                                    onClick={() => removeItem(item)}
                                    disabled={updating}
                                >
                                    🗑
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="cart-modal__footer">
                    <div className="cart-modal__total">
                        <span>Total a pagar</span>
                        <strong>{formatPrice(cart?.total)}</strong>
                    </div>

                    <div className="cart-modal__actions">
                        <button
                            className="cart-modal__checkout"
                            onClick={onCheckout}
                            disabled={!cart?.items?.length}
                        >
                            REALIZAR COMPRA
                        </button>

                        <button
                            className="cart-modal__view"
                            onClick={clearCart}
                            disabled={!cart?.items?.length || updating}
                        >
                            VACIAR CARRITO
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartModal;