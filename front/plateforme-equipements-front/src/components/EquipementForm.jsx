import { useState } from "react";
import Spinner from "./Spinner";
import PhotoUpload from "./PhotoUpload";
import Modele3DUpload from "./Modele3DUpload";

const DISPONIBILITE_OPTIONS = [
  { value: "INSTALLE_FONCTIONNEL", label: "Installé, fonctionnel" },
  { value: "PRESENT_NON_INSTALLE", label: "Présent, non installé" },
  { value: "EN_COURS_DE_LIVRAISON", label: "En cours de livraison" },
  { value: "PROJET_EN_COURS", label: "Projet en cours" },
];

export default function EquipementForm({
  initial,
  laboratoires,
  showLaboratoireSelect,
  onSubmit,
  onCancel,
  onPhotoChange,
  onModeleChange,
}) {
  const [form, setForm] = useState({
    nom: initial?.nom || "",
    description: initial?.description || "",
    caracteristiquesTechniques: initial?.caracteristiquesTechniques || "",
    disponibilite: initial?.disponibilite || "PRESENT_NON_INSTALLE",
    laboratoireId: initial?.laboratoireId || "",
  });
  const [photo, setPhoto] = useState(initial?.photo || null);
  const [modele3D, setModele3D] = useState(initial?.modele3D || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = { ...form };
      if (payload.laboratoireId) payload.laboratoireId = Number(payload.laboratoireId);
      else delete payload.laboratoireId;
      await onSubmit(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 border border-line bg-paper p-5">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink/80">Nom</span>
        <input required value={form.nom} onChange={update("nom")}
          className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none" />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink/80">Description</span>
        <textarea rows={2} value={form.description} onChange={update("description")}
          className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none" />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink/80">Caractéristiques techniques</span>
        <textarea rows={2} value={form.caracteristiquesTechniques} onChange={update("caracteristiquesTechniques")}
          className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none" />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink/80">Disponibilité</span>
        <select value={form.disponibilite} onChange={update("disponibilite")}
          className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none">
          {DISPONIBILITE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>

      {showLaboratoireSelect && (
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-ink/80">Laboratoire</span>
          <select required value={form.laboratoireId} onChange={update("laboratoireId")}
            className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none">
            <option value="">Sélectionner...</option>
            {laboratoires?.map((l) => (
              <option key={l.id} value={l.id}>{l.nom}</option>
            ))}
          </select>
        </label>
      )}

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

      {initial && (
        <div className="flex gap-6 border-t border-line pt-3">
          <PhotoUpload
            resource="equipements"
            resourceId={initial.id}
            currentPhoto={photo}
            onChange={(newPhoto) => {
              setPhoto(newPhoto);
              onPhotoChange?.(newPhoto);
            }}
          />
          <Modele3DUpload
            resource="equipements"
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