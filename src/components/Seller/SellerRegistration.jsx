import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { sellerService } from '../../services/seller.service';
import { BANKS, ACCOUNT_TYPES, DNI_TYPES } from '../../constants/colombia';
import { LOCATION_ERROR_CODES } from '../../constants/errorCodes';
import { parseApiError } from '../../helpers/api.helpers';
import DepartmentCitySelect from '../shared/DepartmentCitySelect';
import './SellerRegistration.css';

function SellerRegistration({ onBack, onSellerRegistered }) {
    const { auth, updateToken, updateUser } = useAuth();
    const [form, setForm] = useState({
        typeTrade: 'NATURAL',
        typeDni: auth?.dniType || 'CC',
        dniNumber: auth?.dniNumber || '',
        tradeName: '',
        fullname: `${auth?.firstName || ''} ${auth?.lastName || ''}`.trim(),
        email: auth?.email || '',
        phoneNumber: auth?.phoneNumber || '',
        tradeAddress: auth?.address || '',
        tradeDepartment: auth?.department || '',
        tradeCity: auth?.city || '',
        bankName: '',
        typeBankAccount: 'SAVINGS',
        numberAccount: '',
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    // Si el usuario ya es vendedor, la verificación vive en /seller/verification
    useEffect(() => {
        if (!auth?.userId) return;
        let cancelled = false;

        async function checkSeller() {
            if (auth.sellerId) {
                const existing = await sellerService.getById(auth.sellerId).catch(() => null);
                if (!cancelled && existing) {
                    localStorage.setItem('sellerId', existing.id);
                    onSellerRegistered?.(existing.id);
                    return;
                }
            }
        }

        checkSeller();
        return () => { cancelled = true; };
    }, [auth?.userId, auth?.firstName, auth?.lastName, auth?.sellerId, onSellerRegistered]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleDepartmentChange = (value) => {
        setForm((prev) => ({ ...prev, tradeDepartment: value, tradeCity: '' }));
        setFieldErrors((prev) => ({ ...prev, tradeDepartment: '', tradeCity: '' }));
    };

    const handleCityChange = (value) => {
        setForm((prev) => ({ ...prev, tradeCity: value }));
        setFieldErrors((prev) => ({ ...prev, tradeCity: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setFieldErrors({});
        try {
            const result = await sellerService.create(form);
            let updatedAuth = null;
            if (result.token) {
                updatedAuth = updateToken(result);
            }
            const newSellerId = updatedAuth?.sellerId || result.sellerId || result.id || result.user?.id;
            if (newSellerId) {
                localStorage.setItem('sellerId', newSellerId);
                updateUser({ sellerId: newSellerId });
            }
            // Redirige al flujo de verificación de identidad
            if (newSellerId) {
                onSellerRegistered?.(newSellerId);
            }
        } catch (err) {
            const { error, code, fieldErrors: fe } = parseApiError(err);

            if (code === LOCATION_ERROR_CODES.SELLER_INVALID_TRADE_DEPARTMENT) {
                setFieldErrors({ tradeDepartment: error || 'Departamento invalido' });
            } else if (code === LOCATION_ERROR_CODES.SELLER_INVALID_TRADE_CITY) {
                setFieldErrors({ tradeCity: error || 'Ciudad invalida' });
            } else if (code === 'VALIDATION_FAILED' && fe) {
                setFieldErrors(fe);
                setError(Object.values(fe).join(', '));
            } else {
                setError(error || 'No se pudo registrar el vendedor');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="seller-reg">
            <div className="seller-reg__container">
                <button type="button" className="seller-reg__back" onClick={onBack}>
                    ← Volver
                </button>

                <h1 className="seller-reg__title">Registrarme como Vendedor</h1>

                {error && <p className="seller-reg__error">{error}</p>}

                <form className="seller-reg__form" onSubmit={handleSubmit}>
                    <div className="seller-reg__row">
                        <div className="seller-reg__field">
                            <label htmlFor="sr-type-trade">Tipo de comercio *</label>
                            <select id="sr-type-trade" name="typeTrade" value={form.typeTrade} onChange={handleChange} required>
                                <option value="NATURAL">Natural</option>
                                <option value="LEGAL">Legal</option>
                            </select>
                        </div>
                        <div className="seller-reg__field">
                            <label htmlFor="sr-type-dni">Tipo de documento *</label>
                            <select id="sr-type-dni" name="typeDni" value={form.typeDni} onChange={handleChange} required>
                                {DNI_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="seller-reg__field">
                        <label htmlFor="sr-dni">Numero de documento *</label>
                        <input
                            id="sr-dni"
                            name="dniNumber"
                            type="text"
                            value={form.dniNumber}
                            onChange={handleChange}
                            required
                            minLength={5}
                        />
                    </div>

                    <div className="seller-reg__row">
                        <div className="seller-reg__field">
                            <label htmlFor="sr-trade-name">Nombre comercial *</label>
                            <input
                                id="sr-trade-name"
                                name="tradeName"
                                type="text"
                                value={form.tradeName}
                                onChange={handleChange}
                                required
                                minLength={2}
                            />
                        </div>
                        <div className="seller-reg__field">
                            <label htmlFor="sr-fullname">Nombre completo *</label>
                            <input
                                id="sr-fullname"
                                name="fullname"
                                type="text"
                                value={form.fullname}
                                onChange={handleChange}
                                required
                                minLength={2}
                            />
                        </div>
                    </div>

                    <div className="seller-reg__row">
                        <div className="seller-reg__field">
                            <label htmlFor="sr-email">Email *</label>
                            <input
                                id="sr-email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="seller-reg__field">
                            <label htmlFor="sr-phone">Telefono *</label>
                            <input
                                id="sr-phone"
                                name="phoneNumber"
                                type="tel"
                                value={form.phoneNumber}
                                onChange={handleChange}
                                required
                                pattern="3[0-9]{9}"
                                placeholder="3001234567"
                            />
                        </div>
                    </div>

                    <div className="seller-reg__field">
                        <label htmlFor="sr-address">Direccion del comercio *</label>
                        <input
                            id="sr-address"
                            name="tradeAddress"
                            type="text"
                            value={form.tradeAddress}
                            onChange={handleChange}
                            required
                            minLength={5}
                        />
                    </div>

                    <DepartmentCitySelect
                        departmentValue={form.tradeDepartment}
                        cityValue={form.tradeCity}
                        onDepartmentChange={handleDepartmentChange}
                        onCityChange={handleCityChange}
                        departmentLabel="Departamento del comercio"
                        cityLabel="Ciudad del comercio"
                        departmentId="sr"
                        required
                        departmentError={fieldErrors.tradeDepartment || ''}
                        cityError={fieldErrors.tradeCity || ''}
                    />

                    <div className="seller-reg__row">
                        <div className="seller-reg__field">
                            <label htmlFor="sr-bank">Banco *</label>
                            <select id="sr-bank" name="bankName" value={form.bankName} onChange={handleChange} required>
                                <option value="">Seleccionar</option>
                                {BANKS.map((b) => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                        </div>
                        <div className="seller-reg__field">
                            <label htmlFor="sr-account-type">Tipo de cuenta *</label>
                            <select id="sr-account-type" name="typeBankAccount" value={form.typeBankAccount} onChange={handleChange} required>
                                {ACCOUNT_TYPES.map((a) => (
                                    <option key={a.value} value={a.value}>{a.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="seller-reg__field">
                        <label htmlFor="sr-account">Numero de cuenta *</label>
                        <input
                            id="sr-account"
                            name="numberAccount"
                            type="text"
                            value={form.numberAccount}
                            onChange={handleChange}
                            required
                            minLength={10}
                        />
                    </div>

                    <button type="submit" className="seller-reg__submit" disabled={submitting}>
                        {submitting ? 'Registrando...' : 'Registrar vendedor'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SellerRegistration;