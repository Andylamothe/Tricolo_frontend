import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import '../styles/admin.css';

const mockBins = [
  { id: 1, name: 'Bac Recyclage', level: 65, status: 'Disponible', color: 'green' },
  { id: 2, name: 'Bac Compost', level: 82, status: 'Presque plein', color: 'orange' },
  { id: 3, name: 'Bac Déchets', level: 95, status: 'Plein', color: 'purple' },
];

function AdminLoginForm() {
  const { login } = useAuth();
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
    } catch (err) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__box">
        <img src="/logoTricolo.png" alt="Tricolo" className="admin-login__logo" />
        <h1 className="admin-login__title">Tricolo Admin</h1>
        <p className="admin-login__subtitle">Connectez-vous pour accéder au panneau d'administration</p>

        <form className="admin-login__form" onSubmit={handleSubmit}>
          <div className="admin-login__icon">🔒</div>

          <div className="admin-login__group">
            <label className="admin-login__label">Nom d'utilisateur</label>
            <input
              type="text"
              name="username"
              className="admin-login__input"
              placeholder="Entrez votre nom d'utilisateur"
              value={form.username}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="admin-login__group">
            <label className="admin-login__label">Mot de passe</label>
            <div className="admin-login__password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="admin-login__input"
                placeholder="Entrez votre mot de passe"
                value={form.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="admin-login__toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                👁️
              </button>
            </div>
          </div>

          {error && <div className="admin-login__error">{error}</div>}

          <button type="submit" className="admin-login__submit" disabled={isLoading}>
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <div className="admin-login__footer">Demo: admin / tricolo2024</div>
      </div>
    </div>
  );
}

function AdminBinsList() {
  return (
    <main className="admin-bins">
      <div className="admin-bins__header">
        <h1>Gestion des Poubelles</h1>
        <p>État en temps réel de vos bacs de tri</p>
      </div>

      <section className="admin-bins__grid">
        {mockBins.map((bin) => (
          <article key={bin.id} className={`bin-card bin-card--${bin.color}`}>
            <div className="bin-card__header">
              <h3 className="bin-card__name">{bin.name}</h3>
              <span className="bin-card__status">{bin.status}</span>
            </div>

            <div className="bin-card__level">
              <span className="bin-card__level-label">Niveau de remplissage</span>
              <div className="bin-card__progress">
                <div
                  className="bin-card__progress-bar"
                  style={{ width: `${bin.level}%` }}
                />
              </div>
              <span className="bin-card__percent">{bin.level}%</span>
            </div>

            <div className="bin-card__actions">
              <button className="bin-card__btn">Détails</button>
              <button className="bin-card__btn">Vider</button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default function AdminPage() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <AdminBinsList /> : <AdminLoginForm />;
}
