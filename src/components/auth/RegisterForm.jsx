import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { parseApiError } from '../../helpers/api.helpers';
import { LOCATION_ERROR_CODES } from '../../constants/errorCodes';
import DepartmentCitySelect from '../shared/DepartmentCitySelect';
import './auth.css';

export function RegisterForm({ onSwitchToLogin, onSuccess }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    dniType: '',
    dniNumber: '',
    address: '',
    department: '',
    city: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Filtrar电话: solo digitos, max 10
    if (name === 'phoneNumber') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setForm({ ...form, [name]: digits });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const handleDepartmentChange = (value) => {
    setForm((prev) => ({ ...prev, department: value, city: '' }));
    setFieldErrors((prev) => ({ ...prev, department: '', city: '' }));
  };

  const handleCityChange = (value) => {
    setForm((prev) => ({ ...prev, city: value }));
    setFieldErrors((prev) => ({ ...prev, city: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});
    try {
      await register(form);
      onSuccess?.();
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
        setError(error || 'Error al registrar');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={(e) => e.target === e.currentTarget && onSuccess?.()}>
      <div className="auth-modal auth-modal--register">
        <h2 className="auth-modal__title">Crear Cuenta</h2>

        <form className="auth-modal__form" onSubmit={handleSubmit}>
          <div className="auth-modal__row">
            <div className="auth-modal__field">
              <label htmlFor="reg-firstName">Nombre *</label>
              <input
                id="reg-firstName"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange}
                required
                placeholder="Ej: Juan"
              />
            </div>
            <div className="auth-modal__field">
              <label htmlFor="reg-lastName">Apellido *</label>
              <input
                id="reg-lastName"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                required
                placeholder="Ej: Perez"
              />
            </div>
          </div>

          <div className="auth-modal__field">
            <label htmlFor="reg-email">Email *</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="Ej: juan@email.com"
            />
          </div>

          <div className="auth-modal__field">
            <label htmlFor="reg-phone">Telefono *</label>
            <input
              id="reg-phone"
              name="phoneNumber"
              type="tel"
              value={form.phoneNumber}
              onChange={handleChange}
              required
              placeholder="Ej: 3001234567"
            />
          </div>

          <div className="auth-modal__field">
            <label htmlFor="reg-password">Contrasena *</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
              placeholder="Minimo 8 caracteres"
            />
          </div>

          <div className="auth-modal__row">
            <div className="auth-modal__field">
              <label htmlFor="reg-dniType">Tipo de documento *</label>
              <select
                id="reg-dniType"
                name="dniType"
                value={form.dniType}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar</option>
                <option value="CC">Cedula de Ciudadania</option>
                <option value="CE">Cedula de Extranjeria</option>
                <option value="PS">Pasaporte</option>
                <option value="NIT">NIT</option>
              </select>
            </div>
            <div className="auth-modal__field">
              <label htmlFor="reg-dniNumber">Numero de documento *</label>
              <input
                id="reg-dniNumber"
                name="dniNumber"
                type="text"
                value={form.dniNumber}
                onChange={handleChange}
                required
                placeholder="Ej: 1234567890"
              />
            </div>
          </div>

          <div className="auth-modal__field">
            <label htmlFor="reg-address">Direccion *</label>
            <input
              id="reg-address"
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              required
              placeholder="Ej: Calle 123 #45-67"
            />
          </div>

          <DepartmentCitySelect
            departmentValue={form.department}
            cityValue={form.city}
            onDepartmentChange={handleDepartmentChange}
            onCityChange={handleCityChange}
            departmentId="reg"
            required
            departmentError={fieldErrors.department || ''}
            cityError={fieldErrors.city || ''}
          />

          {error && <p className="auth-modal__error">{error}</p>}

          <button type="submit" className="auth-modal__submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarme'}
          </button>
        </form>

        <p className="auth-modal__switch">
          Ya tienes cuenta?{' '}
          <button type="button" onClick={onSwitchToLogin}>
            Iniciar sesion
          </button>
        </p>
      </div>
    </div>
  );
}
