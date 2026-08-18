import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './auth.css';

export function LoginForm({ onSwitchToRegister, onSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login({ email, password });
      onSuccess?.();
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.error
        || err.message
        || 'Error al iniciar sesion';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={onSwitchToRegister ? (e) => e.target === e.currentTarget && onSuccess?.() : undefined}>
      <div className="auth-modal">
        <h2 className="auth-modal__title">Iniciar Sesion</h2>

        <form className="auth-modal__form" onSubmit={handleSubmit}>
          <div className="auth-modal__field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
            />
          </div>

          <div className="auth-modal__field">
            <label htmlFor="login-password">Contrasena</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Minimo 8 caracteres"
            />
          </div>

          {error && <p className="auth-modal__error">{error}</p>}

          <button type="submit" className="auth-modal__submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar Sesion'}
          </button>
        </form>

        <p className="auth-modal__switch">
          No tienes cuenta?{' '}
          <button type="button" onClick={onSwitchToRegister}>
            Registrarme
          </button>
        </p>
      </div>
    </div>
  );
}
