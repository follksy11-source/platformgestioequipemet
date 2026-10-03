import { useState, useRef } from "react";
import { uploadsApi } from "../services/api";
import Spinner from "./Spinner";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

export default function PhotoUpload({ resource, resourceId, currentPhoto, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const res = await uploadsApi.uploadPhoto(resource, resourceId, file);
      onChange(res.data.photo);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete() {
    if (!confirm("Supprimer la photo ?")) return;
    setUploading(true);
    try {
      const res = await uploadsApi.deletePhoto(resource, resourceId);
      onChange(res.data.photo);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink/80">Photo</span>

      {currentPhoto ? (
        <div className="relative w-fit">
          <img
            src={`${API_ORIGIN}${currentPhoto}`}
            alt="Équipement"
            className="h-32 w-32 border border-line object-cover"
          />
          <button
            type="button"
            onClick={handleDelete}
            disabled={uploading}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-status-panne text-xs text-paper disabled:opacity-50"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="flex h-32 w-32 items-center justify-center border border-dashed border-line text-xs text-ink/40">
          Aucune photo
        </div>
      )}

      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleFile} className="hidden" />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex w-fit items-center gap-2 border border-line px-3 py-1.5 text-xs font-medium text-ink/70 hover:border-primary hover:text-primary disabled:opacity-50"
      >
        {uploading && <Spinner className="h-3.5 w-3.5" />}
        {currentPhoto ? "Changer la photo" : "Ajouter une photo"}
      </button>

      {error && <p className="text-xs text-status-panne">{error}</p>}
      <p className="text-[11px] text-ink/40">JPG, PNG ou WebP, 10 Mo max.</p>
    </div>
  );
}