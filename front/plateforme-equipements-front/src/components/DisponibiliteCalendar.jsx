import { useState, useEffect, useMemo } from "react";
import { equipementsApi } from "../services/api";
import Spinner from "./Spinner";

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default function DisponibiliteCalendar({ equipementId }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));

  useEffect(() => {
    equipementsApi
      .getDisponibilites(equipementId)
      .then((data) => setReservations(data.reservations))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [equipementId]);

  const occupiedDays = useMemo(() => {
    const days = [];
    for (const r of reservations) {
      const start = new Date(r.dateDebut);
      const end = new Date(r.dateFin);
      const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      while (cursor <= last) {
        days.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
    }
    return days;
  }, [reservations]);

  const grid = useMemo(() => {
    const first = month;
    const startWeekday = (first.getDay() + 6) % 7; // lundi = 0
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
    return cells;
  }, [month]);

  function isOccupied(day) {
    return occupiedDays.some((d) => sameDay(d, day));
  }

  function changeMonth(delta) {
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-ink/60">
        <Spinner className="h-4 w-4" />
        <span className="text-sm">Chargement du calendrier...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-status-panne">{error}</p>;
  }

  return (
    <div className="border border-line bg-paper p-4">
      <div className="flex items-center justify-between">
        <button onClick={() => changeMonth(-1)} className="text-sm text-ink/60 hover:text-primary">←</button>
        <span className="font-display text-base text-ink">
          {month.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
        </span>
        <button onClick={() => changeMonth(1)} className="text-sm text-ink/60 hover:text-primary">→</button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <span key={i} className="text-[10px] font-medium text-ink/40">{d}</span>
        ))}
        {grid.map((day, i) =>
          day ? (
            <div
              key={i}
              className={`flex h-8 items-center justify-center text-xs ${
                isOccupied(day)
                  ? "bg-status-maintenance/20 font-medium text-status-maintenance"
                  : "text-ink/70"
              }`}
            >
              {day.getDate()}
            </div>
          ) : (
            <div key={i} />
          )
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-line pt-2 text-[11px] text-ink/50">
        <span className="h-2 w-2 bg-status-maintenance/40" /> Déjà réservé
      </div>
    </div>
  );
}