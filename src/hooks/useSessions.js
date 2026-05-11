import { useEffect, useState } from 'react';
import { subscribeToContractSessions } from '../firebase/sessionService';

/**
 * Subscribes to all sessions belonging to a specific contract.
 * Provides loading state and cleanup on unmount.
 *
 * @param {string} contractId
 * @returns {{ sessions: object[], loading: boolean, error: string|null }}
 */
const useSessions = (contractId) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!contractId) {
      setSessions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToContractSessions(contractId, (data) => {
      setSessions(data);
      setLoading(false);
    });

    return () => {
      console.log('[useSessions] Cleaning up listener for contract:', contractId);
      unsubscribe();
    };
  }, [contractId]);

  return { sessions, loading, error };
};

export default useSessions;
