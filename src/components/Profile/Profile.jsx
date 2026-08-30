import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { customerService } from '../../services/customer.service';
import { sellerService } from '../../services/seller.service';
import { DNI_TYPES } from '../../constants/colombia';
import { LOCATION_ERROR_CODES } from '../../constants/errorCodes';
import DepartmentCitySelect from '../shared/DepartmentCitySelect';
import PaymentMethods from '../PaymentMethods/PaymentMethods.jsx';
import BuyerOrders from '../Orders/BuyerOrders.jsx';
import SellerOrders from '../Seller/SellerOrders.jsx';
import SellerDashboard from '../Seller/SellerDashboard.jsx';
import { parseApiError } from '../../helpers/api.helpers';
import { useAvatar } from '../../hooks/useAvatar';
import './Profile.css';

function displayName(firstName, lastName) {
    if (!firstName && !lastName) return '';
    if (!lastName) return firstName;
    if (!firstName) return lastName;
    if (firstName === lastName) return firstName;
    return `${firstName} ${lastName}`;
}

function Profile({ onBack }) {
    const { auth, updateUser, logout } = useAuth();
    const mountedRef = useRef(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [sellerData, setSellerData] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [hasAvatar, setHasAvatar] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [avatarError, setAvatarError] = useState('');
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        dniType: '',
        dniNumber: '',
        address: '',
        department: '',
        city: '',
    });
    const [fieldErrors, setFieldErrors] = useState({});

    const isSeller = Boolean(auth?.sellerId);

    const { avatarBlobUrl, refresh: refreshAvatar } = useAvatar(
        isSeller ? auth.sellerId : auth.userId,
        isSeller,
        hasAvatar
    );

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    useEffect(() => {
        if (!auth?.userId) return;

        if (isSeller) {
            async function loadSeller() {
                const seller = await sellerService.getById(auth.sellerId).catch(() => null);

                if (seller && mountedRef.current) {
                    localStorage.setItem('sellerId', seller.id);
                    setSellerData(seller);
                    setHasAvatar(Boolean(seller.profileImage));
                    sellerService.getContact(seller.id).then((contact) => {
                        if (mountedRef.current) setSellerData((prev) => ({ ...prev, contact }));
                    }).catch(() => {});
                    sellerService.getBankInfo(seller.id).then((bank) => {
                        if (mountedRef.current) setSellerData((prev) => ({ ...prev, bank }));
                    }).catch(() => {});
                }
            }

            loadSeller();
            return;
        }

        customerService.getById(auth.userId).then((data) => {
            if (mountedRef.current) {
                updateUser(data);
                setHasAvatar(Boolean(data.profileImage));
                setForm({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    phoneNumber: data.phoneNumber || '',
                    dniType: data.dniType || '',
                    dniNumber: data.dniNumber || '',
                    address: data.address || '',
                    department: data.department || '',
                    city: data.city || '',
                });
            }
        }).catch((err) => {
            console.error('[Profile] Error loading customer data:', err);
        });
    }, [auth?.userId, auth?.email, auth?.sellerId, auth?.firstName, auth?.lastName, updateUser, isSeller]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleDepartmentChange = (value) => {
        setForm((prev) => ({ ...prev, department: value, city: '' }));
        setFieldErrors((prev) => ({ ...prev, department: '', city: '' }));
    };

    const handleCityChange = (value) => {
        setForm((prev) => ({ ...prev, city: value }));
        setFieldErrors((prev) => ({ ...prev, city: '' }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setFieldErrors({});
        try {
            const updated = await customerService.update(auth.userId, form);
            updateUser(updated);
            setEditing(false);
        } catch (err) {
            const { error, code, fieldErrors: fe } = parseApiError(err);

            if (code === LOCATION_ERROR_CODES.INVALID_LOCATION) {
                setFieldErrors({
                    department: 'Selecciona un departamento valido',
                    city: 'Selecciona una ciudad valida para el departamento',
                });
            } else if (code === 'VALIDATION_FAILED' && fe) {
                setFieldErrors(fe);
                const messages = Object.values(fe).join(', ');
                setError(messages);
            } else {
                setError(error || 'No se pudo actualizar el perfil');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        onBack?.();
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            setAvatarError('Solo se permiten archivos JPG o PNG');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setAvatarError('El archivo no debe superar 5 MB');
            return;
        }

        setUploading(true);
        setAvatarError('');
        try {
            const id = isSeller ? auth.sellerId : auth.userId;
            if (hasAvatar) {
                const service = isSeller ? sellerService : customerService;
                await service.updateAvatar(id, file);
            } else {
                const service = isSeller ? sellerService : customerService;
                await service.uploadAvatar(id, file);
            }
            setHasAvatar(true);
                refreshAvatar();
        } catch (err) {
            const { error } = parseApiError(err);
            setAvatarError(error || 'No se pudo subir el avatar');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleDeleteAvatar = async () => {
        setUploading(true);
        setAvatarError('');
        try {
            const id = isSeller ? auth.sellerId : auth.userId;
            const service = isSeller ? sellerService : customerService;
            await service.deleteAvatar(id);
            setHasAvatar(false);
        } catch (err) {
            const { error } = parseApiError(err);
            setAvatarError(error || 'No se pudo eliminar el avatar');
        } finally {
            setUploading(false);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'purchases':
                return <BuyerOrders />;
            case 'sales':
                return <SellerOrders sellerId={auth.sellerId} onBack={() => setActiveTab('profile')} />;
            case 'dashboard':
                return <SellerDashboard sellerId={auth.sellerId} onBack={() => setActiveTab('profile')} />;
            case 'profile':
            default:
                return (
                    <>
                        {isSeller ? (
                            <div className="profile">
                                <div className="profile__container">
                                    <div className="profile__header">
                                        <div className="profile__avatar-wrapper">
                                            <div className="profile__avatar profile__avatar--seller">
                                                {hasAvatar ? (
                                                    <img src={avatarBlobUrl} alt="Avatar" />
                                                ) : (
                                                    auth?.firstName?.[0]
                                                )}
                                                <label className="profile__avatar-edit">
                                                    <input
                                                        type="file"
                                                        accept="image/jpeg,image/png"
                                                        onChange={handleAvatarUpload}
                                                        disabled={uploading}
                                                        className="profile__avatar-input"
                                                    />
                                                    {uploading ? '...' : (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                                            <circle cx="12" cy="13" r="4" />
                                                        </svg>
                                                    )}
                                                </label>
                                            </div>
                                            {hasAvatar && !uploading && (
                                                <button
                                                    type="button"
                                                    className="profile__avatar-delete"
                                                    onClick={handleDeleteAvatar}
                                                    aria-label="Eliminar avatar"
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <line x1="18" y1="6" x2="6" y2="18" />
                                                        <line x1="6" y1="6" x2="18" y2="18" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                        <h1 className="profile__name">
                                            {displayName(auth?.firstName, auth?.lastName)}
                                        </h1>
                                        <p className="profile__email">{auth?.email}</p>
                                        <span className="profile__badge">Vendedor</span>
                                    </div>

                                    {avatarError && <p className="profile__error">{avatarError}</p>}
                                    {error && <p className="profile__error">{error}</p>}

                                    {sellerData && (
                                        <>
                                            <div className="profile__section">
                                                <h2 className="profile__section-title">Datos del Negocio</h2>
                                                <div className="profile__fields">
                                                    <div className="profile__field">
                                                        <span className="profile__field-label">Nombre Comercial</span>
                                                        <span className="profile__field-value">{sellerData.tradeName || '-'}</span>
                                                    </div>
                                                    <div className="profile__field">
                                                        <span className="profile__field-label">Nombre Completo</span>
                                                        <span className="profile__field-value">{sellerData.fullname || '-'}</span>
                                                    </div>
                                                    <div className="profile__field">
                                                        <span className="profile__field-label">Tipo de Documento</span>
                                                        <span className="profile__field-value">{sellerData.typeDni || '-'}</span>
                                                    </div>
                                                    <div className="profile__field">
                                                        <span className="profile__field-label">Numero de Documento</span>
                                                        <span className="profile__field-value">{sellerData.dniNumber || '-'}</span>
                                                    </div>
                                                    <div className="profile__field">
                                                        <span className="profile__field-label">Tipo de Comercio</span>
                                                        <span className="profile__field-value">{sellerData.typeTrade || '-'}</span>
                                                    </div>
                                                    <div className="profile__field">
                                                        <span className="profile__field-label">Estado</span>
                                                        <span className="profile__field-value">
                                                            {sellerData.isActive ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </div>
                                                    <div className="profile__field">
                                                        <span className="profile__field-label">Verificado</span>
                                                        <span className="profile__field-value">
                                                            {sellerData.isVerified ? 'Si' : 'No'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {sellerData.contact && (
                                                <div className="profile__section">
                                                    <h2 className="profile__section-title">Informacion de Contacto</h2>
                                                    <div className="profile__fields">
                                                        <div className="profile__field">
                                                            <span className="profile__field-label">Telefono</span>
                                                            <span className="profile__field-value">{sellerData.contact.phoneNumber || '-'}</span>
                                                        </div>
                                                        <div className="profile__field">
                                                            <span className="profile__field-label">Direccion</span>
                                                            <span className="profile__field-value">{sellerData.contact.tradeAddress || '-'}</span>
                                                        </div>
                                                        <div className="profile__field">
                                                            <span className="profile__field-label">Departamento</span>
                                                            <span className="profile__field-value">{sellerData.contact.tradeDepartment || '-'}</span>
                                                        </div>
                                                        <div className="profile__field">
                                                            <span className="profile__field-label">Ciudad</span>
                                                            <span className="profile__field-value">{sellerData.contact.tradeCity || '-'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {sellerData.bank && (
                                                <div className="profile__section">
                                                    <h2 className="profile__section-title">Datos Bancarios</h2>
                                                    <div className="profile__fields">
                                                        <div className="profile__field">
                                                            <span className="profile__field-label">Banco</span>
                                                            <span className="profile__field-value">{sellerData.bank.bankName || '-'}</span>
                                                        </div>
                                                        <div className="profile__field">
                                                            <span className="profile__field-label">Tipo de Cuenta</span>
                                                            <span className="profile__field-value">{sellerData.bank.typeBankAccount || '-'}</span>
                                                        </div>
                                                        <div className="profile__field">
                                                            <span className="profile__field-label">Numero de Cuenta</span>
                                                            <span className="profile__field-value">{sellerData.bank.numberAccount || '-'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    <div className="profile__section">
                                        <PaymentMethods />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="profile">
                                <div className="profile__container">

                                    <div className="profile__header">
                                        <div className="profile__avatar-wrapper">
                                            <div className="profile__avatar">
                                                {hasAvatar ? (
                                                    <img src={avatarBlobUrl} alt="Avatar" />
                                                ) : (
                                                    <>{auth?.firstName?.[0]}{auth?.lastName?.[0]}</>
                                                )}
                                                <label className="profile__avatar-edit">
                                                    <input
                                                        type="file"
                                                        accept="image/jpeg,image/png"
                                                        onChange={handleAvatarUpload}
                                                        disabled={uploading}
                                                        className="profile__avatar-input"
                                                    />
                                                    {uploading ? '...' : (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                                            <circle cx="12" cy="13" r="4" />
                                                        </svg>
                                                    )}
                                                </label>
                                            </div>
                                            {hasAvatar && !uploading && (
                                                <button
                                                    type="button"
                                                    className="profile__avatar-delete"
                                                    onClick={handleDeleteAvatar}
                                                    aria-label="Eliminar avatar"
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <line x1="18" y1="6" x2="6" y2="18" />
                                                        <line x1="6" y1="6" x2="18" y2="18" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                        <h1 className="profile__name">
                                            {auth?.firstName} {auth?.lastName}
                                        </h1>
                                        <p className="profile__email">{auth?.email}</p>
                                    </div>

                                    {avatarError && <p className="profile__error">{avatarError}</p>}
                                    {error && <p className="profile__error">{error}</p>}

                                    <div className="profile__section">
                                        <h2 className="profile__section-title">Informacion Personal</h2>

                                        {editing ? (
                                            <form className="profile__form" onSubmit={handleSave}>
                                                <div className="profile__row">
                                                    <div className="profile__field">
                                                        <label htmlFor="pf-firstName">Nombre *</label>
                                                        <input
                                                            id="pf-firstName"
                                                            name="firstName"
                                                            type="text"
                                                            value={form.firstName}
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="profile__field">
                                                        <label htmlFor="pf-lastName">Apellido *</label>
                                                        <input
                                                            id="pf-lastName"
                                                            name="lastName"
                                                            type="text"
                                                            value={form.lastName}
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="profile__field">
                                                    <label htmlFor="pf-phone">Telefono *</label>
                                                    <input
                                                        id="pf-phone"
                                                        name="phoneNumber"
                                                        type="tel"
                                                        value={form.phoneNumber}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="profile__row">
                                                    <div className="profile__field">
                                                        <label htmlFor="pf-dniType">Tipo de documento *</label>
                                                        <select
                                                            id="pf-dniType"
                                                            name="dniType"
                                                            value={form.dniType}
                                                            onChange={handleChange}
                                                            required
                                                        >
                                                            {DNI_TYPES.map((t) => (
                                                                <option key={t.value} value={t.value}>{t.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="profile__field">
                                                        <label htmlFor="pf-dniNumber">Numero de documento *</label>
                                                        <input
                                                            id="pf-dniNumber"
                                                            name="dniNumber"
                                                            type="text"
                                                            value={form.dniNumber}
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="profile__field">
                                                    <label htmlFor="pf-address">Direccion *</label>
                                                    <input
                                                        id="pf-address"
                                                        name="address"
                                                        type="text"
                                                        value={form.address}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <DepartmentCitySelect
                                                    departmentValue={form.department}
                                                    cityValue={form.city}
                                                    onDepartmentChange={handleDepartmentChange}
                                                    onCityChange={handleCityChange}
                                                    departmentId="pf"
                                                    required
                                                    departmentError={fieldErrors.department || ''}
                                                    cityError={fieldErrors.city || ''}
                                                />

                                                <div className="profile__form-actions">
                                                    <button type="submit" className="profile__btn profile__btn--primary" disabled={saving}>
                                                        {saving ? 'Guardando...' : 'Guardar cambios'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="profile__btn profile__btn--secondary"
                                                        onClick={() => setEditing(false)}
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <>
                                                <div className="profile__fields">
                                                    <div className="profile__field">
                                                        <span className="profile__field-label">Nombre</span>
                                                        <span className="profile__field-value">{auth?.firstName || '-'}</span>
                                                    </div>
                                                    <div className="profile__field">
                                                        <span className="profile__field-label">Apellido</span>
                                                        <span className="profile__field-value">{auth?.lastName || '-'}</span>
                                                    </div>
                                                    <div className="profile__field">
                                                        <span className="profile__field-label">Email</span>
                                                        <span className="profile__field-value">{auth?.email || '-'}</span>
                                                    </div>
                                                    <div className="profile__field">
                                                        <span className="profile__field-label">Telefono</span>
                                                        <span className="profile__field-value">{auth?.phoneNumber || '-'}</span>
                                                    </div>
                                                    <div className="profile__field">
                                                        <span className="profile__field-label">Direccion</span>
                                                        <span className="profile__field-value">{auth?.address || '-'}</span>
                                                    </div>
                                                    <div className="profile__field">
                                                        <span className="profile__field-label">Ciudad</span>
                                                        <span className="profile__field-value">{auth?.city || '-'}</span>
                                                    </div>
                                                    <div className="profile__field">
                                                        <span className="profile__field-label">Departamento</span>
                                                        <span className="profile__field-value">{auth?.department || '-'}</span>
                                                    </div>
                                                    <div className="profile__field">
                                                        <span className="profile__field-label">Tipo de Documento</span>
                                                        <span className="profile__field-value">{auth?.dniType || '-'}</span>
                                                    </div>
                                                    <div className="profile__field">
                                                        <span className="profile__field-label">Numero de Documento</span>
                                                        <span className="profile__field-value">{auth?.dniNumber || '-'}</span>
                                                    </div>
                                                </div>

                                                <div className="profile__actions">
                                                    <button
                                                        type="button"
                                                        className="profile__btn profile__btn--secondary"
                                                        onClick={() => setEditing(true)}
                                                    >
                                                        Editar Perfil
                                                    </button>
                                                    <button type="button" className="profile__btn profile__btn--danger" onClick={handleLogout}>
                                                        Cerrar Sesion
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="profile__section">
                                        <PaymentMethods />
                                    </div>

                                </div>
                            </div>
                        )}
                    </>
                );
        }
    };

    return (
        <div className="profile-page">
            <button type="button" className="profile__back" onClick={onBack}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                </svg>
                Volver a la tienda
            </button>

            {renderTabContent()}
        </div>
    );
}

export default Profile;