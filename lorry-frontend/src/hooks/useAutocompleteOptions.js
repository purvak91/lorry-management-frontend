import { useEffect, useState, useCallback } from 'react';
import * as api from '../services/lorryApi';

export function useAutocompleteOptions() {
  const [lorryNumbers, setLorryNumbers] = useState([]);
  const [fromLocations, setFromLocations] = useState([]);
  const [toLocations, setToLocations] = useState([]);
  const [consignorNames, setConsignorNames] = useState([]);
  const [loading, setLoading] = useState(false);

  const refershAutocompleteOptions = useCallback(async () => {
    setLoading(true);
    try {
      const [
        lorryNums,
        froms,
        tos,
        consignors,
      ] = await Promise.all([
        api.getDistinctLorryNumbers(),
        api.getDistinctFromLocations(),
        api.getDistinctToLocations(),
        api.getDistinctConsignors(),
      ]);

      setLorryNumbers(lorryNums);
      setFromLocations(froms);
      setToLocations(tos);
      setConsignorNames(consignors);
    } catch (err) {
      console.error('Failed to load autocomplete options', err);
    } finally {
      setLoading(false);
    } 
  }, []);

  useEffect(() => {
    refershAutocompleteOptions();
  }, [refershAutocompleteOptions]);

  return {
    lorryNumbers,
    fromLocations,
    toLocations,
    consignorNames,
    loading,
    refersh: refershAutocompleteOptions,
  };
}