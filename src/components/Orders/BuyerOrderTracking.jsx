import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import { STATUS_LABELS } from './order-status';
import './Orders.css';

const TRACKING_STEPS = [
    'PAID',
    'IN_PREPARATION',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'COMPLETED',
];

const TRACKING_DESCRIPTIONS = {
    PAID: 'El pago fue aprobado y el pedido está listo para preparación.',
    IN_PREPARATION: 'El pedido está siendo preparado.',
    SHIPPED: 'El pedido fue despachado y está en camino.',
    OUT_FOR_DELIVERY: 'El pedido está en reparto.',
    DELIVERED: 'El pedido fue entregado.',
    COMPLETED: 'El pedido fue completado.',
};

function buildFallbackEvents(order) {
    const currentIndex = TRACKING_STEPS.indexOf(order.status);
    const steps = currentIndex >= 0
        ? TRACKING_STEPS.slice(0, currentIndex + 1)
        : [order.status];

    return steps.reverse().map((status) => ({
        id: `status-${order.id}-${status}`,
        status,
        description: TRACKING_DESCRIPTIONS[status] || 'Actualización del pedido',
        eventTimestamp: status === order.status ? (order.updatedAt || order.createdAt) : order.createdAt,
    }));
}

function sortTrackingEvents(events) {
    return [...events].sort((first, second) => {
        const firstIndex = TRACKING_STEPS.indexOf(first.status);
        const secondIndex = TRACKING_STEPS.indexOf(second.status);
        return (secondIndex < 0 ? Number.MAX_SAFE_INTEGER : secondIndex)
            - (firstIndex < 0 ? Number.MAX_SAFE_INTEGER : firstIndex);
    });
}

function BuyerOrderTracking() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [events, setEvents] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        async function loadTracking() {
            try {
                const data = await orderService.getById(orderId);
                if (!active) return;

                setOrder(data);

                const tracking = await orderService.getTrackingEvents(orderId).catch(() => null);
                if (!active) return;

                const trackingEvents = Array.isArray(tracking) ? tracking : tracking?.content || [];
                setEvents(trackingEvents.length ? sortTrackingEvents(trackingEvents) : buildFallbackEvents(data));
            } catch (err) {
                if (active) setError(err.response?.data?.message || 'No se pudo cargar el pedido.');
            }
        }

        loadTracking();
        return () => { active = false; };
    }, [orderId]);

    return <div className="orders-page orders-page--tracking">
        <button className="orders-page__back" onClick={() => navigate('/profile/orders')}>← Mis pedidos</button>
        <h1>Seguimiento del pedido</h1>
        {error && <p className="orders-page__message orders-page__message--error">{error}</p>}
        {!order && !error ? <p className="orders-page__muted">Cargando seguimiento...</p> : order && <>
            <div className="tracking-summary"><div><small>Pedido</small><strong>#{String(order.id).slice(0, 8)}</strong></div><span className="status-badge">{STATUS_LABELS[order.status] || order.status}</span></div>
            {(order.trackingNumber || order.shippingCarrier || order.shippingLabelUrl) && <div className="shipping-info">
                <div><small>Número de guía</small><strong>{order.trackingNumber || 'Pendiente'}</strong></div>
                <div><small>Transportista</small><strong>{order.shippingCarrier || 'Pendiente'}</strong></div>
                {order.shippingLabelUrl && <a href={order.shippingLabelUrl} target="_blank" rel="noreferrer">Ver etiqueta de envío ↗</a>}
            </div>}
            <div className="timeline"><h2>Historial</h2>{events.length === 0 ? <p className="orders-page__muted">Aún no hay eventos de tracking.</p> : events.map((event, index) => <div className="timeline__event" key={event.id || `${event.status}-${index}`}><span className="timeline__dot" /><div><strong>{STATUS_LABELS[event.status] || event.status}</strong><p>{event.description || 'Actualización del pedido'}</p><small>{event.location && `${event.location} · `}{event.eventTimestamp ? new Date(event.eventTimestamp).toLocaleString('es-CO') : ''}</small></div></div>)}</div>
        </>}
    </div>;
}

export default BuyerOrderTracking;