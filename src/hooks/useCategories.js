import { useState, useCallback, useEffect } from "react";
import apiClient from "../services/api";

export function useCategories(token) {
  const [categories, setCategories] = useState([]);

  const reloadCategories = useCallback(async () => {
    if (!token) return;
    try { setCategories(await apiClient.get("/categories", token)); } catch {}
  }, [token]);

  useEffect(() => { reloadCategories(); }, [reloadCategories]);

  return { categories, reloadCategories };
}
