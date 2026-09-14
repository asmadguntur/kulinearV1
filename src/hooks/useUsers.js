import { useCallback, useEffect, useState } from "react";

import { getAllUsers } from "@/api/users";

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [state, setState] = useState({ loading: true, error: null });
  // Menaikkan angka ini memicu effect di bawah untuk mengambil data lagi.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    getAllUsers()
      .then((data) => {
        if (!active) return;
        setUsers(Array.isArray(data) ? data : []);
        setState({ loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ loading: false, error });
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const refetch = useCallback(() => {
    setState({ loading: true, error: null });
    setReloadKey((key) => key + 1);
  }, []);

  // setUsers ikut dikembalikan supaya halaman bisa memperbarui satu baris
  // (misalnya role) tanpa memuat ulang seluruh daftar.
  return { users, setUsers, ...state, refetch };
}
