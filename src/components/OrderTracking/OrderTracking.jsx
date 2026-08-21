import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/order.service';
import { productService } from '../../services/product.service';
import { checkoutService } from '../../services/checkout.service';
import { paymentService } from '../../services/payment.service';
import { paymentMethodService } from '../../services/payment-method.service';
import { openEpaycoCheckout } from '../../utils/epaycoCheckout';
import './OrderTracking.css';

const STATUS_STEPS = [
    'PENDING_PAYMENT',
    'PAID',
    'IN_PREPARATION',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'COMPLETED',
];

const STATUS_INFO = {
    PENDING_PAYMENT: { label: 'Pago pendiente', description: 'Tu pedido fue recibido y esta esperando el pago.', icon: '⏳' },
    PAID: { label: 'Pagado', description: 'El pago fue aprobado y tu pedido sera preparado.', icon: '✅' },
    IN_PREPARATION: { label: 'En preparacion', description: 'Tu pedido esta siendo preparado.', icon: '📋' },
    SHIPPED: { label: 'Enviado', description: 'Tu pedido ya fue despachado y va en camino.', icon: '🚚' },
    OUT_FOR_DELIVERY: { label: 'En reparto', description: 'Tu pedido esta en reparto.', icon: '🛵' },
    DELIVERED: { label: 'Entregado', description: 'Tu pedido fue entregado.', icon: '📦' },
    COMPLETED: { label: 'Completado', description: 'Tu pedido fue completado. Gracias por comprar.', icon: '🎉' },
    CANCELLED: { label: 'Cancelado', description: 'Tu pedido fue cancelado.', icon: '❌' },
    DISPUTE: { label: 'En disputa', description: 'Tu pedido se encuentra en proceso de disputa.', icon: '⚠️' },
    REFUNDED: { label: 'Reembolsado', description: 'El pago de tu pedido fue reembolsado.', icon: '↩️' },
};

const STATUS_LABELS = {
    PENDING_PAYMENT: 'Pago pendiente',
    PAID: 'Pagado',
    IN_PREPARATION: 'En preparacion',
    SHIPPED: 'Enviada',
    OUT_FOR_DELIVERY: 'En reparto',
    DELIVERED: 'Entregada',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada',
    DISPUTE: 'En disputa',
    REFUNDED: 'Reembolsada',
};

const STATUS_CLASS = {
    PENDING_PAYMENT: 'order-tracking__list-status--pending',
    PAID: 'order-tracking__list-status--confirmed',
    IN_PREPARATION: 'order-tracking__list-status--confirmed',
    SHIPPED: 'order-tracking__list-status--shipped',
    OUT_FOR_DELIVERY: 'order-tracking__list-status--shipped',
    DELIVERED: 'order-tracking__list-status--delivered',
    COMPLETED: 'order-tracking__list-status--delivered',
    CANCELLED: 'order-tracking__list-status--cancelled',
    DISPUTE: 'order-tracking__list-status--cancelled',
    REFUNDED: 'order-tracking__list-status--cancelled',
};

const TERMINAL_STATUSES = new Set(['CANCELLED', 'DISPUTE', 'REFUNDED']);

const formatPrice = (value) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value || 0);

function buildImageUrl(url) {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const base = import.meta.env.VITE_API_BASE_URL || '';
    return `${base}/api/v1/products/images?key=${encodeURIComponent(url)}`;
}

function OrderTracking({ initialOrderId, onBack }) {
    const { orderId: urlOrderId } = useParams();
    const { user } = useAuth();
    const effectiveId = initialOrderId || urlOrderId || '';
    const [orderId, setOrderId] = useState(effectiveId);
    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(!!effectiveId);
    const [error, setError] = useState('');
    const [notFound, setNotFound] = useState(false);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(!effectiveId);
    const [retrying, setRetrying] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedMethodId, setSelectedMethodId] = useState('');
    const [cvv, setCvv] = useState('');
    const [success, setSuccess] = useState('');

    const currentIndex = order ? STATUS_STEPS.indexOf(order.status) : -1;
    const isTerminal = TERMINAL_STATUSES.has(order?.status);
    const isPaymentPending = order?.status === 'PENDING_PAYMENT';

    useEffect(() => {
        if (effectiveId) return;
        let cancelled = false;

        async function loadOrders() {
            const data = await orderService.getAll().catch(() => []);
            if (cancelled) return;
            const allOrders = Array.isArray(data) ? data : (data?.content || []);
            const myOrders = allOrders.filter((o) => o.customerId === user?.id);
            setOrders(myOrders);
            setOrdersLoading(false);
        }

        loadOrders();
        return () => { cancelled = true; };
    }, [effectiveId, user?.id]);

    const loadOrder = useCallback(async (id) => {
        if (!id) return;
        setLoading(true);
        setError('');
        setNotFound(false);
        setOrder(null);
        setItems([]);
        try {
            const data = await orderService.getById(id);
            setOrder(data);

            const orderItems = data.items?.length ? data.items : data.orderItems?.length ? data.orderItems : [];
            if (orderItems.length) {
                const resolved = await Promise.all(
                    orderItems.map(async (item) => {
                        try {
                            const product = await productService.getById(item.productId);
                            return { ...item, product };
                        } catch {
                            return { ...item, product: null };
                        }
                    })
                );
                setItems(resolved);
            }
        } catch (err) {
            if (err.response?.status === 404) {
                setNotFound(true);
            } else {
                setError(err.response?.data?.message || 'No se pudo consultar el pedido');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!effectiveId) return;
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError('');
            setSuccess('');
            setNotFound(false);
            setOrder(null);
            setItems([]);
            try {
                const data = await orderService.getById(effectiveId);
                if (cancelled) return;
                setOrder(data);
                const orderItems = data.items?.length ? data.items : data.orderItems?.length ? data.orderItems : [];
                if (orderItems.length) {
                    const resolved = await Promise.all(
                        orderItems.map(async (item) => {
                            try {
                                const product = await productService.getById(item.productId);
                                return { ...item, product };
                            } catch {
                                return { ...item, product: null };
                            }
                        })
                    );
                    if (!cancelled) setItems(resolved);
                }
            } catch (err) {
                if (cancelled) return;
                if (err.response?.status === 404) {
                    setNotFound(true);
                } else {
                    setError(err.response?.data?.message || 'No se pudo consultar el pedido');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [effectiveId]);

    useEffect(() => {
        if (!isPaymentPending) return;
        let cancelled = false;
        paymentMethodService.getAll().then((data) => {
            if (cancelled) return;
            const saved = Array.isArray(data) ? data : (data?.content || []);
            setPaymentMethods(saved);
            const def = saved.find((m) => m.default) || saved[0];
            if (def) setSelectedMethodId(def.id);
        }).catch((err) => {
            console.warn('No se pudieron cargar las tarjetas guardadas:', err);
        });
        return () => { cancelled = true; };
    }, [isPaymentPending]);

    const handleSubmit = (e) => {
        e.preventDefault();
        loadOrder(orderId.trim());
    };

    const handleSelectOrder = (id) => {
        setOrderId(id);
        setLoading(true);
        setOrders([]);
        loadOrder(id);
    };

    const handleBackToList = () => {
        setOrder(null);
        setItems([]);
        setOrderId('');
        setNotFound(false);
        setError('');
        setLoading(false);
        setOrdersLoading(true);
        orderService.getAll().then((data) => {
            const allOrders = Array.isArray(data) ? data : (data?.content || []);
            setOrders(allOrders.filter((o) => o.customerId === user?.id));
            setOrdersLoading(false);
        }).catch(() => {
            setOrders([]);
            setOrdersLoading(false);
        });
    };

    const handleRetryPayment = async () => {
        if (!order?.id) return;
        setRetrying(true);
        setError('');
        try {
            const result = await checkoutService.retryPayment(order.id);
            const sessionId = result.sessionId || result.data?.sessionId;
            if (!sessionId) {
                throw new Error('No se obtuvo sessionId del servidor');
            }
            await openEpaycoCheckout(sessionId);
            loadOrder(order.id);
        } catch (err) {
            setError(err.message || 'No se pudo reintentar el pago. Intenta de nuevo.');
        } finally {
            setRetrying(false);
        }
    };

    const handlePayWithSavedCard = async () => {
        if (!order?.id || !selectedMethodId || !cvv) return;
        setRetrying(true);
        setError('');
        setSuccess('');
        try {
            const result = await paymentService.retryOrderPayment(order.id, selectedMethodId, cvv);
            const paymentStatus = result?.status;
            await loadOrder(order.id);
            if (paymentStatus === 'DECLINED') {
                setError('El pago fue rechazado. Verifica los datos de tu tarjeta o intenta con otro método de pago.');
            } else if (paymentStatus === 'APPROVED') {
                setSuccess('Pago aprobado exitosamente.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo procesar el pago. Intenta de nuevo.');
        } finally {
            setRetrying(false);
        }
    };

    const showOrderList = !order && !loading;

    return (
        <div className="order-tracking">
            <div className="order-tracking__container">
                {showOrderList && (
                    <button type="button" className="order-tracking__back" onClick={onBack}>
                        ← Volver
                    </button>
                )}

                <h1 className="order-tracking__title">Mis Pedidos</h1>

                {showOrderList ? (
                    <>
                        <form className="order-tracking__search" onSubmit={handleSubmit}>
                            <input
                                type="text"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                placeholder="Buscar pedido por ID..."
                                aria-label="ID del pedido"
                            />
                            <button type="submit" className="order-tracking__search-btn" disabled={!orderId.trim()}>
                                Buscar
                            </button>
                        </form>

                        {error && <p className="order-tracking__error">{error}</p>}

                        {notFound && (
                            <div className="order-tracking__not-found">
                                <span className="order-tracking__not-found-icon">🔍</span>
                                <p>No se encontro un pedido con ese ID.</p>
                                <small>Verifica que el ID sea correcto.</small>
                            </div>
                        )}

                        {ordersLoading ? (
                            <p className="order-tracking__muted">Cargando pedidos...</p>
                        ) : orders.length === 0 ? (
                            <div className="order-tracking__empty">
                                <span className="order-tracking__empty-icon">📦</span>
                                <p>No tienes pedidos aun.</p>
                            </div>
                        ) : (
                            <div className="order-tracking__list">
                                {orders.map((o) => (
                                    <button
                                        type="button"
                                        className="order-tracking__list-item"
                                        key={o.id}
                                        onClick={() => handleSelectOrder(o.id)}
                                    >
                                        <div className="order-tracking__list-info">
                                            <span className="order-tracking__list-id">#{o.id?.slice(0, 8)}</span>
                                            <span className="order-tracking__list-date">
                                                {o.createdAt ? new Date(o.createdAt).toLocaleDateString('es-CO', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                                            </span>
                                        </div>
                                        <div className="order-tracking__list-meta">
                                            <span className={`order-tracking__list-status ${STATUS_CLASS[o.status] || ''}`}>
                                                {STATUS_LABELS[o.status] || o.status}
                                            </span>
                                            <strong>{formatPrice(o.totalAmount)}</strong>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {loading && <p className="order-tracking__muted">Consultando pedido...</p>}

                        {!loading && order && (
                            <>
                                <button type="button" className="order-tracking__back" onClick={handleBackToList}>
                                    ← Ver todos mis pedidos
                                </button>

                                <div className="order-tracking__result">
                                    <div className="order-tracking__hero">
                                        <div className="order-tracking__hero-left">
                                            <span className="order-tracking__hero-label">Pedido</span>
                                            <h2 className="order-tracking__hero-id">{order.id}</h2>
                                            <span className="order-tracking__hero-date">
                                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                                            </span>
                                        </div>
                                        <div className="order-tracking__hero-right">
                                            <span className={`order-tracking__badge ${isTerminal ? 'order-tracking__badge--cancelled' : ''}`}>
                                                {STATUS_INFO[order.status]?.icon} {STATUS_INFO[order.status]?.label || order.status}
                                            </span>
                                            <span className="order-tracking__hero-total">{formatPrice(order.totalAmount)}</span>
                                        </div>
                                    </div>

                                    <div className="order-tracking__timeline-card">
                                        <p className="order-tracking__timeline-desc">
                                            {STATUS_INFO[order.status]?.description || ''}
                                        </p>
                                        <div className="order-tracking__timeline">
                                            {STATUS_STEPS.map((step, i) => {
                                                const reached = isTerminal ? false : i <= currentIndex;
                                                const isCurrent = !isTerminal && i === currentIndex;
                                                return (
                                                    <div
                                                        key={step}
                                                        className={`order-tracking__step ${reached ? 'order-tracking__step--done' : ''} ${isCurrent ? 'order-tracking__step--current' : ''}`}
                                                    >
                                                        <div className="order-tracking__dot">
                                                            {reached ? '✓' : i + 1}
                                                        </div>
                                                        <span className="order-tracking__step-label">{STATUS_INFO[step].label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {isPaymentPending && (
                                        <div className="order-tracking__retry-section">
                                            <div className="order-tracking__retry-header">
                                                <h3 className="order-tracking__retry-title">Completa tu pago</h3>
                                                <p className="order-tracking__retry-text">
                                                    Esta orden sigue reservada mientras terminas el pago.
                                                </p>
                                            </div>

                                            {paymentMethods.length > 0 && (
                                                <div className="order-tracking__saved-cards">
                                                    <p className="order-tracking__saved-label">Tarjetas guardadas</p>
                                                    <div className="order-tracking__saved-list">
                                                        {paymentMethods.map((m) => (
                                                            <label key={m.id} className="order-tracking__saved-card">
                                                                <input
                                                                    type="radio"
                                                                    name="retry-card"
                                                                    value={m.id}
                                                                    checked={selectedMethodId === m.id}
                                                                    onChange={(e) => setSelectedMethodId(e.target.value)}
                                                                />
                                                                <span className="order-tracking__card-info">
                                                                    {m.brand || 'Tarjeta'} &bull;&bull;&bull;&bull; {m.last4}
                                                                    {m.default ? <small>Predeterminada</small> : null}
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                    <div className="order-tracking__saved-actions">
                                                        <input
                                                            className="order-tracking__saved-cvv"
                                                            type="password"
                                                            inputMode="numeric"
                                                            maxLength={4}
                                                            placeholder="CVV"
                                                            value={cvv}
                                                            onChange={(e) => setCvv(e.target.value)}
                                                            aria-label="CVV de la tarjeta seleccionada"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="payment-button"
                                                            onClick={handlePayWithSavedCard}
                                                            disabled={retrying || !selectedMethodId || !cvv}
                                                        >
                                                            {retrying ? 'Procesando...' : 'Pagar con tarjeta guardada'}
                                                        </button>
                                                    </div>
                                                    <div className="order-tracking__divider">
                                                        <span>o</span>
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                className="payment-button payment-button--epayco"
                                                onClick={handleRetryPayment}
                                                disabled={retrying}
                                            >
                                                {retrying ? 'Procesando...' : 'Pagar con tarjeta nueva'}
                                            </button>
                                        </div>
                                    )}

                                    {error && <p className="order-tracking__error">{error}</p>}
                                    {success && <p className="order-tracking__success">{success}</p>}

                                    <div className="order-tracking__grid">
                                        <div className="order-tracking__info-card">
                                            <h3 className="order-tracking__info-title">Direccion de envio</h3>
                                            <p className="order-tracking__info-text">{order.shippingAddress}</p>
                                            <p className="order-tracking__info-text">{order.shippingCity}, {order.shippingDepartment}</p>
                                        </div>
                                        <div className="order-tracking__info-card">
                                            <h3 className="order-tracking__info-title">Fechas</h3>
                                            <div className="order-tracking__info-row">
                                                <span>Creado</span>
                                                <strong>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-CO') : '-'}</strong>
                                            </div>
                                            {order.updatedAt && (
                                                <div className="order-tracking__info-row">
                                                    <span>Actualizado</span>
                                                    <strong>{new Date(order.updatedAt).toLocaleDateString('es-CO')}</strong>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {items.length > 0 && (
                                        <div className="order-tracking__products">
                                            <h3 className="order-tracking__products-title">Productos ({items.length})</h3>
                                            <div className="order-tracking__products-list">
                                                {items.map((item, i) => {
                                                    const product = item.product || {};
                                                    const image = product.images?.length
                                                        ? buildImageUrl(product.images[0]?.imageUrl || product.images[0])
                                                        : null;
                                                    return (
                                                        <div className="order-tracking__product" key={item.id || i}>
                                                            <div className="order-tracking__product-img">
                                                                {image ? (
                                                                    <img src={image} alt={product.name || 'Producto'} />
                                                                ) : (
                                                                    <span className="order-tracking__product-placeholder">📦</span>
                                                                )}
                                                            </div>
                                                            <div className="order-tracking__product-info">
                                                                <span className="order-tracking__product-name">
                                                                    {product.name || item.productName || 'Producto'}
                                                                </span>
                                                                <span className="order-tracking__product-qty">
                                                                    x{item.quantity || 1}
                                                                </span>
                                                            </div>
                                                            <span className="order-tracking__product-price">
                                                                {formatPrice(item.unitPrice || item.price || 0)}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default OrderTracking;