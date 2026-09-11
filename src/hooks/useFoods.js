import { useCallback, useEffect, useState } from "react";

import { getFoodById, getFoods } from "@/api/foods";

export function useFoods() {
  const [foods, setFoods] = useState([]);
  const [state, setState] = useState({ loading: true, error: null });
  const fetchFoods = useCallback(async () => {
    try {
      setState({ loading: true, error: null });
      // getFoods() sudah mengembalikan array menu, bukan objek pembungkus API.
      const response = await getFoods();
      setFoods(Array.isArray(response) ? response : []);
    } catch (error) {
      setState({ loading: false, error });
      return;
    }
    setState({ loading: false, error: null });
  }, []);
  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);
  return { foods, ...state, refetch: fetchFoods };
}

export function useFoodDetail(foodId) {
  const [state, setState] = useState({
    food: null,
    loading: true,
    error: null,
  });
  useEffect(() => {
    let active = true;
    getFoodById(foodId)
      .then((food) => {
        if (active) setState({ food, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ food: null, loading: false, error });
      });
    return () => {
      active = false;
    };
  }, [foodId]);
  return state;
}
