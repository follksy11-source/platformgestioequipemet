import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useEquipments } from "../hooks/useEquipments";
import StatusBadge from "../components/StatusBadge";

export default function Catalogue() {
  const { equipements, loading, error } = useEquipments();
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      equipements.filter((eq) =>
        eq.nom.toLowerCase().includes(search.toLowerCase())
      ),
    [equipements, search]
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-end justify-between border-b border-line pb-4">
        <div>
          <h1 className="font-display text-3xl text-ink">
            Catalogue des équipements
          </h1>
          <p className="mt-1 font-mono text-xs text-ink/50">
            {filtered.length} équipement{filtered.length > 1 ? "s" : ""} référencé{filtered.length > 1 ? "s" : ""}
          </p>
        </div>
        <input
          type="text"
          placeholder="Rechercher un équipement..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-primary focus:outline-none"
        />
      </div>

      {loading && <p className="text-sm text-ink/60">Chargement du catalogue...</p>}
      {error && <p className="text-sm text-status-panne">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <p className="text-sm text-ink/60">Aucun équipement ne correspond à cette recherche.</p>
      )}

      <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((eq) => (
          <Link
            key={eq.id}
            to={`/equipements/${eq.id}`}
            className="group flex flex-col gap-3 bg-paper p-5 transition-colors hover:bg-primary/5"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-display text-lg leading-snug text-ink group-hover:text-primary">
                {eq.nom}
              </h2>
              <span className="shrink-0 font-mono text-[11px] text-ink/40">
                #{String(eq.id).padStart(4, "0")}
              </span>
            </div>

            {eq.description && (
              <p className="line-clamp-2 text-sm text-ink/60">{eq.description}</p>
            )}

            <div className="mt-auto flex items-center justify-between pt-2">
              <StatusBadge statut={eq.disponibilite} />
              {eq.laboratoire?.nom && (
                <span className="font-mono text-[11px] text-ink/40">
                  {eq.laboratoire.nom}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
