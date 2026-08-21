import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { sellerService } from '../../services/seller.service';
import { sellerVerificationService } from '../../services/seller-verification.service';
import { DEPARTMENTS, BANKS, ACCOUNT_TYPES, DNI_TYPES } from '../../constants/colombia';
import './SellerRegistration.css';

function SellerRegistration({ onBack, onSellerRegistered }) {
    const { user, updateToken, updateUser } = useAuth();
    const [form, setForm] = useState({
        typeTrade: 'NATURAL',
        typeDni: user?.dniType || 'CC',
        dniNumber: user?.dniNumber || '',
        tradeName: '',
        fullname: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        tradeAddress: user?.address || '',
        tradeDepartment: user?.department || '',
        tradeCity: user?.city || '',
        bankName: '',
        typeBankAccount: 'SAVINGS',
        numberAccount: '',
    });

    const [sellerId, setSellerId] = useState(null);
    const [verification, setVerification] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState('');
    const [validating, setValidating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const pollingRef = useRef(null);

    const stopPolling = () => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    };

    useEffect(() => {
        return () => stopPolling();
    }, []);

    useEffect(() => {
        if (!user?.id) return;
        let cancelled = false;

        async function checkSeller() {
            const storedSellerId = localStorage.getItem('sellerId');

            if (storedSellerId) {
                const existing = await sellerService.getById(storedSellerId).catch(() => null);
                if (!cancelled && existing) {
                    setSellerId(existing.id);
                    return;
                }
            }

            if (user.sellerId) {
                const existing = await sellerService.getById(user.sellerId).catch(() => null);
                if (!cancelled && existing) {
                    setSellerId(existing.id);
                    localStorage.setItem('sellerId', existing.id);
                    return;
                }
            }

            const byUser = await sellerService.getById(user.id).catch(() => null);
            if (!cancelled && byUser) {
                setSellerId(byUser.id);
                localStorage.setItem('sellerId', byUser.id);
                return;
            }

            const data = await sellerService.getAll().catch(() => []);
            if (cancelled) return;
            const list = Array.isArray(data) ? data : (data?.content || []);
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
            const existing = list.find((s) => s.fullname === fullName);
            if (existing) {
                setSellerId(existing.id);
                localStorage.setItem('sellerId', existing.id);
            }
        }

        checkSeller();
        return () => { cancelled = true; };
    }, [user?.id, user?.firstName, user?.lastName, user?.sellerId]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            const result = await sellerService.create(form);
            if (result.token) {
                updateToken(result);
            }
            const newSellerId = result.id || result.sellerId || result.user?.id;
            setSellerId(newSellerId);
            if (newSellerId) {
                localStorage.setItem('sellerId', newSellerId);
                updateUser({ sellerId: newSellerId });
            }
            setSuccess('Vendedor registrado. Ahora sube tus documentos de verificacion.');
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo registrar el vendedor');
        } finally {
            setSubmitting(false);
        }
    };

    const loadVerification = async (id) => {
        const data = await sellerVerificationService.getStatus(id).catch(() => null);
        if (data) setVerification(data);
    };

    const handleUpload = async (field, file) => {
        if (!sellerId) return;
        setUploading(field);
        setError('');
        try {
            if (field === 'document') {
                await sellerVerificationService.uploadDocument(sellerId, file);
            } else {
                await sellerVerificationService.uploadSelfie(sellerId, file);
            }
            await loadVerification(sellerId);
            setSuccess(field === 'document' ? 'Documento subido correctamente.' : 'Selfie subida correctamente.');
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo subir el archivo');
        } finally {
            setUploading('');
        }
    };

    if (sellerId) {
        return (
            <div className="seller-reg">
                <div className="seller-reg__container">
                    <button type="button" className="seller-reg__back" onClick={onBack}>
                        ← Volver
                    </button>

                    <h1 className="seller-reg__title">Verificacion de Vendedor</h1>

                    {error && <p className="seller-reg__error">{error}</p>}
                    {success && <p className="seller-reg__success">{success}</p>}

                    <div className="seller-reg__status">
                        <span>Estado de verificacion:</span>
                        <strong>{verification?.status || 'NO INICIADA'}</strong>
                    </div>

                    <div className="seller-reg__uploads">
                        <div className="seller-reg__upload">
                            <h3>Documento de identidad</h3>
                            <p>JPG o PNG, maximo 5 MB</p>
                            <input
                                type="file"
                                accept="image/jpeg,image/png"
                                onChange={(e) => e.target.files?.[0] && handleUpload('document', e.target.files[0])}
                                disabled={!!uploading}
                            />
                            {uploading === 'document' && <span className="seller-reg__uploading">Subiendo...</span>}
                        </div>

                        <div className="seller-reg__upload">
                            <h3>Selfie</h3>
                            <p>JPG o PNG, maximo 5 MB</p>
                            <input
                                type="file"
                                accept="image/jpeg,image/png"
                                onChange={(e) => e.target.files?.[0] && handleUpload('selfie', e.target.files[0])}
                                disabled={!!uploading}
                            />
                            {uploading === 'selfie' && <span className="seller-reg__uploading">Subiendo...</span>}
                        </div>
                    </div>

                    <button
                        type="button"
                        className="seller-reg__validate"
                        disabled={validating || !!uploading}
                        onClick={async () => {
                            setError('');
                            setSuccess('');
                            setValidating(true);
                            try {
                                await sellerVerificationService.validate(sellerId);
                                setSuccess('Validacion en proceso. Consultando estado...');
                                pollingRef.current = setInterval(async () => {
                                    try {
                                        const data = await sellerVerificationService.getStatus(sellerId);
                                        setVerification(data);
                                        const s = data?.status;
                                        if (s === 'APPROVED' || s === 'REJECTED' || s === 'VERIFIED' || s === 'FAILED') {
                                            stopPolling();
                                            setValidating(false);
                                            setSuccess(s === 'APPROVED' || s === 'VERIFIED'
                                                ? 'Verificacion aprobada.'
                                                : 'Verificacion rechazada.');
                                        }
                                    } catch {
                                        stopPolling();
                                        setValidating(false);
                                        setError('Error al consultar estado de verificacion.');
                                    }
                                }, 4000);
                            } catch (err) {
                                setError(err.response?.data?.message || 'No se pudo validar la verificacion');
                                setValidating(false);
                            }
                        }}
                    >
                        {validating ? 'Validando...' : 'Enviar para validacion'}
                    </button>

                    <button
                        type="button"
                        className="seller-reg__submit"
                        onClick={() => onSellerRegistered?.(sellerId)}
                    >
                        Ir a mi panel de ventas
                    </button>
                </div>
            </div>
        );
    }

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

                    <div className="seller-reg__row">
                        <div className="seller-reg__field">
                            <label htmlFor="sr-department">Departamento *</label>
                            <select
                                id="sr-department"
                                name="tradeDepartment"
                                value={form.tradeDepartment}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccionar</option>
                                {DEPARTMENTS.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        <div className="seller-reg__field">
                            <label htmlFor="sr-city">Ciudad *</label>
                            <input
                                id="sr-city"
                                name="tradeCity"
                                type="text"
                                value={form.tradeCity}
                                onChange={handleChange}
                                required
                                minLength={2}
                            />
                        </div>
                    </div>

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