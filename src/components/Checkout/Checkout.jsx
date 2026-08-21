import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { cartService } from '../../services/cart.service';
import { checkoutService } from '../../services/checkout.service';
import { paymentMethodService } from '../../services/payment-method.service';
import { DEPARTMENTS, DNI_TYPES } from '../../constants/colombia';
import './Checkout.css';

const formatPrice = (value) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value || 0);

function Checkout({ onBack, onSuccess }) {
    const { user } = useAuth();
    const [cart, setCart] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        shippingAddress: user?.address || '',
        shippingDepartment: user?.department || '',
        shippingCity: user?.city || '',
        paymentMethodId: '',
        cardNumber: '',
        cvv: '',
        expiryMonth: '',
        expiryYear: '',
        docType: user?.dniType || 'CC',
        docNumber: user?.dniNumber || '',
        saveCard: false,
    });

    useEffect(() => {
        let cancelled = false;

        async function load() {
            const [cartData, methods] = await Promise.all([
                cartService.getCart().catch(() => null),
                paymentMethodService.getAll().catch(() => []),
            ]);
            if (cancelled) return;
            setCart(cartData);
            if (Array.isArray(methods) && methods.length) {
                setPaymentMethods(methods);
                const def = methods.find((m) => m.default) || methods[0];
                setForm((prev) => ({ ...prev, paymentMethodId: def.id }));
            }
            setLoading(false);
        }

        load();
        return () => { cancelled = true; };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => {
            const next = { ...prev, [name]: value };
            if (name === 'paymentMethodId') {
                next.cvv = '';
            }
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const payload = {
                shippingAddress: form.shippingAddress,
                shippingDepartment: form.shippingDepartment,
                shippingCity: form.shippingCity,
                paymentMethodId: form.paymentMethodId || null,
            };

            if (form.paymentMethodId) {
                payload.cvv = form.cvv;
            } else {
                payload.cvv = form.cvv;
                payload.cardNumber = form.cardNumber.replace(/\s+/g, '');
                payload.expiryMonth = Number(form.expiryMonth);
                payload.expiryYear = Number(form.expiryYear);
                payload.docType = form.docType;
                payload.docNumber = form.docNumber;
            }

            const data = await checkoutService.checkout(payload);

            if (data.status === 'DECLINED') {
                setError('El pago fue rechazado. Verifica los datos de tu tarjeta o intenta con otro método de pago.');
                return;
            }

            setResult(data);

            if (form.saveCard && !form.paymentMethodId) {
                try {
                    await paymentMethodService.save({
                        cardNumber: form.cardNumber.replace(/\s+/g, ''),
                        cvc: form.cvv,
                        expiryMonth: Number(form.expiryMonth),
                        expiryYear: Number(form.expiryYear),
                        docType: form.docType,
                        docNumber: form.docNumber,
                        setDefault: true,
                    });
                } catch {
                    // guardar tarjeta no critico
                }
            }

            await cartService.clearCart();
            onSuccess?.(data);
        } catch (err) {
            const serverMsg = err.response?.data?.message || err.response?.data?.error;
            if (serverMsg && serverMsg.includes('pago no fue aprobado')) {
                setError('El pago fue rechazado. Verifica los datos de tu tarjeta o intenta con otro método de pago.');
            } else {
                setError(serverMsg || 'No se pudo procesar el checkout');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (result) {
        return (
            <div className="checkout">
                <div className="checkout__container">
                    <div className="checkout__success">
                        <div className="checkout__success-icon">✓</div>
                        <h2 className="checkout__success-title">Compra realizada</h2>
                        <p className="checkout__success-text">Tu orden fue creada correctamente.</p>

                        <div className="checkout__success-details">
                            <div className="checkout__success-row">
                                <span>Numero de orden</span>
                                <strong>{result.orderId}</strong>
                            </div>
                            <div className="checkout__success-row">
                                <span>Factura</span>
                                <strong>{result.invoice}</strong>
                            </div>
                            <div className="checkout__success-row">
                                <span>Estado</span>
                                <strong>{result.status}</strong>
                            </div>
                            <div className="checkout__success-row">
                                <span>Total</span>
                                <strong>{formatPrice(result.totalAmount)}</strong>
                            </div>
                        </div>

                        <button type="button" className="checkout__back" onClick={onBack}>
                            Volver a la tienda
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout">
            <div className="checkout__container">
                <button type="button" className="checkout__back" onClick={onBack}>
                    ← Volver al carrito
                </button>

                <h1 className="checkout__title">Finalizar Compra</h1>

                {loading ? (
                    <div className="checkout__loading">Cargando checkout...</div>
                ) : (
                    <form className="checkout__form" onSubmit={handleSubmit}>

                        <div className="checkout__summary">
                            <span>Total a pagar</span>
                            <strong>{formatPrice(cart?.total)}</strong>
                            <small>{cart?.itemCount} articulos</small>
                        </div>

                        <section className="checkout__section">
                            <h2 className="checkout__section-title">Direccion de envio</h2>
                            <div className="checkout__field">
                                <label htmlFor="checkout-address">Direccion *</label>
                                <input
                                    id="checkout-address"
                                    name="shippingAddress"
                                    type="text"
                                    value={form.shippingAddress}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ej: Calle 123 #45-67"
                                />
                            </div>
                            <div className="checkout__row">
                                <div className="checkout__field">
                                    <label htmlFor="checkout-department">Departamento *</label>
                                    <select
                                        id="checkout-department"
                                        name="shippingDepartment"
                                        value={form.shippingDepartment}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Seleccionar</option>
                                        {DEPARTMENTS.map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="checkout__field">
                                    <label htmlFor="checkout-city">Ciudad *</label>
                                    <input
                                        id="checkout-city"
                                        name="shippingCity"
                                        type="text"
                                        value={form.shippingCity}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ej: Medellin"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="checkout__section">
                            <h2 className="checkout__section-title">Metodo de pago</h2>

                            {paymentMethods.length > 0 && (
                                <div className="checkout__saved-methods">
                                    {paymentMethods.map((method) => (
                                        <label key={method.id} className="checkout__method-option">
                                            <input
                                                type="radio"
                                                name="paymentMethodId"
                                                value={method.id}
                                                checked={form.paymentMethodId === method.id}
                                                onChange={handleChange}
                                            />
                                            <span>
                                                {method.brand} •••• {method.last4}
                                                {method.default ? ' (Predeterminada)' : ''}
                                            </span>
                                        </label>
                                    ))}
                                    <label className="checkout__method-option">
                                        <input
                                            type="radio"
                                            name="paymentMethodId"
                                            value=""
                                            checked={!form.paymentMethodId}
                                            onChange={handleChange}
                                        />
                                        <span>Usar tarjeta nueva</span>
                                    </label>
                                </div>
                            )}

                            {form.paymentMethodId && (
                                <div className="checkout__saved-cvv">
                                    <div className="checkout__field">
                                        <label htmlFor="checkout-saved-cvv">CVV de la tarjeta seleccionada *</label>
                                        <input
                                            id="checkout-saved-cvv"
                                            name="cvv"
                                            type="text"
                                            inputMode="numeric"
                                            value={form.cvv}
                                            onChange={handleChange}
                                            required
                                            placeholder="123"
                                            maxLength={4}
                                        />
                                    </div>
                                </div>
                            )}

                            {!form.paymentMethodId && (
                                <div className="checkout__new-card">
                                    <div className="checkout__field">
                                        <label htmlFor="checkout-card">Numero de tarjeta *</label>
                                        <input
                                            id="checkout-card"
                                            name="cardNumber"
                                            type="text"
                                            inputMode="numeric"
                                            value={form.cardNumber}
                                            onChange={handleChange}
                                            required
                                            placeholder="4575 6231 8229 0326"
                                        />
                                    </div>
                                    <div className="checkout__row">
                                        <div className="checkout__field">
                                            <label htmlFor="checkout-cvv">CVV *</label>
                                            <input
                                                id="checkout-cvv"
                                                name="cvv"
                                                type="text"
                                                inputMode="numeric"
                                                value={form.cvv}
                                                onChange={handleChange}
                                                required
                                                placeholder="123"
                                                maxLength={4}
                                            />
                                        </div>
                                        <div className="checkout__field">
                                            <label htmlFor="checkout-exp-month">Mes *</label>
                                            <input
                                                id="checkout-exp-month"
                                                name="expiryMonth"
                                                type="number"
                                                min="1"
                                                max="12"
                                                value={form.expiryMonth}
                                                onChange={handleChange}
                                                required
                                                placeholder="12"
                                            />
                                        </div>
                                        <div className="checkout__field">
                                            <label htmlFor="checkout-exp-year">Ano *</label>
                                            <input
                                                id="checkout-exp-year"
                                                name="expiryYear"
                                                type="number"
                                                min="2026"
                                                value={form.expiryYear}
                                                onChange={handleChange}
                                                required
                                                placeholder="2027"
                                            />
                                        </div>
                                    </div>
                                    <div className="checkout__row">
                                        <div className="checkout__field">
                                            <label htmlFor="checkout-doc-type">Tipo doc. *</label>
                                            <select
                                                id="checkout-doc-type"
                                                name="docType"
                                                value={form.docType}
                                                onChange={handleChange}
                                                required
                                            >
                                                {DNI_TYPES.map((t) => (
                                                    <option key={t.value} value={t.value}>{t.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="checkout__field">
                                            <label htmlFor="checkout-doc-number">Numero doc. *</label>
                                            <input
                                                id="checkout-doc-number"
                                                name="docNumber"
                                                type="text"
                                                value={form.docNumber}
                                                onChange={handleChange}
                                                required
                                                placeholder="1234567890"
                                            />
                                        </div>
                                    </div>
                                    <label className="checkout__save-card">
                                        <input
                                            type="checkbox"
                                            name="saveCard"
                                            checked={form.saveCard}
                                            onChange={(e) => setForm({ ...form, saveCard: e.target.checked })}
                                        />
                                        Guardar esta tarjeta para futuras compras
                                    </label>
                                </div>
                            )}
                        </section>

                        {error && <p className="checkout__error">{error}</p>}

                        <button
                            type="submit"
                            className="checkout__submit"
                            disabled={submitting || !cart?.items?.length}
                        >
                            {submitting ? 'Procesando pago...' : 'Pagar ahora'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Checkout;