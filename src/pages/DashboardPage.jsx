import '../styles/dashboard.css';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const CATEGORY_META = {
  recyclage: { label: 'RECYCLABLE', color: 'green', icon: 'recycling', bottomLabel: 'Taux de recyclage' },
  compost: { label: 'COMPOST', color: 'orange', icon: 'compost', bottomLabel: 'Taux de compostage' },
  poubelle: { label: 'POUBELLES', color: 'purple', icon: 'delete' },
  autre: { label: 'AUTRE (BATTERIES)', color: 'yellow', icon: 'battery_charging_full', bottomLabel: 'Déchets spéciaux' },
};

const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function normalizeCategory(value) {
  return value?.toString().trim().toLowerCase();
}

function parseDechetDate(value) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const [datePart, timePart] = value.split(' ');
  if (datePart?.includes('/')) {
    const [day, month, year] = datePart.split('/');
    if (!year) return null;
    const [hour = '0', minute = '0', second = '0'] = (timePart || '').split(':');
    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

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

  const computedStats = useMemo(() => {
    const dechetsList = Array.isArray(dechets) ? dechets : [];
    const statsList = Array.isArray(stats) ? stats : [];

    const totalCount = dechetsList.length;
    const totalStatsValue = {
      title: 'TOTAL DES DÉCHETS TRIÉS',
      value: totalCount.toLocaleString('fr-CA'),
      subtitle: 'déchets triés avec succès',
    };

    const statsByCategory = statsList.reduce((acc, item) => {
      const key = normalizeCategory(item?.categorieAnalyser);
      if (!key) return acc;
      acc[key] = item;
      return acc;
    }, {});

    const categoryOrder = ['recyclage', 'compost', 'poubelle', 'autre'];
    const categoryCardsValue = categoryOrder.map((key) => {
      const meta = CATEGORY_META[key];
      const item = statsByCategory[key];
      const count = item?.TotalNumber ?? 0;
      const ratio = typeof item?.ratio === 'number'
        ? item.ratio
        : totalCount > 0
          ? (count / totalCount) * 100
          : 0;

      return {
        label: meta.label,
        value: count.toLocaleString('fr-CA'),
        percent: `${ratio.toFixed(2)}%`,
        color: meta.color,
        icon: meta.icon,
      };
    });

    const weekdayCounts = Array(7).fill(0);
    const hourlyCounts = Array(24).fill(0);

    dechetsList.forEach((item) => {
      const date = parseDechetDate(item?.date);
      if (!date) return;
      const dayIndex = (date.getDay() + 6) % 7;
      weekdayCounts[dayIndex] += 1;
      hourlyCounts[date.getHours()] += 1;
    });

    const weeklyActivityValue = WEEK_DAYS.map((day, index) => ({
      day,
      value: weekdayCounts[index],
    }));

    const dailyActivityValue = Array.from({ length: 12 }, (_, index) => {
      const hour = index * 2;
      const value = hourlyCounts[hour] + (hourlyCounts[hour + 1] || 0);
      return { hour: `${hour}h`, value };
    });

    const busiestDayValue = weeklyActivityValue.reduce(
      (best, current) => (current.value > best.value ? current : best),
      weeklyActivityValue[0] || { day: '-', value: 0 }
    );

    const busiestHourValue = dailyActivityValue.reduce(
      (best, current) => (current.value > best.value ? current : best),
      dailyActivityValue[0] || { hour: '-', value: 0 }
    );

    const bottomKeys = ['recyclage', 'compost', 'autre'];
    const bottomTotal = bottomKeys.reduce((sum, key) => {
      const item = statsByCategory[key];
      return sum + (item?.TotalNumber ?? 0);
    }, 0);

    const bottomStatsValue = bottomKeys
      .map((key) => {
        const meta = CATEGORY_META[key];
        const item = statsByCategory[key];
        const count = item?.TotalNumber ?? 0;
        const ratio = bottomTotal > 0 ? (count / bottomTotal) * 100 : 0;

        return {
          label: meta.bottomLabel,
          value: `${ratio.toFixed(2)}%`,
          color: meta.color,
          detail: `${count.toLocaleString('fr-CA')} déchets`,
        };
      })
      .filter(Boolean);

    return {
      totalStats: totalStatsValue,
      categoryCards: categoryCardsValue,
      weeklyActivity: weeklyActivityValue,
      dailyActivity: dailyActivityValue,
      bottomStats: bottomStatsValue,
      busiestDay: busiestDayValue.day,
      busiestHour: busiestHourValue.hour,
    };
  }, [dechets, stats]);

  const totalStats = computedStats?.totalStats ?? {
    title: 'TOTAL DES DÉCHETS TRIÉS',
    value: '0',
    subtitle: 'déchets triés avec succès',
  };
  const categoryCards = computedStats?.categoryCards ?? [];
  const weeklyActivity = computedStats?.weeklyActivity ?? [];
  const dailyActivity = computedStats?.dailyActivity ?? [];
  const bottomStats = computedStats?.bottomStats ?? [];
  const busiestDay = computedStats?.busiestDay ?? '-';
  const busiestHour = computedStats?.busiestHour ?? '-';

  return (
    <main className="dashboard">
      <div className="dashboard__header">
        <h1>Tableau de Bord</h1>
        <p>Suivi en temps réel de votre tri des déchets</p>
        {loading && <p>Chargement des données...</p>}
        {error && <p style={{ color: 'red' }}>Erreur: {error}</p>}
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
          <p className="chart-card__note">Jour le plus actif : <strong>{busiestDay}</strong></p>
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
          <p className="chart-card__note">Heure de pointe : <strong>{busiestHour}</strong></p>
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
