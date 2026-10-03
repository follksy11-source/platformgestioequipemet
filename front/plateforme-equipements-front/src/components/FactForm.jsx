import { useState, useEffect } from "react";
import { factsApi } from "../services/api";
import Spinner from "./Spinner";
import Modele3DUpload from "./Modele3DUpload";

export default function FactForm({ initial, onSubmit, onCancel, onModeleChange }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    titre: initial?.titre || "",
    contenu: initial?.contenu || "",
    imageCouverture: initial?.imageCouverture || "",
    categorieId: initial?.categorieId || "",
  });
  const [modele3D, setModele3D] = useState(initial?.modele3D || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    factsApi.getCategories().then(setCategories).catch(() => {});
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
        categorieId: form.categorieId ? Number(form.categorieId) : undefined,
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
        <span className="text-sm font-medium text-ink/80">Titre</span>
        <input required value={form.titre} onChange={update("titre")}
          className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none" />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink/80">Contenu</span>
        <textarea rows={4} required value={form.contenu} onChange={update("contenu")}
          className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none" />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink/80">Image de couverture (URL, optionnel)</span>
        <input value={form.imageCouverture} onChange={update("imageCouverture")}
          className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none" />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink/80">Catégorie</span>
        <select value={form.categorieId} onChange={update("categorieId")}
          className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none">
          <option value="">Sans catégorie</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.nom}</option>
          ))}
        </select>
      </label>

      {error && <p className="text-sm text-status-panne">{error}</p>}

      {!initial && (
        <p className="text-xs text-ink/50">
          Le modèle 3D s'ajoute juste après la création du fact.
        </p>
      )}

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

      {/* La condition est bien sur `initial` seul, pas sur `initial?.modele3D` —
          sinon le bouton d'upload n'apparaît jamais quand il n'y a pas encore de modèle. */}
      {initial && (
        <div className="border-t border-line pt-3">
          {!modele3D && (
            <p className="mb-2 text-xs text-status-maintenance">
              Un modèle 3D est requis avant de pouvoir publier ce fact.
            </p>
          )}
          <Modele3DUpload
            resource="facts"
            resourceId={initial.id}
            currentModele={modele3D}
            onChange={(newModele) => {
              setModele3D(newModele);
              onModeleChange?.(newModele);
            }}
          />
        </div>
      )}
    </form>
  );
}