import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
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
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
      onSuccess?.();
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.error
        || err.message
        || 'Error al registrar';
      setError(msg);
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

          <div className="auth-modal__row">
            <div className="auth-modal__field">
              <label htmlFor="reg-department">Departamento *</label>
              <input
                id="reg-department"
                name="department"
                type="text"
                value={form.department}
                onChange={handleChange}
                required
                placeholder="Ej: Antioquia"
              />
            </div>
            <div className="auth-modal__field">
              <label htmlFor="reg-city">Ciudad *</label>
              <input
                id="reg-city"
                name="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                required
                placeholder="Ej: Medellin"
              />
            </div>
          </div>

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
