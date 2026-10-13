import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { publicationsApi, mediaUrl } from "../services/api";
import { TYPE_LABELS, isAppel, formatDate } from "../lib/publications";
import PublicationCard from "../components/PublicationCard";
import Spinner from "../components/Spinner";

const FILTERS = [
  { value: "TOUS", label: "Tout" },
  { value: "ARTICLE", label: "Articles" },
  { value: "ANNONCE", label: "Annonces" },
];

export default function Actualites() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("TOUS");

  useEffect(() => {
    publicationsApi
      .getAll()
      .then(setPublications)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const items = useMemo(
    () =>
      publications
        .filter((p) => !isAppel(p.type))
        .filter((p) => filter === "TOUS" || p.type === filter)
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [publications, filter],
  );

  const [featured, ...rest] = items;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="border-b border-line pb-4">
        <h1 className="font-display text-3xl text-ink">Actualités</h1>
        <p className="mt-1 font-mono text-xs text-ink/50">{items.length} publication(s)</p>
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
      {!loading && !error && items.length === 0 && (
        <p className="mt-8 text-sm text-ink/60">Aucune publication pour le moment.</p>
      )}

      {featured && (
        <Link
          to={`/publications/${featured.id}`}
          className="mt-6 grid border border-line bg-paper transition-colors hover:bg-primary/5 sm:grid-cols-2"
        >
          <div className="flex h-56 items-center justify-center overflow-hidden bg-line/40 sm:h-auto">
            {featured.image && (
              <img
                src={mediaUrl(featured.image)}
                alt={featured.titre}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="flex flex-col justify-center p-6">
            <span className="font-mono text-[11px] text-primary">
              À la une · {TYPE_LABELS[featured.type] || featured.type}
            </span>
            <h2 className="mt-2 font-display text-2xl text-ink">{featured.titre}</h2>
            <p className="mt-2 line-clamp-4 text-sm text-ink/70">{featured.contenu}</p>
            <span className="mt-4 font-mono text-[11px] text-ink/40">{formatDate(featured.date)}</span>
          </div>
        </Link>
      )}

      {rest.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <PublicationCard key={p.id} publication={p} />
          ))}
        </div>
      )}
    </div>
  );
}