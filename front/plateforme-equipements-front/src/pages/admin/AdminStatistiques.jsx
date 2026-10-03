import { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from "recharts";
import {
  equipementsApi, laboratoiresApi, utilisateursApi,
  reservationsApi, demandesApi,
} from "../../services/api";
import Spinner from "../../components/Spinner";

const COLORS = {
  primary: "#1D3E4E",
  disponible: "#3F7D63",
  maintenance: "#C97A1A",
  panne: "#B3432B",
  neutral: "#9A9A93",
};

const DISPONIBILITE_COLORS = {
  INSTALLE_FONCTIONNEL: COLORS.disponible,
  PRESENT_NON_INSTALLE: COLORS.maintenance,
  EN_COURS_DE_LIVRAISON: COLORS.maintenance,
  PROJET_EN_COURS: COLORS.neutral,
};

const RESERVATION_COLORS = {
  EN_ATTENTE: COLORS.maintenance,
  ACCEPTEE: COLORS.disponible,
  REFUSEE: COLORS.panne,
  ANNULEE: COLORS.neutral,
  TERMINEE: COLORS.primary,
};

function countBy(list, key) {
  const counts = {};
  for (const item of list) {
    const value = item[key];
    counts[value] = (counts[value] || 0) + 1;
  }
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function chartCard(title, children) {
  return (
    <div className="border border-line bg-paper p-5">
      <h2 className="font-display text-base text-ink">{title}</h2>
      <div className="mt-4 h-64">{children}</div>
    </div>
  );
}

export default function AdminStatistiques() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      equipementsApi.getAll(),
      laboratoiresApi.getAll(),
      utilisateursApi.getAll(),
      reservationsApi.gestion(),
      demandesApi.getAll(),
    ])
      .then(([equipements, laboratoires, utilisateurs, reservations, demandes]) => {
        setData({ equipements, laboratoires, utilisateurs, reservations, demandes });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const equipementsParStatut = useMemo(
    () => (data ? countBy(data.equipements, "disponibilite") : []),
    [data]
  );
  const usersParRole = useMemo(() => (data ? countBy(data.utilisateurs, "role") : []), [data]);
  const usersParStatutCompte = useMemo(
    () => (data ? countBy(data.utilisateurs, "statutCompte") : []),
    [data]
  );
  const reservationsParStatut = useMemo(
    () => (data ? countBy(data.reservations, "statut") : []),
    [data]
  );
  const demandesParType = useMemo(() => (data ? countBy(data.demandes, "type") : []), [data]);

  const reservationsParMois = useMemo(() => {
    if (!data) return [];
    const counts = {};
    for (const r of data.reservations) {
      const mois = new Date(r.dateDebut).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
      counts[mois] = (counts[mois] || 0) + 1;
    }
    return Object.entries(counts).map(([mois, total]) => ({ mois, total }));
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-ink/60">
        <Spinner className="h-5 w-5" />
        <span className="text-sm">Chargement des statistiques...</span>
      </div>
    );
  }

  if (error) {
    return <p className="mx-auto max-w-3xl px-6 py-16 text-sm text-status-panne">{error}</p>;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="border-b border-line pb-4">
        <h1 className="font-display text-3xl text-ink">Statistiques</h1>
        <p className="mt-1 text-sm text-ink/60">Vue d'ensemble de l'activité de la plateforme</p>
      </div>

      {/* Ligne 1 : chiffres clés */}
      <div className="mt-6 grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
        {[
          ["Équipements", data.equipements.length],
          ["Laboratoires", data.laboratoires.length],
          ["Utilisateurs", data.utilisateurs.length],
          ["Réservations", data.reservations.length],
        ].map(([label, value]) => (
          <div key={label} className="border border-line bg-paper p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">{label}</p>
            <p className="mt-2 font-display text-3xl text-ink">{value}</p>
          </div>
        ))}
      </div>

      {/* Ligne 2 : courbe réservations dans le temps (pleine largeur) */}
      <div className="mt-6">
        {chartCard(
          "Réservations par mois",
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={reservationsParMois}>
              <CartesianGrid stroke="#D9D8D2" vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 12, fill: "#161B1F" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#161B1F" }} />
              <Tooltip contentStyle={{ fontSize: 12, borderColor: "#D9D8D2" }} />
              <Line type="monotone" dataKey="total" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Ligne 3 : grille de graphiques en barres */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {chartCard(
          "Équipements par disponibilité",
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={equipementsParStatut} layout="vertical">
              <CartesianGrid stroke="#D9D8D2" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#161B1F" }} />
              <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: "#161B1F" }} />
              <Tooltip contentStyle={{ fontSize: 12, borderColor: "#D9D8D2" }} />
              <Bar dataKey="value" radius={[0, 2, 2, 0]}>
                {equipementsParStatut.map((entry) => (
                  <Cell key={entry.name} fill={DISPONIBILITE_COLORS[entry.name] || COLORS.neutral} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartCard(
          "Réservations par statut",
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reservationsParStatut}>
              <CartesianGrid stroke="#D9D8D2" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#161B1F" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#161B1F" }} />
              <Tooltip contentStyle={{ fontSize: 12, borderColor: "#D9D8D2" }} />
              <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                {reservationsParStatut.map((entry) => (
                  <Cell key={entry.name} fill={RESERVATION_COLORS[entry.name] || COLORS.neutral} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartCard(
          "Utilisateurs par rôle",
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={usersParRole}>
              <CartesianGrid stroke="#D9D8D2" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#161B1F" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#161B1F" }} />
              <Tooltip contentStyle={{ fontSize: 12, borderColor: "#D9D8D2" }} />
              <Bar dataKey="value" fill={COLORS.primary} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartCard(
          "Utilisateurs par statut de compte",
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={usersParStatutCompte}>
              <CartesianGrid stroke="#D9D8D2" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#161B1F" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#161B1F" }} />
              <Tooltip contentStyle={{ fontSize: 12, borderColor: "#D9D8D2" }} />
              <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                {usersParStatutCompte.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={
                      entry.name === "VALIDE" ? COLORS.disponible
                        : entry.name === "BLOQUE" ? COLORS.panne
                        : COLORS.maintenance
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartCard(
          "Demandes par type",
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={demandesParType}>
              <CartesianGrid stroke="#D9D8D2" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#161B1F" }} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#161B1F" }} />
              <Tooltip contentStyle={{ fontSize: 12, borderColor: "#D9D8D2" }} />
              <Bar dataKey="value" fill={COLORS.primary} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}