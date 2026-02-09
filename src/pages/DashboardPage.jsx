import '../styles/dashboard.css';
import { useEffect, useState } from 'react';
import { api } from '../services/api';

const totalStats = {    
  title: 'TOTAL DES DÉCHETS TRIÉS',
  value: '252 000',
  subtitle: 'déchets triés avec succès',
};

const categoryCards = [
  { label: 'RECYCLABLE', value: '100 000', percent: '40%', color: 'green', icon: 'recycling' },
  { label: 'COMPOST', value: '75 000', percent: '30%', color: 'orange', icon: 'compost' },
  { label: 'POUBELLES', value: '45 000', percent: '18%', color: 'purple', icon: 'delete' },
  { label: 'AUTRE (BATTERIES)', value: '32 000', percent: '13%', color: 'yellow', icon: 'battery_charging_full' },
];

const weeklyActivity = [
  { day: 'Lun', value: 32 },
  { day: 'Mar', value: 44 },
  { day: 'Mer', value: 38 },
  { day: 'Jeu', value: 46 },
  { day: 'Ven', value: 55 },
  { day: 'Sam', value: 62 },
  { day: 'Dim', value: 35 },
];

const dailyActivity = [
  { hour: '0h', value: 10 },
  { hour: '2h', value: 8 },
  { hour: '4h', value: 6 },
  { hour: '6h', value: 12 },
  { hour: '8h', value: 30 },
  { hour: '10h', value: 44 },
  { hour: '12h', value: 52 },
  { hour: '14h', value: 48 },
  { hour: '16h', value: 60 },
  { hour: '18h', value: 72 },
  { hour: '20h', value: 58 },
  { hour: '22h', value: 28 },
];

const bottomStats = [
  { label: 'Taux de recyclage', value: '39.7%', color: 'green', detail: '100 000 déchets' },
  { label: 'Taux de compostage', value: '29.8%', color: 'orange', detail: '75 000 déchets' },
  { label: 'Déchets spéciaux', value: '12.7%', color: 'yellow', detail: '32 000 batteries' },
];

export default function DashboardPage() {
  const [dechets, setDechets] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dechetData = await api.getAllDechets();
        const statsData = await api.getAllStats();
        setDechets(dechetData);
        setStats(statsData);
      } catch (err) {
        setError(err.message);
        console.error('Erreur lors de la récupération:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="dashboard">
      {/* Section Test API */}
      <section style={{ backgroundColor: '#f0f0f0', padding: '20px', margin: '20px', borderRadius: '8px' }}>
        <h2> Test des Routes Backend</h2>
        
        {loading && <p>Chargement...</p>}
        {error && <p style={{ color: 'red' }}>Erreur: {error}</p>}

        {dechets && (
          <div>
            <h3>Dechets (/dechets):</h3>
            <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
              {JSON.stringify(dechets, null, 2)}
            </pre>
          </div>
        )}

        {stats && (
          <div>
            <h3>Stats (/stats):</h3>
            <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
              {JSON.stringify(stats, null, 2)}
            </pre>
          </div>
        )}
      </section>

      <div className="dashboard__header">
        <h1>Tableau de Bord</h1>
        <p>Suivi en temps réel de votre tri des déchets</p>
      </div>

      <section className="dashboard__hero">
        <div className="hero__content">
          <span className="hero__label">{totalStats.title}</span>
          <span className="hero__value">{totalStats.value}</span>
          <span className="hero__subtitle">{totalStats.subtitle}</span>
        </div>
        <div className="hero__icon">♻️</div>
      </section>

      <section className="dashboard__categories">
        {categoryCards.map((card) => (
          <article key={card.label} className={`category-card category-card--${card.color}`}>
            <div className="category-card__top">
              <div className="category-card__header-left">
                <span className="material-symbols-outlined category-card__icon">{card.icon}</span>
                <span className="category-card__label">{card.label}</span>
              </div>
              <span className="category-card__badge">{card.percent}</span>
            </div>
            <div className="category-card__value">{card.value}</div>
            <div className="category-card__bar" />
          </article>
        ))}
      </section>

      <section className="dashboard__charts">
        <article className="chart-card">
          <header className="chart-card__header">
            <h3>Distribution des déchets</h3>
            <span>Répartition par catégorie</span>
          </header>
          <div className="chart-card__donut">
            <div className="donut" />
            <ul className="legend">
              <li><span className="legend__dot green" /> Recyclable</li>
              <li><span className="legend__dot orange" /> Compost</li>
              <li><span className="legend__dot purple" /> Poubelles</li>
              <li><span className="legend__dot yellow" /> Autre (Batteries)</li>
            </ul>
          </div>
        </article>

        <article className="chart-card">
          <header className="chart-card__header">
            <h3>Activité de la semaine</h3>
            <span>Déchets triés par jour</span>
          </header>
          <div className="bar-chart">
            {weeklyActivity.map((day) => (
              <div key={day.day} className="bar-chart__item">
                <span className="bar-chart__value">{day.value}</span>
                <div
                  className="bar-chart__bar"
                  style={{ height: `${day.value}px` }}
                  title={`${day.day}: ${day.value} déchets`}
                />
                <span>{day.day}</span>
              </div>
            ))}
          </div>
          <p className="chart-card__note">Jour le plus actif : <strong>Samedi</strong></p>
        </article>

        <article className="chart-card">
          <header className="chart-card__header">
            <h3>Activité de la journée</h3>
            <span>Déchets triés par heure</span>
          </header>
          <div className="line-chart">
            {dailyActivity.map((hour) => (
              <div key={hour.hour} className="line-chart__item">
                <span className="line-chart__value">{hour.value}</span>
                <div
                  className="line-chart__point"
                  style={{ height: `${hour.value}px` }}
                  title={`${hour.hour}: ${hour.value} déchets`}
                />
                <span>{hour.hour}</span>
              </div>
            ))}
          </div>
          <p className="chart-card__note">Heure de pointe : <strong>18h</strong></p>
        </article>
      </section>

      <section className="dashboard__bottom">
        {bottomStats.map((stat) => (
          <article key={stat.label} className={`bottom-card bottom-card--${stat.color}`}>
            <div>
              <p className="bottom-card__label">{stat.label}</p>
              <p className="bottom-card__value">{stat.value}</p>
              <p className="bottom-card__detail">{stat.detail}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
