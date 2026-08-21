import { useState, useEffect } from 'react';
import { productService } from '../../services/product.service';
import { orderService } from '../../services/order.service';
import './SellerDashboard.css';

function buildImageUrl(url) {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const base = import.meta.env.VITE_API_BASE_URL || '';
    return `${base}/api/v1/products/images?key=${encodeURIComponent(url)}`;
}

const formatPrice = (value) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value || 0);
const getOrderTotal = (order) => order.totalAmount ?? order.totalPrice ?? order.total ?? order.amount ?? 0;

const STATUS_LABELS = {
    PENDING_PAYMENT: 'Pago pendiente',
    PAID: 'Pagado',
    IN_PREPARATION: 'En preparacion',
    SHIPPED: 'Enviado',
    OUT_FOR_DELIVERY: 'En reparto',
    DELIVERED: 'Entregado',
    COMPLETED: 'Completado',
    CANCELLED: 'Cancelado',
    DISPUTE: 'En disputa',
    REFUNDED: 'Reembolsado',
};

function readCount(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    if (value && typeof value === 'object') {
        if ('count' in value) return readCount(value.count);
        if ('total' in value) return readCount(value.total);
        if ('value' in value) return readCount(value.value);
    }

    return 0;
}

function normalizeStatusCounts(data) {
    const source = data?.counts && typeof data.counts === 'object'
        ? data.counts
        : data?.statusCounts && typeof data.statusCounts === 'object'
            ? data.statusCounts
            : data;

    if (!source || typeof source !== 'object' || Array.isArray(source)) {
        return {};
    }

    return Object.fromEntries(
        Object.entries(source)
            .filter(([status]) => status in STATUS_LABELS)
            .map(([status, value]) => [status, readCount(value)])
    );
}

function SellerDashboard({ sellerId, onBack, onNavigate }) {
    const effectiveSellerId = sellerId || localStorage.getItem('sellerId');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [summary, setSummary] = useState(null);
    const [statusCounts, setStatusCounts] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            if (!effectiveSellerId) {
                setLoading(false);
                return;
            }

            const [productsRes, ordersRes] = await Promise.allSettled([
                productService.getAll(0, 100),
                orderService.getBySeller(effectiveSellerId),
            ]);

            const [summaryRes, countsRes] = await Promise.allSettled([
                orderService.getSummary(effectiveSellerId),
                orderService.getStatusCounts(effectiveSellerId),
            ]);

            if (cancelled) return;

            if (productsRes.status === 'fulfilled' && productsRes.value) {
                const list = (productsRes.value.content || []).filter((p) => p.sellerId === effectiveSellerId);
                setProducts(list);
            }

            if (ordersRes.status === 'fulfilled') {
                const allOrders = Array.isArray(ordersRes.value) ? ordersRes.value : (ordersRes.value?.content || []);
                setOrders(allOrders);
            }

            if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value);
            if (countsRes.status === 'fulfilled') setStatusCounts(normalizeStatusCounts(countsRes.value));

            setLoading(false);
        }

        load();
        return () => { cancelled = true; };
    }, [effectiveSellerId]);

    const calculatedRevenue = orders
        .filter((o) => !['CANCELLED', 'REFUNDED'].includes(o.status))
        .reduce((sum, o) => sum + getOrderTotal(o), 0);
    const totalRevenue = summary?.totalRevenue ?? calculatedRevenue;

    const pendingOrders = ['PENDING_PAYMENT', 'PAID', 'IN_PREPARATION']
        .reduce((sum, status) => sum + Number(statusCounts[status] || 0), 0) || orders.filter((o) => ['PENDING_PAYMENT', 'PAID', 'IN_PREPARATION'].includes(o.status)).length;

    return (
        <div className="seller-dash">
            <div className="seller-dash__container">
                <button type="button" className="seller-dash__back" onClick={onBack}>
                    ← Volver al perfil
                </button>

                <h1 className="seller-dash__title">Panel de Ventas</h1>

                {loading ? (
                    <p className="seller-dash__muted">Cargando datos...</p>
                ) : (
                    <>
                        <section className="seller-dash__stats">
                            <div className="seller-dash__stat">
                                <span className="seller-dash__stat-label">Productos</span>
                                <span className="seller-dash__stat-value">{products.length}</span>
                            </div>
                            <div className="seller-dash__stat">
                                <span className="seller-dash__stat-label">Pedidos</span>
                                <span className="seller-dash__stat-value">{summary?.totalOrders ?? orders.length}</span>
                            </div>
                            <div className="seller-dash__stat">
                                <span className="seller-dash__stat-label">Pendientes</span>
                                <span className="seller-dash__stat-value seller-dash__stat-value--warn">{pendingOrders}</span>
                            </div>
                            <div className="seller-dash__stat">
                                <span className="seller-dash__stat-label">Ingresos</span>
                                <span className="seller-dash__stat-value seller-dash__stat-value--green">{formatPrice(totalRevenue)}</span>
                            </div>
                        </section>

                        <section className="seller-dash__section">
                            <div className="seller-dash__section-header">
                                <h2 className="seller-dash__section-title">Estados de órdenes</h2>
                                <button type="button" className="seller-dash__link-btn" onClick={() => onNavigate?.('/seller/orders')}>Gestionar órdenes</button>
                            </div>
                            <div className="seller-dash__stats">
                                {Object.entries(statusCounts).map(([status, count]) => (
                                    <div className="seller-dash__stat" key={status}>
                                        <span className="seller-dash__stat-label">{STATUS_LABELS[status] || status}</span>
                                        <span className="seller-dash__stat-value">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="seller-dash__section">
                            <div className="seller-dash__section-header">
                                <h2 className="seller-dash__section-title">Productos</h2>
                                <button
                                    type="button"
                                    className="seller-dash__link-btn"
                                    onClick={() => onNavigate?.('/seller/products/new')}
                                >
                                    + Crear producto
                                </button>
                            </div>
                            {products.length === 0 ? (
                                <p className="seller-dash__muted">Aun no tienes productos.</p>
                            ) : (
                                <div className="seller-dash__list">
                                    {products.map((product) => (
                                        <div className="seller-dash__product" key={product.id || product.productId}>
                                            <div className="seller-dash__product-image">
                                                {product.images?.length ? (
                                                    <img
                                                        src={buildImageUrl(product.images[0]?.imageUrl || product.images[0])}
                                                        alt={product.name}
                                                    />
                                                ) : (
                                                    <span>?</span>
                                                )}
                                            </div>
                                            <div className="seller-dash__product-info">
                                                <span className="seller-dash__product-name">{product.name}</span>
                                                <span className="seller-dash__product-price">{formatPrice(product.price)}</span>
                                                <span className="seller-dash__product-stock">
                                                    {product.stock} disponibles
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="seller-dash__section">
                            <h2 className="seller-dash__section-title">Pedidos Recientes</h2>
                            {orders.length === 0 ? (
                                <p className="seller-dash__muted">Aun no tienes pedidos.</p>
                            ) : (
                                <div className="seller-dash__list">
                                    {orders.slice(0, 10).map((order) => (
                                        <div className="seller-dash__order" key={order.id}>
                                            <div className="seller-dash__order-info">
                                                <span className="seller-dash__order-id">#{order.id?.slice(0, 8)}</span>
                                                <span className="seller-dash__order-date">
                                                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-CO') : '-'}
                                                </span>
                                            </div>
                                            <div className="seller-dash__order-meta">
                                                <span className={`seller-dash__status seller-dash__status--${order.status?.toLowerCase()}`}>
                                                    {STATUS_LABELS[order.status] || order.status}
                                                </span>
                                                <span className="seller-dash__order-total">
                                                    {formatPrice(getOrderTotal(order))}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}

export default SellerDashboard;
