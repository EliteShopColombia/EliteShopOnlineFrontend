import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import { STATUS_LABELS } from '../Orders/order-status';
import '../Orders/Orders.css';

const statuses = ['', ...Object.keys(STATUS_LABELS)];
const shippingCarriers = ['Coordinadora', 'Servientrega', 'Inter Rapidísimo', 'TCC', 'Envía', '4-72', 'DHL', 'FedEx', 'Otro'];
const refundReasons = ['Reembolso aprobado por el vendedor', 'Producto defectuoso confirmado', 'Producto incorrecto confirmado', 'Pedido incompleto confirmado', 'Otro motivo'];
const formatPrice = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value || 0);
const getOrderTotal = (order) => order.totalAmount ?? order.totalPrice ?? order.total ?? order.amount ?? 0;
const createDemoTrackingNumber = () => `SRV-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${Math.floor(100000 + Math.random() * 900000)}`;

function SellerOrders({ sellerId, onBack }) {
    const navigate = useNavigate();
    const effectiveSellerId = sellerId || localStorage.getItem('sellerId');
    const [orders, setOrders] = useState([]);
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [busyId, setBusyId] = useState('');
    const [shippingOrder, setShippingOrder] = useState(null);
    const [shippingCarrier, setShippingCarrier] = useState('');
    const [issueOrder, setIssueOrder] = useState(null);
    const [issueReason, setIssueReason] = useState('');

    const loadOrders = async () => {
        if (!effectiveSellerId) return;
        setLoading(true); setError('');
        try {
            const data = await orderService.getBySeller(effectiveSellerId);
            const allOrders = Array.isArray(data) ? data : data?.content || [];
            const filteredOrders = status ? allOrders.filter((order) => order.status === status) : allOrders;
            const start = page * 10;
            setOrders(filteredOrders.slice(start, start + 10));
            setTotalPages(Math.max(1, Math.ceil(filteredOrders.length / 10)));
        } catch (err) { setError(err.response?.data?.message || 'No se pudieron cargar las órdenes.'); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        let active = true;
        async function fetchOrders() {
            if (!effectiveSellerId) return;
            setLoading(true); setError('');
            try {
                const data = await orderService.getBySeller(effectiveSellerId);
                if (!active) return;
                const allOrders = Array.isArray(data) ? data : data?.content || [];
                const filteredOrders = status ? allOrders.filter((order) => order.status === status) : allOrders;
                const start = page * 10;
                setOrders(filteredOrders.slice(start, start + 10));
                setTotalPages(Math.max(1, Math.ceil(filteredOrders.length / 10)));
            } catch (err) {
                if (active) setError(err.response?.data?.message || 'No se pudieron cargar las órdenes.');
            } finally { if (active) setLoading(false); }
        }
        fetchOrders();
        return () => { active = false; };
    }, [effectiveSellerId, status, page]);

    const action = async (order, type) => {
        setBusyId(order.id); setError('');
        try {
            if (type === 'prepare') await orderService.prepareOrder(order.id);
            if (type === 'out') await orderService.outForDeliveryOrder(order.id);
            if (type === 'complete') await orderService.completeOrder(order.id);
            if (type === 'refund') await orderService.refundOrder(order.id, issueReason);
            if (type === 'ship') {
                const generatedTrackingNumber = createDemoTrackingNumber();
                await orderService.updateTracking(order.id, { shippingCarrier, trackingNumber: generatedTrackingNumber });
                await orderService.shipOrder(order.id);
                setShippingOrder(null);
                setShippingCarrier('');
                localStorage.setItem(`demo-shipping-${order.id}`, JSON.stringify({
                    carrier: shippingCarrier,
                    trackingNumber: generatedTrackingNumber,
                    generatedAt: new Date().toISOString(),
                }));
                navigate(`/seller/orders/${order.id}/shipping-label`);
            }
            if (['dispute', 'refund'].includes(type)) {
                setIssueOrder(null);
                setIssueReason('');
            }
            await loadOrders();
        } catch (err) { setError(err.response?.data?.message || 'No se pudo cambiar el estado.'); }
        finally { setBusyId(''); }
    };

    return <div className="orders-page">
        <button className="orders-page__back" onClick={onBack || (() => navigate('/seller/dashboard'))}>← Dashboard</button>
        <div className="orders-page__header"><h1>Gestión de órdenes</h1><span className="orders-page__count">Página {page + 1} de {totalPages}</span></div>
        <div className="orders-filters"><label>Estado<select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}>{statuses.map((item) => <option key={item} value={item}>{item ? STATUS_LABELS[item] : 'Todos los estados'}</option>)}</select></label></div>
        {error && <p className="orders-page__message orders-page__message--error">{error}</p>}
        {loading ? <p className="orders-page__muted">Cargando órdenes...</p> : <div className="seller-orders-list">{orders.map((order) => <article className="order-card" key={order.id}>
            <div className="order-card__top"><strong>#{String(order.id).slice(0, 8)}</strong><span className="status-badge">{STATUS_LABELS[order.status] || order.status}</span></div>
            <div className="order-card__meta"><span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-CO') : '-'}</span><strong>{formatPrice(getOrderTotal(order))}</strong></div>
            {order.status === 'DISPUTE' && order.disputeReason && <div className="order-card__dispute-reason"><small>Reclamación del comprador</small><span>{order.disputeReason}</span></div>}
            <div className="order-card__actions">
                {order.status === 'PAID' && <button disabled={busyId === order.id} onClick={() => action(order, 'prepare')}>Preparar</button>}
                {order.status === 'IN_PREPARATION' && <button disabled={busyId === order.id} onClick={() => { setShippingOrder(order); setShippingCarrier(''); }}>Enviar con guía</button>}
                {order.status === 'SHIPPED' && <button disabled={busyId === order.id} onClick={() => action(order, 'out')}>Marcar en reparto</button>}
                {order.status === 'DELIVERED' && <button disabled={busyId === order.id} onClick={() => action(order, 'complete')}>Completar orden</button>}
                {order.status === 'DISPUTE' && <button disabled={busyId === order.id} onClick={() => { setIssueOrder({ ...order, issueType: 'refund' }); setIssueReason(''); }}>Procesar reembolso</button>}
            </div>
        </article>)}</div>}
        <div className="orders-pagination"><button disabled={page === 0} onClick={() => setPage((value) => value - 1)}>Anterior</button><button disabled={page + 1 >= totalPages} onClick={() => setPage((value) => value + 1)}>Siguiente</button></div>
        {shippingOrder && <div className="shipping-modal" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShippingOrder(null); }}>
            <div className="shipping-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="shipping-modal-title">
                <button className="shipping-modal__close" type="button" aria-label="Cerrar" onClick={() => setShippingOrder(null)}>×</button>
                <h2 id="shipping-modal-title">Enviar pedido con guía</h2>
                <p>Pedido #{String(shippingOrder.id).slice(0, 8)}</p>
                <label htmlFor="shipping-carrier">Servicio de entrega</label>
                <select id="shipping-carrier" value={shippingCarrier} onChange={(event) => setShippingCarrier(event.target.value)}>
                    <option value="">Selecciona un transportista</option>
                    {shippingCarriers.map((carrier) => <option key={carrier} value={carrier}>{carrier}</option>)}
                </select>
                <p className="shipping-modal__hint">Para este ejemplo generaremos automáticamente una guía de prueba.</p>
                <div className="shipping-modal__actions">
                    <button type="button" className="shipping-modal__cancel" onClick={() => setShippingOrder(null)}>Cancelar</button>
                    <button type="button" className="shipping-modal__confirm" disabled={!shippingCarrier || busyId === shippingOrder.id} onClick={() => action(shippingOrder, 'ship')}>Continuar</button>
                </div>
            </div>
        </div>}
        {issueOrder && <div className="cancel-modal" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIssueOrder(null); }}>
            <section className="cancel-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="issue-modal-title">
                <button type="button" className="cancel-modal__close" aria-label="Cerrar" onClick={() => setIssueOrder(null)}>×</button>
                <div className="cancel-modal__icon">!</div>
                <h2 id="issue-modal-title">Procesar reembolso</h2>
                {issueOrder?.disputeReason && <p className="cancel-modal__dispute-reason-label">El cliente reclamó: <strong>{issueOrder.disputeReason}</strong></p>}
                <p>Selecciona el motivo para registrar la decisión del vendedor.</p>
                <label htmlFor="issue-reason">Motivo del reembolso</label>
                <select id="issue-reason" value={issueReason} onChange={(event) => setIssueReason(event.target.value)} autoFocus>
                    <option value="">Selecciona un motivo</option>
                    {refundReasons.map((reason) => <option key={reason} value={reason}>{reason}</option>)}
                </select>
                <div className="cancel-modal__actions">
                    <button type="button" className="cancel-modal__keep" onClick={() => setIssueOrder(null)}>Cancelar</button>
                    <button type="button" className="cancel-modal__confirm" disabled={!issueReason || busyId === issueOrder.id} onClick={() => action(issueOrder, issueOrder.issueType)}>Confirmar</button>
                </div>
            </section>
        </div>}
    </div>;
}

export default SellerOrders;