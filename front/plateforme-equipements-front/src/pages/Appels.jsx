import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { publicationsApi } from "../services/api";
import { TYPE_LABELS, isAppel, getStatutAppel, formatDate } from "../lib/publications";
import AppelStatutBadge from "../components/AppelStatutBadge";
import Spinner from "../components/Spinner";

const FILTERS = [
  { value: "OUVERTS", label: "Ouverts" },
  { value: "CLOTURES", label: "Clôturés" },
  { value: "TOUS", label: "Tous" },
];

const time = (p) => (p.dateCloture ? new Date(p.dateCloture).getTime() : Number.MAX_SAFE_INTEGER);

export default function Appels() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("OUVERTS");

  useEffect(() => {
    publicationsApi
      .getAll()
      .then(setPublications)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const { ouverts, clotures } = useMemo(() => {
    const appels = publications.filter((p) => isAppel(p.type));
    const isClosed = (p) => getStatutAppel(p.dateCloture) === "CLOTURE";
    return {
      ouverts: appels.filter((p) => !isClosed(p)).sort((a, b) => time(a) - time(b)),
      clotures: appels.filter(isClosed).sort((a, b) => time(b) - time(a)),
    };
  }, [publications]);

  const list =
    filter === "OUVERTS" ? ouverts : filter === "CLOTURES" ? clotures : [...ouverts, ...clotures];

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="border-b border-line pb-4">
        <h1 className="font-display text-3xl text-ink">Appels</h1>
        <p className="mt-1 text-sm text-ink/60">
          Appels à projet, à candidature et d'offres publiés par l'ANSSN et l'AIEA.
        </p>
      </div>

      <div className="mt-4 flex gap-4 text-sm">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`font-medium ${filter === f.value ? "text-primary" : "text-ink/50 hover:text-ink"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-8 flex items-center justify-center gap-2 text-ink/60">
          <Spinner className="h-5 w-5" />
          <span className="text-sm">Chargement...</span>
        </div>
      )}
      {error && <p className="mt-8 text-sm text-status-panne">{error}</p>}
      {!loading && !error && list.length === 0 && (
        <p className="mt-8 text-sm text-ink/60">Aucun appel dans cette catégorie.</p>
      )}

      <div className="mt-6 flex flex-col gap-px bg-line">
        {list.map((p) => (
          <Link
            key={p.id}
            to={`/publications/${p.id}`}
            className="flex items-center justify-between gap-4 bg-paper p-4 transition-colors hover:bg-primary/5"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-primary">
                  {TYPE_LABELS[p.type] || p.type}
                </span>
                {p.fichierPdf && <span className="font-mono text-[11px] text-ink/40">PDF</span>}
              </div>
              <p className="mt-1 truncate font-display text-base text-ink">{p.titre}</p>
              {p.contenu && <p className="truncate text-sm text-ink/60">{p.contenu}</p>}
            </div>
            <div className="shrink-0 text-right">
              {p.dateCloture && (
                <p className="text-xs text-ink/60">Clôture le {formatDate(p.dateCloture)}</p>
              )}
              <div className="mt-1">
                <AppelStatutBadge dateCloture={p.dateCloture} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}