import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const showLogout = isAuthenticated && location.pathname.startsWith('/admin');

  return (
    <header className="app-header">
      <nav className="app-nav">
        <Link to="/" className="app-logo">
          <img src="/logoTricolo.png" alt="Tricolo" className="app-logo__img" />
          <span className="app-logo__text">Tricolo</span>
        </Link>
        <div className="app-nav__links">
          <Link to="/">Dashboard</Link>
          <Link to="/admin">Admin</Link>
        </div>
        {showLogout && (
          <button type="button" onClick={logout} className="app-nav__logout">
            Se déconnecter
          </button>
        )}
      </nav>
    </header>
  );
}
