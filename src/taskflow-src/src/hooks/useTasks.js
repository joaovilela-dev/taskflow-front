import { useState, useCallback, useEffect } from "react";
import apiClient from "../services/api";

const PER_PAGE = 10;

export function useTasks({ token, page, filter, activeCat, search }) {
  const [tasks,      setTasks]      = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ page, per_page: PER_PAGE });
      if (filter.status)      params.set("status",      filter.status);
      if (filter.priority)    params.set("priority",    filter.priority);
      if (activeCat !== null) params.set("category_id", activeCat);
      if (search)             params.set("search",      search);
      const data = await apiClient.get(`/tasks?${params}`, token);
      setTasks(data.items);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, page, filter, activeCat, search]);

  useEffect(() => { load(); }, [load]);

  return { tasks, loading, error, total, totalPages, reload: load };
}
