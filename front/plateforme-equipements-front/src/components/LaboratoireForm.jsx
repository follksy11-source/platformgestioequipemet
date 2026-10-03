import { useState, useEffect } from "react";
import { institutionsApi } from "../services/api";
import Spinner from "./Spinner";

export default function LaboratoireForm({ initial, onSubmit, onCancel }) {
  const [institutions, setInstitutions] = useState([]);
  const [form, setForm] = useState({
    nom: initial?.nom || "",
    description: initial?.description || "",
    institutionId: initial?.institutionId || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    institutionsApi.getAll().then(setInstitutions).catch(() => {});
  }, []);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit({
        ...form,
        institutionId: form.institutionId ? Number(form.institutionId) : null,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 border border-line bg-paper p-5">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink/80">Nom du laboratoire</span>
        <input required value={form.nom} onChange={update("nom")}
          className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none" />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink/80">Description</span>
        <textarea rows={2} value={form.description} onChange={update("description")}
          className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none" />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink/80">Institution</span>
        <select required value={form.institutionId} onChange={update("institutionId")}
          className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none">
          <option value="">Sélectionner...</option>
          {institutions.map((i) => (
            <option key={i.id} value={i.id}>
              {i.nom} ({i._count?.laboratoires ?? 0} labo{i._count?.laboratoires !== 1 ? "s" : ""})
            </option>
          ))}
        </select>
      </label>

      {error && <p className="text-sm text-status-panne">{error}</p>}

      <div className="mt-2 flex gap-2">
        <button type="submit" disabled={loading}
          className="flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-paper hover:bg-primary-dark disabled:opacity-50">
          {loading && <Spinner className="h-4 w-4 text-paper" />}
          {initial ? "Enregistrer" : "Créer"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-ink/60 hover:text-ink">
          Annuler
        </button>
      </div>
    </form>
  );
}