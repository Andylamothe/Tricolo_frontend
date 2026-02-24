import { useEffect, useCallback } from 'react';

/**
 * Hook personnalisé pour refetch automatique des données
 * @param {Function} fetchFunction - La fonction async à exécuter
 * @param {number} intervalMs - Intervalle de rafraîchissement en millisecondes (default: 10000)
 * @param {boolean} enabled - Active/désactive le polling (default: true)
 */
export function useAutoFetch(fetchFunction, intervalMs = 10000, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    // Exécution initiale
    fetchFunction();

    // Polling automatique
    const interval = setInterval(fetchFunction, intervalMs);

    // Cleanup
    return () => clearInterval(interval);
  }, [fetchFunction, intervalMs, enabled]);
}
