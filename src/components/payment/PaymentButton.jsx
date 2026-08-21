import { useEffect, useState } from 'react';
import { paymentService } from '../../services/payment.service';
import { paymentMethodService } from '../../services/payment-method.service';

export function PaymentButton({ orderId, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);
  const [methods, setMethods] = useState([]);
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    let cancelled = false;

    paymentMethodService.getAll().then((data) => {
      if (cancelled) return;
      const savedMethods = Array.isArray(data) ? data : [];
      setMethods(savedMethods);
      setSelectedMethodId(savedMethods.find((method) => method.default)?.id || savedMethods[0]?.id || '');
    }).catch((error) => onError(error));

    return () => { cancelled = true; };
  }, [onError]);

  const handlePayment = async () => {
    if (!selectedMethodId || !cvv) {
      onError(new Error('Selecciona una tarjeta guardada e ingresa su CVV'));
      return;
    }

    setLoading(true);
    try {
      const result = await paymentService.retryOrderPayment(orderId, selectedMethodId, cvv);
      onSuccess(result);
    } catch (error) {
      onError(error);
      setLoading(false);
    }
  };

  return (
    <div className="payment-retry">
      {methods.length > 0 ? (
        <>
          <div className="payment-retry__methods">
            {methods.map((method) => (
              <label key={method.id} className="payment-retry__method">
                <input
                  type="radio"
                  name={`retry-payment-${orderId}`}
                  value={method.id}
                  checked={selectedMethodId === method.id}
                  onChange={(event) => setSelectedMethodId(event.target.value)}
                />
                <span>{method.brand || 'Tarjeta'} •••• {method.last4}</span>
                {method.default && <small>Predeterminada</small>}
              </label>
            ))}
          </div>
          <div className="payment-retry__actions">
            <input
              className="payment-retry__cvv"
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="CVV"
              value={cvv}
              onChange={(event) => setCvv(event.target.value)}
              aria-label="CVV de la tarjeta seleccionada"
            />
            <button type="button" onClick={handlePayment} disabled={loading} className="payment-button">
              {loading ? 'Procesando...' : 'Reintentar pago'}
            </button>
          </div>
        </>
      ) : (
        <p className="payment-retry__empty">No tienes tarjetas guardadas para reintentar este pago.</p>
      )}
    </div>
  );
}
