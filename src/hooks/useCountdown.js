import { useEffect, useState } from "react";

const pad = (number) => String(number).padStart(2, "0");

// Menghitung mundur ke targetDate dan diperbarui setiap detik.
// Mengembalikan { text: "23:57:56", isOver: false }.
export function useCountdown(targetDate) {
  const target = targetDate ? new Date(targetDate).getTime() : 0;
  // State tampilan: hanya halaman ini yang butuh, jadi bukan di store.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!target) return;
    const timer = setInterval(() => {
      const current = Date.now();
      setNow(current);
      // Berhenti sendiri saat waktunya habis, supaya tidak re-render terus.
      if (current >= target) clearInterval(timer);
    }, 1000);
    // Wajib: hentikan timer saat halaman ditinggalkan.
    return () => clearInterval(timer);
  }, [target]);

  const remaining = Math.max(0, target - now);
  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    isOver: remaining === 0,
    text: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
  };
}
