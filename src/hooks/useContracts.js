import { useEffect, useState } from 'react';
import { subscribeToUserContracts } from '../firebase/contractService';
import { useAuth } from '../context/AuthContext';

/**
 * Subscribes to all exchange contracts for the current user (as requester or partner).
 * Provides loading state and cleanup on unmount.
 *
 * @returns {{ contracts: object[], loading: boolean, error: string|null }}
 */
const useContracts = () => {
  const { currentUser } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser?.uid) {
      setContracts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToUserContracts(currentUser.uid, (data) => {
      setContracts(data);
      setLoading(false);
    });

    return () => {
      console.log('[useContracts] Cleaning up listener for user:', currentUser.uid);
      unsubscribe();
    };
  }, [currentUser?.uid]);

  return { contracts, loading, error };
};

export default useContracts;
