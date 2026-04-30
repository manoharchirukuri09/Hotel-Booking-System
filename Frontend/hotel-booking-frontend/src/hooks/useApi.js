import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * useApi(apiFn)
 * Wraps any API call with loading / error / data state.
 *
 * Usage:
 *   const { data, loading, error, execute } = useApi(hotelAPI.getAll);
 *   useEffect(() => { execute(); }, []);
 */
export function useApi(apiFn) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFn(...args);
      const result = res.data?.data ?? res.data;
      setData(result);
      return result;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Request failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFn]);

  return { data, loading, error, execute, setData };
}

/**
 * useApiWithToast(apiFn, options)
 * Same as useApi but shows toast on success/error automatically.
 *
 * Usage:
 *   const { execute } = useApiWithToast(bookingAPI.cancel, {
 *     successMsg: 'Booking cancelled!',
 *     errorMsg:   'Failed to cancel booking',
 *   });
 */
export function useApiWithToast(apiFn, { successMsg, errorMsg } = {}) {
  const { data, loading, error, execute: rawExecute, setData } = useApi(apiFn);

  const execute = useCallback(async (...args) => {
    try {
      const result = await rawExecute(...args);
      if (successMsg) toast.success(successMsg);
      return result;
    } catch (err) {
      const msg = err.response?.data?.message || errorMsg || 'Request failed';
      toast.error(msg);
      throw err;
    }
  }, [rawExecute, successMsg, errorMsg]);

  return { data, loading, error, execute, setData };
}
