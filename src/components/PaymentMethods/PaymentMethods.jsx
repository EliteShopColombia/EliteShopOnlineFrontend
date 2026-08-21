import { useState, useEffect } from 'react';
import { paymentMethodService } from '../../services/payment-method.service';
import { DNI_TYPES } from '../../constants/colombia';
import './PaymentMethods.css';

function PaymentMethods() {
    const [methods, setMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        cardNumber: '',
        cvc: '',
        expiryMonth: '',
        expiryYear: '',
        docType: 'CC',
        docNumber: '',
        setDefault: false,
    });

    useEffect(() => {
        let cancelled = false;

        async function load() {
            const data = await paymentMethodService.getAll().catch(() => []);
            if (!cancelled) {
                setMethods(Array.isArray(data) ? data : []);
                setLoading(false);
            }
        }

        load();
        return () => { cancelled = true; };
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const saved = await paymentMethodService.save({
                cardNumber: form.cardNumber.replace(/\s+/g, ''),
                cvc: form.cvc,
                expiryMonth: Number(form.expiryMonth),
                expiryYear: Number(form.expiryYear),
                docType: form.docType,
                docNumber: form.docNumber,
                setDefault: form.setDefault,
            });
            setMethods((prev) => [
                ...prev.filter((m) => !m.default),
                saved,
            ]);
            setShowForm(false);
            setForm({
                cardNumber: '',
                cvc: '',
                expiryMonth: '',
                expiryYear: '',
                docType: 'CC',
                docNumber: '',
                setDefault: false,
            });
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo guardar la tarjeta');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        setError('');
        try {
            await paymentMethodService.delete(id);
            setMethods((prev) => prev.filter((m) => m.id !== id));
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo eliminar la tarjeta');
        }
    };

    const handleSetDefault = async (id) => {
        setError('');
        try {
            await paymentMethodService.setDefault(id);
            setMethods((prev) => prev.map((m) => ({ ...m, default: m.id === id })));
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo establecer como predeterminada');
        }
    };

    if (loading) {
        return <div className="payment-methods__loading">Cargando metodos de pago...</div>;
    }

    return (
        <div className="payment-methods">
            {error && <p className="payment-methods__error">{error}</p>}

            <div className="payment-methods__header">
                <h3 className="payment-methods__title">Mis Metodos de Pago</h3>
                <button
                    type="button"
                    className="payment-methods__add"
                    onClick={() => setShowForm((prev) => !prev)}
                >
                    {showForm ? 'Cancelar' : '+ Agregar tarjeta'}
                </button>
            </div>

            {showForm && (
                <form className="payment-methods__form" onSubmit={handleSave}>
                    <div className="payment-methods__field">
                        <label htmlFor="pm-card">Numero de tarjeta *</label>
                        <input
                            id="pm-card"
                            name="cardNumber"
                            type="text"
                            inputMode="numeric"
                            value={form.cardNumber}
                            onChange={handleChange}
                            required
                            placeholder="4575 6231 8229 0326"
                        />
                    </div>
                    <div className="payment-methods__row">
                        <div className="payment-methods__field">
                            <label htmlFor="pm-cvc">CVC *</label>
                            <input
                                id="pm-cvc"
                                name="cvc"
                                type="text"
                                inputMode="numeric"
                                value={form.cvc}
                                onChange={handleChange}
                                required
                                placeholder="123"
                                maxLength={4}
                            />
                        </div>
                        <div className="payment-methods__field">
                            <label htmlFor="pm-month">Mes *</label>
                            <input
                                id="pm-month"
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
                        <div className="payment-methods__field">
                            <label htmlFor="pm-year">Ano *</label>
                            <input
                                id="pm-year"
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
                    <div className="payment-methods__row">
                        <div className="payment-methods__field">
                            <label htmlFor="pm-doc-type">Tipo doc. *</label>
                            <select
                                id="pm-doc-type"
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
                        <div className="payment-methods__field">
                            <label htmlFor="pm-doc-number">Numero doc. *</label>
                            <input
                                id="pm-doc-number"
                                name="docNumber"
                                type="text"
                                value={form.docNumber}
                                onChange={handleChange}
                                required
                                placeholder="1234567890"
                            />
                        </div>
                    </div>
                    <label className="payment-methods__default">
                        <input
                            type="checkbox"
                            name="setDefault"
                            checked={form.setDefault}
                            onChange={(e) => setForm({ ...form, setDefault: e.target.checked })}
                        />
                        Establecer como predeterminada
                    </label>

                    <button type="submit" className="payment-methods__save" disabled={saving}>
                        {saving ? 'Guardando...' : 'Guardar tarjeta'}
                    </button>
                </form>
            )}

            {methods.length === 0 && !showForm && (
                <p className="payment-methods__empty">No tienes tarjetas guardadas.</p>
            )}

            <div className="payment-methods__list">
                {methods.map((method) => (
                    <div className="payment-methods__card" key={method.id}>
                        <div className="payment-methods__card-info">
                            <span className="payment-methods__brand">
                                {method.brand || 'TARJETA'}
                            </span>
                            <span className="payment-methods__last4">•••• {method.last4}</span>
                            <span className="payment-methods__expiry">
                                {method.expiryMonth}/{method.expiryYear}
                            </span>
                            {method.default && (
                                <span className="payment-methods__badge">Predeterminada</span>
                            )}
                        </div>
                        <div className="payment-methods__actions">
                            {!method.default && (
                                <button
                                    type="button"
                                    className="payment-methods__action"
                                    onClick={() => handleSetDefault(method.id)}
                                >
                                    Hacer predeterminada
                                </button>
                            )}
                            <button
                                type="button"
                                className="payment-methods__action payment-methods__action--danger"
                                onClick={() => handleDelete(method.id)}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PaymentMethods;