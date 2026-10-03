import { useState, useEffect } from "react";
import { publicationsApi } from "../../services/api";
import StatutPublicationBadge from "../../components/StatutPublicationBadge";
import Spinner from "../../components/Spinner";

const TYPE_OPTIONS = [
  { value: "ARTICLE", label: "Article" },
  { value: "ANNONCE", label: "Annonce" },
  { value: "APPEL_A_PROJET", label: "Appel à projet" },
  { value: "APPEL_A_CANDIDATURE", label: "Appel à candidature" },
];

function PublicationForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    type: "ARTICLE",
    titre: "",
    contenu: "",
    statut: "BROUILLON",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function update(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Choisis une image JPG, PNG ou WEBP.");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 10 Mo.");
      e.target.value = "";
      return;
    }

    setError(null);
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("type", form.type);
      formData.append("titre", form.titre);
      formData.append("contenu", form.contenu);
      formData.append("statut", form.statut);

      if (image) {
        formData.append("image", image);
      }

      await onSubmit(formData);
    } catch (err) {
      setError(err.message || "Erreur lors de la création.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 border border-line bg-paper p-5"
    >
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink/80">Type</span>
        <select
          value={form.type}
          onChange={update("type")}
          className="border border-line bg-paper px-3 py-2 text-sm"
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink/80">Titre</span>
        <input
          required
          value={form.titre}
          onChange={update("titre")}
          className="border border-line bg-paper px-3 py-2 text-sm"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink/80">Contenu</span>
        <textarea
          rows={4}
          required
          value={form.contenu}
          onChange={update("contenu")}
          className="border border-line bg-paper px-3 py-2 text-sm"
        />
      </label>

      {/* Sélection de l'image */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink/80">
          Image de la publication (facultative)
        </span>

        <label className="w-fit cursor-pointer border border-line px-4 py-2 text-sm font-medium text-ink hover:border-primary hover:text-primary">
          Choisir une image
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>

        {image && (
          <p className="text-xs text-ink/60">
            {image.name} — {(image.size / 1024 / 1024).toFixed(2)} Mo
          </p>
        )}

        {preview && (
          <div className="mt-2">
            <img
              src={preview}
              alt="Aperçu de la publication"
              className="max-h-64 max-w-full border border-line object-contain"
            />

            <button
              type="button"
              onClick={() => {
                setImage(null);
                setPreview(null);
              }}
              className="mt-2 text-sm text-status-panne hover:underline"
            >
              Retirer l'image
            </button>
          </div>
        )}
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink/80">Statut initial</span>
        <select
          value={form.statut}
          onChange={update("statut")}
          className="w-40 border border-line bg-paper px-3 py-2 text-sm"
        >
          <option value="BROUILLON">Brouillon</option>
          <option value="PUBLIE">Publié</option>
        </select>
      </label>

      {error && <p className="text-sm text-status-panne">{error}</p>}

      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-paper hover:bg-primary-dark disabled:opacity-50"
        >
          {loading && <Spinner className="h-4 w-4 text-paper" />}
          {loading ? "Création..." : "Créer"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-ink/60 hover:text-ink"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
export default function AdminPublications() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [actionId, setActionId] = useState(null);

  function refresh() {
    setLoading(true);
    publicationsApi
      .admin()
      .then(setPublications)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

async function handleCreate(formData) {
  await publicationsApi.create(formData);
  setCreating(false);
  refresh();
}

  async function handle(action, id) {
    setActionId(id);
    try {
      await publicationsApi[action](id);
      refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Supprimer cette publication ?")) return;
    handle("remove", id);
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-end justify-between border-b border-line pb-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Publications</h1>
          <p className="mt-1 font-mono text-xs text-ink/50">
            {publications.length} publication(s)
          </p>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="bg-primary px-4 py-2 text-sm font-medium text-paper hover:bg-primary-dark"
          >
            + Nouvelle publication
          </button>
        )}
      </div>

      {creating && (
        <div className="mt-6">
          <PublicationForm
            onSubmit={handleCreate}
            onCancel={() => setCreating(false)}
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

      <div className="mt-6 flex flex-col gap-px bg-line">
        {publications.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-4 bg-paper p-4"
          >
            <div>
              <span className="font-mono text-[11px] text-primary">
                {p.type}
              </span>
              <p className="font-display text-base text-ink">{p.titre}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatutPublicationBadge statut={p.statut} />
              {p.statut === "BROUILLON" ? (
                <button
                  onClick={() => handle("publier", p.id)}
                  disabled={actionId === p.id}
                  className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
                >
                  Publier
                </button>
              ) : (
                <button
                  onClick={() => handle("depublier", p.id)}
                  disabled={actionId === p.id}
                  className="text-sm font-medium text-status-maintenance hover:underline disabled:opacity-50"
                >
                  Dépublier
                </button>
              )}
              <button
                onClick={() => handleDelete(p.id)}
                disabled={actionId === p.id}
                className="text-sm font-medium text-status-panne hover:underline disabled:opacity-50"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
