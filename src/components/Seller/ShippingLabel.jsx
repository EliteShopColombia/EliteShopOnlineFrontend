import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import './ShippingLabel.css';

function createDemoQr(value) {
    const size = 21;
    const cells = Array.from({ length: size * size }, () => false);
    const reserved = new Set();
    let seed = [...value].reduce((total, character) => ((total * 31) + character.charCodeAt(0)) % 2147483647, 7);
    const indexFor = (row, column) => row * size + column;

    const addFinder = (startRow, startColumn) => {
        for (let row = -1; row <= 7; row += 1) {
            for (let column = -1; column <= 7; column += 1) {
                const targetRow = startRow + row;
                const targetColumn = startColumn + column;
                if (targetRow < 0 || targetRow >= size || targetColumn < 0 || targetColumn >= size) continue;
                const cellIndex = indexFor(targetRow, targetColumn);
                reserved.add(cellIndex);
                cells[cellIndex] = row >= 0 && row <= 6 && column >= 0 && column <= 6
                    && (row === 0 || row === 6 || column === 0 || column === 6 || (row >= 2 && row <= 4 && column >= 2 && column <= 4));
            }
        }
    };

    addFinder(0, 0);
    addFinder(0, size - 7);
    addFinder(size - 7, 0);
    for (let row = 0; row < size; row += 1) {
        for (let column = 0; column < size; column += 1) {
            const cellIndex = indexFor(row, column);
            if (reserved.has(cellIndex)) continue;
            seed = (seed * 48271) % 2147483647;
            cells[cellIndex] = seed % 3 !== 0;
        }
    }
    return cells;
}

function ShippingLabel() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [shipping, setShipping] = useState(null);

    useEffect(() => {
        const savedShipping = localStorage.getItem(`demo-shipping-${orderId}`);
        if (savedShipping) setShipping(JSON.parse(savedShipping));
        orderService.getById(orderId).then(setOrder).catch(() => setOrder({ id: orderId }));
    }, [orderId]);

    if (!shipping) {
        return <main className="shipping-label-page"><p>No se encontró la guía de prueba.</p><button type="button" onClick={() => navigate('/seller/orders')}>Volver a órdenes</button></main>;
    }

    return <main className="shipping-label-page">
        <div className="shipping-label-page__topbar">
            <button type="button" className="shipping-label-page__back" onClick={() => navigate('/seller/orders')}>← Volver a órdenes</button>
            <span className="shipping-label-page__demo">Guía de demostración</span>
        </div>
        <section className="shipping-label" aria-labelledby="shipping-label-title">
            <div className="shipping-label__brand">EliteShop <span>×</span> {shipping.carrier}</div>
            <div className="shipping-label__rule" />
            <p className="shipping-label__eyebrow">Número de guía</p>
            <h1 id="shipping-label-title">{shipping.trackingNumber}</h1>
            <div className="shipping-label__details">
                <div><small>Pedido</small><strong>#{String(order?.id || orderId).slice(0, 8)}</strong></div>
            </div>
            <div className="shipping-label__qr" aria-label="Código QR de demostración">{createDemoQr(shipping.trackingNumber).map((isDark, index) => <span className={isDark ? 'shipping-label__qr-cell shipping-label__qr-cell--dark' : 'shipping-label__qr-cell'} key={index} />)}</div>
            <p className="shipping-label__qr-caption">QR de demostración</p>
            <p className="shipping-label__note">Esta guía es un ejemplo generado por EliteShop mientras se integra la API de Servientrega.</p>
        </section>
        <div className="shipping-label-page__actions">
            <button type="button" className="shipping-label-page__print" onClick={() => window.print()}>Ver guía e imprimir</button>
            <button type="button" className="shipping-label-page__secondary" onClick={() => navigate('/seller/orders')}>Volver a órdenes</button>
        </div>
    </main>;
}

export default ShippingLabel;
