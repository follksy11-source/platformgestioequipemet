import { useState, useEffect } from "react";
import { factsApi } from "../../services/api";
import FactForm from "../../components/FactForm";
import Spinner from "../../components/Spinner";

const STATUT_CONFIG = {
  BROUILLON: { label: "Brouillon", color: "bg-ink/40" },
  PUBLIE: { label: "Publié", color: "bg-status-disponible" },
  ARCHIVE: { label: "Archivé", color: "bg-status-panne" },
};

export default function AdminFacts() {
  const [facts, setFacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [actionId, setActionId] = useState(null);

  function refresh() {
    setLoading(true);
    factsApi
      .adminAll()
      .then(setFacts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function handleCreate(data) {
    const res = await factsApi.create(data);
    const created = res.fact || res.data;
    refresh();
    setEditing(created); // bascule direct en édition sur le fact créé
  }

  async function handleUpdate(data) {
    await factsApi.update(editing.id, data);
    setEditing(null);
    refresh();
  }

  async function handle(action, id) {
    setActionId(id);
    try {
      await factsApi[action](id);
      refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Supprimer ce fact ?")) return;
    handle("remove", id);
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-end justify-between border-b border-line pb-4">
        <div>
          <h1 className="font-display text-3xl text-ink">
            Facts:
          </h1>
          <p className="mt-1 font-mono text-xs text-ink/50">
            {facts.length} fact(s)
          </p>
        </div>
        {editing === null && (
          <button
            onClick={() => setEditing("new")}
            className="bg-primary px-4 py-2 text-sm font-medium text-paper hover:bg-primary-dark"
          >
            + Nouveau fact
          </button>
        )}
      </div>

      {editing === "new" && (
        <div className="mt-6">
          <FactForm onSubmit={handleCreate} onCancel={() => setEditing(null)} />
          <p className="mt-2 text-xs text-ink/50">
            L'upload du modèle 3D sera disponible juste après la création.
          </p>
        </div>
      )}

      {loading && (
        <div className="mt-6 flex items-center gap-2 text-ink/60">
          <Spinner className="h-5 w-5" />
          <span className="text-sm">Chargement...</span>
        </div>
      )}
      {error && <p className="mt-6 text-sm text-status-panne">{error}</p>}

      <div className="mt-6 flex flex-col gap-px bg-line">
        {facts.map((f) =>
          editing?.id === f.id ? (
            <FactForm
              key={f.id}
              initial={f}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
              onModeleChange={refresh}
            />
          ) : (
            <div
              key={f.id}
              className="flex items-center justify-between gap-4 bg-paper p-4"
            >
              <div>
                <p className="font-display text-base text-ink">{f.titre}</p>
                <p className="text-xs text-ink/50">
                  {f.categorie?.nom || "Sans catégorie"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink/80">
                  <span
                    className={`h-2 w-2 rounded-full ${STATUT_CONFIG[f.statut]?.color || "bg-ink/40"}`}
                  />
                  {STATUT_CONFIG[f.statut]?.label || f.statut}
                </span>
                {f.statut !== "PUBLIEE" && (
                  <button
                    onClick={() => handle("publier", f.id)}
                    disabled={actionId === f.id || !f.modele3D}
                    title={
                      !f.modele3D
                        ? "Ajoutez un modèle 3D avant de publier"
                        : undefined
                    }
                    className="text-sm font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                  >
                    Publier
                  </button>
                )}
                {f.statut === "PUBLIEE" && (
                  <button
                    onClick={() => handle("archiver", f.id)}
                    disabled={actionId === f.id}
                    className="text-sm font-medium text-status-maintenance hover:underline disabled:opacity-50"
                  >
                    Archiver
                  </button>
                )}
                <button
                  onClick={() => setEditing(f)}
                  className="text-sm font-medium text-ink/60 hover:text-primary"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(f.id)}
                  disabled={actionId === f.id}
                  className="text-sm font-medium text-status-panne hover:underline disabled:opacity-50"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
