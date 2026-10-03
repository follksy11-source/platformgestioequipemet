import { useState, useEffect } from "react";
import { equipementsApi, laboratoiresApi } from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import EquipementForm from "../../components/EquipementForm";
import Spinner from "../../components/Spinner";

export default function AdminEquipements() {
  const [equipements, setEquipements] = useState([]);
  const [laboratoires, setLaboratoires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [actionId, setActionId] = useState(null);

  function refresh() {
    setLoading(true);
    Promise.all([equipementsApi.getAll(), laboratoiresApi.getAll()])
      .then(([eqs, labos]) => {
        setEquipements(eqs);
        setLaboratoires(labos);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function handleCreate(data) {
    await equipementsApi.create(data);
    setEditing(null);
    refresh();
  }

  async function handleUpdate(data) {
    await equipementsApi.update(editing.id, data);
    setEditing(null);
    refresh();
  }

  async function handleDelete(id) {
    if (!confirm("Supprimer cet équipement ?")) return;
    setActionId(id);
    try {
      await equipementsApi.remove(id);
      refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionId(null);
    }
  }

  function laboNom(id) {
    return laboratoires.find((l) => l.id === id)?.nom || "—";
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-end justify-between border-b border-line pb-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Équipements</h1>
          <p className="mt-1 font-mono text-xs text-ink/50">{equipements.length} enregistrés</p>
        </div>
        {editing === null && (
          <button onClick={() => setEditing("new")}
            className="bg-primary px-4 py-2 text-sm font-medium text-paper hover:bg-primary-dark">
            + Nouvel équipement
          </button>
        )}
      </div>

      {editing === "new" && (
        <div className="mt-6">
          <EquipementForm
            laboratoires={laboratoires}
            showLaboratoireSelect
            onSubmit={handleCreate}
            onCancel={() => setEditing(null)}
          />
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
        {equipements.map((eq) =>
          editing?.id === eq.id ? (
            <EquipementForm
              key={eq.id}
              initial={eq}
              laboratoires={laboratoires}
              showLaboratoireSelect
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <div key={eq.id} className="flex items-center justify-between gap-4 bg-paper p-4">
              <div>
                <p className="font-display text-base text-ink">{eq.nom}</p>
                <p className="text-xs text-ink/50">
                  {laboNom(eq.laboratoireId)}
                  {eq.responsable && ` · ${eq.responsable.prenom} ${eq.responsable.nom}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge statut={eq.disponibilite} />
                <button onClick={() => setEditing(eq)} className="text-sm font-medium text-ink/60 hover:text-primary">
                  Modifier
                </button>
                <button onClick={() => handleDelete(eq.id)} disabled={actionId === eq.id}
                  className="text-sm font-medium text-status-panne hover:underline disabled:opacity-50">
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