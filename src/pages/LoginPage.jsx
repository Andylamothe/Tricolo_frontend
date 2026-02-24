import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/login.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(form);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <main className="login-page">
      <div className="login-container">
        <div className="login-content">
          <img src="/logoTricolo.png" alt="Tricolo" className="login-logo" />
          <h1 className="login-title">Tricolo Admin</h1>
          <p className="login-subtitle">Connectez-vous pour accéder au panneau d'administration</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form__icon">🔒</div>

            <div className="login-form__group">
              <label className="login-form__label">Nom d'utilisateur</label>
              <input
                type="text"
                name="username"
                className="login-form__input"
                placeholder="Entrez votre nom d'utilisateur"
                value={form.username}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="login-form__group">
              <label className="login-form__label">Mot de passe</label>
              <div className="login-form__password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="login-form__input"
                  placeholder="Entrez votre mot de passe"
                  value={form.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="login-form__toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                  disabled={isLoading}
                >
                  👁️
                </button>
              </div>
            </div>

            {error && <div className="login-form__error">{error}</div>}

            <button type="submit" className="login-form__submit" disabled={isLoading}>
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
            <button type="button" className="login-form__cancel" onClick={handleCancel} disabled={isLoading}>
              Annuler
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
