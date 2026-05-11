import { useState, useCallback } from 'react';

let toastIdCounter = 0;

/**
 * Lightweight toast manager hook.
 * Returns { toasts, showToast, dismissToast }.
 *
 * Toast types: 'success' | 'error' | 'info' | 'warning'
 * Auto-dismisses after `duration` ms (default 4000).
 */
const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((type, message, duration = 4000) => {
    toastIdCounter += 1;
    const id = toastIdCounter;

    console.log(`[Toast] ${type.toUpperCase()}: ${message}`);

    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);

    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
};

export default useToast;
