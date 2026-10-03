import { useState, useRef } from "react";
import { uploadsApi } from "../services/api";
import Spinner from "./Spinner";

export default function Modele3DUpload({
  resource,
  resourceId,
  currentModele,
  onChange,
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  function extractUpdated(res) {
    return res.fact || res.equipement || res.data;
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const res = await uploadsApi.uploadModele3D(resource, resourceId, file);
      const updated = extractUpdated(res);
      onChange(updated.modele3D);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete() {
    if (!confirm("Supprimer le modèle 3D ?")) return;
    setUploading(true);
    try {
      const res = await uploadsApi.deleteModele3D(resource, resourceId);
      const updated = extractUpdated(res);
      onChange(updated.modele3D);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink/80">Modèle 3D</span>

      {currentModele ? (
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-ink/60">
            {currentModele.split("/").pop()}
          </span>
          <button
            type="button"
            onClick={handleDelete}
            disabled={uploading}
            className="text-xs font-medium text-status-panne hover:underline disabled:opacity-50"
          >
            Supprimer
          </button>
        </div>
      ) : (
        <p className="text-xs text-ink/40">Aucun modèle 3D</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".glb,.gltf"
        onChange={handleFile}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex w-fit items-center gap-2 border border-line px-3 py-1.5 text-xs font-medium text-ink/70 hover:border-primary hover:text-primary disabled:opacity-50"
      >
        {uploading && <Spinner className="h-3.5 w-3.5" />}
        {currentModele ? "Remplacer le modèle" : "Ajouter un modèle 3D"}
      </button>

      {error && <p className="text-xs text-status-panne">{error}</p>}
      <p className="text-[11px] text-ink/40">
        Formats .glb / .gltf, 50 Mo max.
      </p>
    </div>
  );
}
