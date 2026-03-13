// src/hooks/useFetch.js
// Generic data-fetching hook. Use with real API endpoints in production.
import { useState, useEffect } from "react";
import api from "../services/api";

/**
 * @param {string} url  - API endpoint e.g. "/students"
 * @returns {{ data, loading, error, refetch }}
 */
const useFetch = (url) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get(url);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [url]);

  return { data, loading, error, refetch: fetch };
};

export default useFetch;
