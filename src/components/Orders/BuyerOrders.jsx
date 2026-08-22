import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/order.service';
import { paymentService } from '../../services/payment.service';
import { STATUS_LABELS } from './order-status';
import './Orders.css';

const canCancel = (status) => ['PENDING_PAYMENT', 'PAID'].includes(status);
const canConfirm = (status) => ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(status);
const canRetry = (status) => ['PENDING_PAYMENT', 'PAYMENT_FAILED', 'FAILED'].includes(status);
const canDispute = (status) => ['IN_PREPARATION', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'].includes(status);
const disputeReasons = ['El producto llegó defectuoso', 'Recibí un producto diferente al solicitado', 'El pedido llegó incompleto', 'El pedido no llegó', 'El producto no cumple con la descripción', 'Ya no necesito el producto'];
const formatPrice = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value || 0);
const getOrderTotal = (order) => order.totalAmount ?? order.totalPrice ?? order.total ?? order.amount ?? 0;
const getActionError = (error) => {
    const responseData = error.response?.data;
    if (typeof responseData === 'string') return responseData;
    if (responseData?.message) return responseData.message;
    if (responseData?.error) return responseData.error;
    if (Array.isArray(responseData?.errors)) return responseData.errors.join(', ');
    return 'No se pudo actualizar el pedido.';
};

function BuyerOrders() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [busyId, setBusyId] = useState('');
    const [cancelOrder, setCancelOrder] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [disputeOrder, setDisputeOrder] = useState(null);
    const [disputeReason, setDisputeReason] = useState('');

    const loadOrders = async () => {
        if (!user?.userId) return;
        setLoading(true);
        try {
            const data = await orderService.getMyOrders();
            setOrders(Array.isArray(data) ? data : data?.content || []);
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudieron cargar tus pedidos.');
        } finally { setLoading(false); }
    };

    useEffect(() => {
        let active = true;
        async function fetchOrders() {
            if (!user?.userId) return;
            setLoading(true);
            try {
                const data = await orderService.getMyOrders();
                if (active) setOrders(Array.isArray(data) ? data : data?.content || []);
            } catch (err) {
                if (active) setError(err.response?.data?.message || 'No se pudieron cargar tus pedidos.');
            } finally { if (active) setLoading(false); }
        }
        fetchOrders();
        return () => { active = false; };
    }, [user?.userId]);

    const runAction = async (order, action) => {
        setBusyId(order.id); setError('');
        try {
            if (action === 'cancel') await orderService.cancelOrder(order.id, cancelReason.trim());
            else if (action === 'confirm') await orderService.confirmDelivery(order.id);
            else if (action === 'dispute') await orderService.disputeOrder(order.id, disputeReason);
            else await paymentService.retryOrderPayment(order.id);
            setCancelOrder(null);
            setCancelReason('');
            setDisputeOrder(null);
            setDisputeReason('');
            await loadOrders();
        } catch (err) { setError(getActionError(err)); }
        finally { setBusyId(''); }
    };

    return <div className="orders-page">
        <div className="orders-page__header">
            <div><button className="orders-page__back" onClick={() => navigate('/')}>← Inicio</button><h1>Mis pedidos</h1></div>
            <span className="orders-page__count">{orders.length} pedidos</span>
        </div>
        {error && <p className="orders-page__message orders-page__message--error">{error}</p>}
        {loading ? <p className="orders-page__muted">Cargando pedidos...</p> : orders.length === 0 ? <p className="orders-page__empty">Todavía no tienes pedidos.</p> : <div className="orders-list">
            {orders.map((order) => <article className="order-card" key={order.id}>
                <div className="order-card__top"><strong>Pedido #{String(order.id).slice(0, 8)}</strong><span className={`status-badge status-badge--${order.status?.toLowerCase()}`}>{STATUS_LABELS[order.status] || order.status}</span></div>
                <div className="order-card__meta"><span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-CO') : 'Fecha no disponible'}</span><strong>{formatPrice(getOrderTotal(order))}</strong></div>
                <div className="order-card__actions">
                    <button onClick={() => navigate(`/profile/orders/${order.id}/tracking`)}>Ver seguimiento</button>
                    {canCancel(order.status) && <button disabled={busyId === order.id} onClick={() => { setCancelOrder(order); setCancelReason(''); }}>Cancelar</button>}
                    {canConfirm(order.status) && <button disabled={busyId === order.id} onClick={() => runAction(order, 'confirm')}>Confirmar entrega</button>}
                    {canRetry(order.status) && <button disabled={busyId === order.id} onClick={() => runAction(order, 'retry')}>Pagar de nuevo</button>}
                    {canDispute(order.status) && <button disabled={busyId === order.id} onClick={() => { setDisputeOrder(order); setDisputeReason(''); }}>Abrir disputa</button>}
                </div>
            </article>)}
        </div>}
        {cancelOrder && <div className="cancel-modal" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCancelOrder(null); }}>
            <section className="cancel-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="cancel-modal-title">
                <button type="button" className="cancel-modal__close" aria-label="Cerrar" onClick={() => setCancelOrder(null)}>×</button>
                <div className="cancel-modal__icon">!</div>
                <h2 id="cancel-modal-title">¿Cancelar este pedido?</h2>
                <p>Esta acción no se puede deshacer. Puedes indicarnos un motivo si lo deseas.</p>
                <label htmlFor="cancel-reason">Motivo <span>(opcional)</span></label>
                <textarea id="cancel-reason" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} placeholder="Escribe el motivo de la cancelación" rows="3" maxLength="300" />
                <div className="cancel-modal__actions">
                    <button type="button" className="cancel-modal__keep" onClick={() => setCancelOrder(null)}>Conservar pedido</button>
                    <button type="button" className="cancel-modal__confirm" onClick={() => runAction(cancelOrder, 'cancel')}>Sí, cancelar pedido</button>
                </div>
            </section>
        </div>}
        {disputeOrder && <div className="cancel-modal" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDisputeOrder(null); }}>
            <section className="cancel-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="dispute-modal-title">
                <button type="button" className="cancel-modal__close" aria-label="Cerrar" onClick={() => setDisputeOrder(null)}>×</button>
                <div className="cancel-modal__icon">!</div>
                <h2 id="dispute-modal-title">Abrir disputa</h2>
                <p>Indica el motivo de tu reclamación. El vendedor revisará el caso y podrá procesar el reembolso.</p>
                <label htmlFor="dispute-reason">Motivo de la disputa</label>
                <select id="dispute-reason" value={disputeReason} onChange={(event) => setDisputeReason(event.target.value)} autoFocus>
                    <option value="">Selecciona un motivo</option>
                    {disputeReasons.map((reason) => <option key={reason} value={reason}>{reason}</option>)}
                </select>
                <div className="cancel-modal__actions">
                    <button type="button" className="cancel-modal__keep" onClick={() => setDisputeOrder(null)}>Cancelar</button>
                    <button type="button" className="cancel-modal__confirm" disabled={!disputeReason || busyId === disputeOrder.id} onClick={() => runAction(disputeOrder, 'dispute')}>Confirmar disputa</button>
                </div>
            </section>
        </div>}
    </div>;
}

export default BuyerOrders;