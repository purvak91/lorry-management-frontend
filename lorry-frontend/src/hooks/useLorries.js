import { useState } from 'react';
import * as api from '../services/lorryApi';

export function useLorries({ page, pageSize, filters }) {
  const [lorries, setLorries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageInfo, setPageInfo] = useState({
    pageNumber: 0,
    totalPages: 0,
    totalElements: 0,
  });

  async function fetchLorries(targetPage = page, sizeOverride) {
    setLoading(true);
    try {
      const effectiveSize = sizeOverride ?? pageSize;
      const data = await api.getLorries(targetPage, effectiveSize, filters);
      const items = Array.isArray(data) ? data : data.content ?? [];

      setLorries(items);

      if (!Array.isArray(data)) {
        setPageInfo({
          pageNumber: data.number,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
        });
      }

      return items;
    } finally {
      setLoading(false);
    }
  }

  async function deleteLorry(lr) {
    await api.deleteLorry(lr);
  }

  return {
    lorries,
    loading,
    pageInfo,
    fetchLorries,
    deleteLorry,
  };
}
