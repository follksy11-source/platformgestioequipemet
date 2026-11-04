import { useState, useEffect } from "react";
import { institutionsApi } from "../../services/api";
import Spinner from "../../components/Spinner";

function InstitutionForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    nom: initial?.nom || "",
    adresse: initial?.adresse || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 border border-line bg-paper p-5"
    >
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink/80">
          Nom de l'institution
        </span>
        <input
          required
          value={form.nom}
          onChange={update("nom")}
          placeholder="Ex : Université de Kara"
          className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink/80">
          Adresse (facultative)
        </span>
        <input
          value={form.adresse}
          onChange={update("adresse")}
          placeholder="Ex : Kara, Togo"
          className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </label>

      {error && <p className="text-sm text-status-panne">{error}</p>}

      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-paper hover:bg-primary-dark disabled:opacity-50"
        >
          {loading && <Spinner className="h-4 w-4 text-paper" />}
          {initial ? "Enregistrer" : "Créer"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-ink/60 hover:text-ink"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

export default function AdminInstitutions() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null); // null | "new" | institution
  const [actionId, setActionId] = useState(null);

  function refresh() {
    setLoading(true);
    institutionsApi
      .getAll()
      .then(setInstitutions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function handleCreate(data) {
    await institutionsApi.create(data);
    setEditing(null);
    refresh();
  }

  async function handleUpdate(data) {
    await institutionsApi.update(editing.id, data);
    setEditing(null);
    refresh();
  }

  async function handleDelete(inst) {
    if (!confirm(`Supprimer l'institution « ${inst.nom} » ?`)) return;
    setActionId(inst.id);
    try {
      await institutionsApi.remove(inst.id);
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
          <h1 className="font-display text-3xl text-ink">Institutions</h1>
          <p className="mt-1 font-mono text-xs text-ink/50">
            {institutions.length} enregistrée(s)
          </p>
        </div>
        {editing === null && (
          <button
            onClick={() => setEditing("new")}
            className="bg-primary px-4 py-2 text-sm font-medium text-paper hover:bg-primary-dark"
          >
            + Nouvelle institution
          </button>
        )}
      </div>

      {editing === "new" && (
        <div className="mt-6">
          <InstitutionForm
            onSubmit={handleCreate}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {loading && (
        <div className="mt-6 flex items-center gap-2 text-ink/60">
          <Spinner className="h-5 w-5" />
          <span className="text-sm">Chargement...</span>
        </div>
      )}
      {error && <p className="mt-6 text-sm text-status-panne">{error}</p>}
      {!loading && !error && institutions.length === 0 && editing === null && (
        <p className="mt-6 text-sm text-ink/60">
          Aucune institution pour le moment.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-px bg-line">
        {institutions.map((inst) => {
          const nbLabos = inst._count?.laboratoires ?? 0;
          return editing?.id === inst.id ? (
            <InstitutionForm
              key={inst.id}
              initial={inst}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <div
              key={inst.id}
              className="flex items-center justify-between gap-4 bg-paper p-4"
            >
              <div>
                <p className="font-display text-base text-ink">{inst.nom}</p>
                <p className="text-xs text-ink/50">
                  {inst.adresse || "Adresse non renseignée"} · {nbLabos}{" "}
                  laboratoire{nbLabos > 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditing(inst)}
                  className="text-sm font-medium text-ink/60 hover:text-primary"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(inst)}
                  disabled={actionId === inst.id || nbLabos > 0}
                  title={
                    nbLabos > 0
                      ? "Impossible : des laboratoires sont rattachés"
                      : undefined
                  }
                  className="text-sm font-medium text-status-panne hover:underline disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
                >
                  Supprimer
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
