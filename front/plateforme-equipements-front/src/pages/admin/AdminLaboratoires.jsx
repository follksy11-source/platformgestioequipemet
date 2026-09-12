import { useState, useEffect } from "react";
import { laboratoiresApi } from "../../services/api";
import StatutLaboratoireBadge from "../../components/StatutLaboratoireBadge";
import LaboratoireForm from "../../components/LaboratoireForm";
import Spinner from "../../components/Spinner";

export default function AdminLaboratoires() {
  const [labos, setLabos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null); // null | "new" | labo object
  const [actionId, setActionId] = useState(null); // id en cours de validation/suppression

  function refresh() {
    setLoading(true);
    laboratoiresApi
      .getAll()
      .then(setLabos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function handleCreate(data) {
    await laboratoiresApi.create(data);
    setEditing(null);
    refresh();
  }

  async function handleUpdate(data) {
    await laboratoiresApi.update(editing.id, data);
    setEditing(null);
    refresh();
  }

  async function handleDelete(id) {
    if (!confirm("Supprimer ce laboratoire ?")) return;
    setActionId(id);
    try {
      await laboratoiresApi.remove(id);
      refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionId(null);
    }
  }

  async function handleValider(id) {
    setActionId(id);
    try {
      await laboratoiresApi.valider(id);
      refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-end justify-between border-b border-line pb-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Laboratoires</h1>
          <p className="mt-1 font-mono text-xs text-ink/50">{labos.length} enregistrés</p>
        </div>
        {editing === null && (
          <button
            onClick={() => setEditing("new")}
            className="bg-primary px-4 py-2 text-sm font-medium text-paper hover:bg-primary-dark"
          >
            + Nouveau laboratoire
          </button>
        )}
      </div>

      {editing === "new" && (
        <div className="mt-6">
          <LaboratoireForm onSubmit={handleCreate} onCancel={() => setEditing(null)} />
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-ink/60">
          <Spinner className="h-5 w-5" />
          <span className="text-sm">Chargement...</span>
        </div>
      )}
      {error && <p className="mt-6 text-sm text-status-panne">{error}</p>}

      <div className="mt-6 flex flex-col gap-px bg-line">
        {labos.map((labo) =>
          editing?.id === labo.id ? (
            <LaboratoireForm
              key={labo.id}
              initial={labo}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <div key={labo.id} className="flex items-center justify-between gap-4 bg-paper p-4">
              <div>
                <p className="font-display text-base text-ink">{labo.nom}</p>
                <p className="text-xs text-ink/50">
                  {labo.institution?.nom || "Sans institution"} · {labo.membres?.length || 0} membre(s) ·{" "}
                  {labo.equipements?.length || 0} équipement(s)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatutLaboratoireBadge statut={labo.statut} />
                {labo.statut === "EN_ATTENTE" && (
                  <button
                    onClick={() => handleValider(labo.id)}
                    disabled={actionId === labo.id}
                    className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
                  >
                    Valider
                  </button>
                )}
                <button
                  onClick={() => setEditing(labo)}
                  className="text-sm font-medium text-ink/60 hover:text-primary"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(labo.id)}
                  disabled={actionId === labo.id}
                  className="text-sm font-medium text-status-panne hover:underline disabled:opacity-50"
                >
                  Supprimer
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
