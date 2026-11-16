import { useState, useEffect, useCallback } from "react";
import { cartService } from "../../services/cart.service";
import { productService } from "../../services/product.service";
import { parseApiError } from '../../helpers/api.helpers';
import { getImageUrl } from '../../helpers/images';
import "./CartModal.css";

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
            const { error } = parseApiError(err);
            setError(error || "No se pudo actualizar el item");
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
            const { error } = parseApiError(err);
            setError(error || "No se pudo eliminar el item");
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
            const { error } = parseApiError(err);
            setError(error || "No se pudo vaciar el carrito");
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        if (!isOpen) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onClose?.();
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    const items = resolvedItems.length ? resolvedItems : (cart?.items || []);

    return (
        <div className="cart-modal__overlay" onClick={onClose}>
            <div
                className="cart-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="cart-modal-title"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="cart-modal__header">
                    <h2 id="cart-modal-title">Mi carrito</h2>
                    <button
                        className="cart-modal__close"
                        onClick={onClose}
                        aria-label="Cerrar carrito"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {error && <p className="cart-modal__error">{error}</p>}

                <div className="cart-modal__products">
                    {cart === null && !error && <div className="cart-modal__loading">Cargando carrito…</div>}

                    {cart !== null && items.length === 0 && !error && (
                        <div className="cart-modal__empty">
                            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="9" cy="21" r="1" />
                                <circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                            <p>Tu carrito está vacío</p>
                            <button type="button" onClick={onClose}>Explorar productos</button>
                        </div>
                    )}

                    {cart !== null && items.map((item) => {
                        const product = item.product || {};
                        const image = product.images?.length
                            ? getImageUrl(product.images[0]?.imageUrl || product.images[0])
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
                                    <span className="cart-item__price">{formatPrice(item.subtotal)}</span>
                                    <div className="cart-item__qty">
                                        <button
                                            type="button"
                                            aria-label="Disminuir cantidad"
                                            onClick={() => changeQuantity(item, item.quantity - 1)}
                                            disabled={updating || item.quantity <= 1}
                                        >
                                            −
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button
                                            type="button"
                                            aria-label="Aumentar cantidad"
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
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
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
                            Finalizar compra
                        </button>

                        <button
                            className="cart-modal__view"
                            onClick={clearCart}
                            disabled={!cart?.items?.length || updating}
                        >
                            Vaciar carrito
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartModal;