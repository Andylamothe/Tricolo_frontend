import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import '../styles/admin.css';

const FULL_THRESHOLD = 90;

const BIN_DEFINITIONS = [
  { id: 1, category: 'recyclage', name: 'Bac Recyclage', level: 65, color: 'green' },
  { id: 2, category: 'compost', name: 'Bac Compost', level: 82, color: 'orange' },
  { id: 3, category: 'poubelle', name: 'Bac Déchets', level: 95, color: 'purple' },
  { id: 4, category: 'autre', name: 'Bac Autres Déchets', level: 55, color: 'yellow' },
];

function buildDefaultBins() {
  return BIN_DEFINITIONS.map((bin) => {
    const isFull = bin.level >= FULL_THRESHOLD;

    return {
      ...bin,
      isFull,
      status: isFull ? 'Ce bac là est plein' : 'Bac disponible',
      statusLabel: isFull ? 'Plein' : 'Disponible',
      percent: `${bin.level}%`,
    };
  });
}

function latestNotificationsByCategory(notifications) {
  return (Array.isArray(notifications) ? notifications : []).reduce((acc, notification) => {
    const category = notification?.categoriePoubelle;
    if (!category) {
      return acc;
    }

    acc[category] = notification;
    return acc;
  }, {});
}

function mergeNotificationState(bins, notifications) {
  const notificationsByCategory = latestNotificationsByCategory(notifications);

  return bins.map((bin) => {
    const notification = notificationsByCategory[bin.category];
    if (!notification || typeof notification.isFull !== 'boolean') {
      return bin;
    }

    const isFull = notification.isFull;

    return {
      ...bin,
      isFull,
      status: isFull ? 'Ce bac là est plein' : 'Bac disponible',
      statusLabel: isFull ? 'Plein' : 'Disponible',
      level: isFull ? Math.max(bin.level, FULL_THRESHOLD) : 0,
      percent: isFull ? `${Math.max(bin.level, FULL_THRESHOLD)}%` : '0%',
    };
  });
}

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

      </div>
    </div>
  );
}

function AdminBinsList() {
  const [bins, setBins] = useState(() => buildDefaultBins());
  const [loading, setLoading] = useState(true);
  const [pendingCategory, setPendingCategory] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const notifications = await api.getAllNotifs();
        if (!isMounted) {
          return;
        }

        setBins((currentBins) => mergeNotificationState(currentBins, notifications));
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  const fullBins = useMemo(() => bins.filter((bin) => bin.isFull), [bins]);

  const handleEmptyBin = async (bin) => {
    setPendingCategory(bin.category);
    setFeedback(`Le ${bin.name.toLowerCase()} a été vidé.`);

    setBins((currentBins) =>
      currentBins.map((currentBin) =>
        currentBin.category === bin.category
          ? {
              ...currentBin,
              level: 0,
              isFull: false,
              status: 'Bac disponible',
              statusLabel: 'Disponible',
              percent: '0%',
            }
          : currentBin
      )
    );

    try {
      await api.updateNotif(bin.category, {
        categoriePoubelle: bin.category,
        isFull: false,
        notifIsSent: true,
      });
    } catch (error) {
      console.error(`Impossible de mettre à jour la notification pour ${bin.category}:`, error);
    } finally {
      setPendingCategory(null);
    }
  };

  return (
    <main className="admin-bins">
      <div className="admin-bins__header">
        <h1>Gestion des Poubelles</h1>
        <p>État en temps réel de vos bacs de tri</p>
        <div className="admin-bins__summary" role="status" aria-live="polite">
          {fullBins.length > 0
            ? `${fullBins.length} bac${fullBins.length > 1 ? 's' : ''} en alerte : ${fullBins
                .map((bin) => bin.name)
                .join(', ')}`
            : 'Tous les bacs sont disponibles'}
        </div>
        {feedback && <div className="admin-bins__message">{feedback}</div>}
      </div>

      <section className="admin-bins__grid">
        {bins.map((bin) => (
          <article key={bin.id} className={`bin-card bin-card--${bin.color}`}>
            <div className="bin-card__header">
              <h3 className="bin-card__name">{bin.name}</h3>
              <span
                className={`bin-card__status ${bin.isFull ? 'bin-card__status--full' : 'bin-card__status--available'}`}
              >
                {bin.status}
              </span>
            </div>

            <div className="bin-card__level">
              <span className="bin-card__level-label">Niveau de remplissage</span>
              <div className="bin-card__progress" aria-hidden="true">
                <div
                  className="bin-card__progress-bar"
                  style={{ width: `${Math.min(bin.level, 100)}%` }}
                />
              </div>
              <span className="bin-card__percent">{bin.percent}</span>
            </div>

            {bin.isFull && <div className="bin-card__alert">Action requise : videz ce bac</div>}

            <div className="bin-card__actions">
              <button
                type="button"
                className="bin-card__btn bin-card__btn--danger"
                onClick={() => handleEmptyBin(bin)}
                disabled={loading || pendingCategory === bin.category}
                aria-label={`Vider le ${bin.name}`}
              >
                {pendingCategory === bin.category ? 'Vidage...' : 'Vider cette poubelle'}
              </button>
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
