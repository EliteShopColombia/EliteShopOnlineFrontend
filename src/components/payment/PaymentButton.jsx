import { useState } from 'react';
import { paymentService } from '../../services/payment.service';

export function PaymentButton({ orderId, amount, email, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { sessionId } = await paymentService.createCheckoutSession({
        orderId,
        amount,
        customerEmail: email,
        paymentMethod: 'CARD',
      });

      if (!sessionId) {
        onError(new Error('No se pudo crear la sesion de pago'));
        return;
      }

      const checkout = window.ePayco.checkout.configure({
        sessionId,
        type: 'onpage',
        test: true,
      });

      checkout.setHooks({
        onResponse: (response) => {
          if (response.status === 'APPROVED') {
            onSuccess();
          } else {
            onError(response);
          }
        },
        onErrors: (error) => onError(error),
        onClosed: () => setLoading(false),
      });

      checkout.open();
    } catch (error) {
      onError(error);
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={loading}
      className="payment-button"
    >
      {loading ? 'Procesando...' : 'Pagar con ePayco'}
    </button>
  );
}
