import { useCallback, useEffect, useState } from "react";

import { getAllUsers, getCurrentUser } from "@/api/users";

export function useUsers() {
  const [users, setUsers] = useState([]);

  const [state, setState] = useState({
    user: null,
    loading: true,
    error: null,
  });

  // Menaikkan angka ini memicu effect di bawah untuk mengambil data lagi.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    getCurrentUser()
      .then((currentUser) => {
        if (!active) return;

        setState((prev) => ({
          ...prev,
          user: currentUser,
        }));
      })
      .catch((error) => {
        if (active) {
          setState((prev) => ({
            ...prev,
            error,
          }));
        }
      });

    getAllUsers()
      .then((data) => {
        if (!active) return;

        setUsers(Array.isArray(data) ? data : []);

        setState((prev) => ({
          ...prev,
          loading: false,
          error: null,
        }));
      })
      .catch((error) => {
        if (active) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error,
          }));
        }
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const refetch = useCallback(() => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    setReloadKey((key) => key + 1);
  }, []);

  return {
    users,
    setUsers,
    ...state,
    refetch,
  };
}

// Digunakan khusus untuk halaman Profile
export function useCurrentUser() {
  const [state, setState] = useState({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;

    getCurrentUser()
      .then((user) => {
        if (active) {
          setState({
            user,
            loading: false,
            error: null,
          });
        }
      })
      .catch((error) => {
        if (active) {
          setState({
            user: null,
            loading: false,
            error,
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
