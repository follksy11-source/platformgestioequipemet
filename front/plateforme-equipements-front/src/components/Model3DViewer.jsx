import { useRef, useEffect, useState } from "react";
import { createFactEngine } from "../lib/three-engine";
import Spinner from "./Spinner";

export default function Model3DViewer({ builder, glbUrl, className = "h-72" }) {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(!!glbUrl);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    const engine = createFactEngine(canvasRef.current, {
      builder,
      glbUrl,
      onLoading: setLoading,
      onError: () => setError(true),
    });
    return () => engine.dispose();
  }, [builder, glbUrl]);

  return (
    <div className={`relative w-full overflow-hidden bg-line/30 ${className}`}>
      <canvas ref={canvasRef} className="h-full w-full" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 text-ink/50">
          <Spinner className="h-4 w-4" />
          <span className="text-xs">Chargement du modèle 3D...</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-status-panne">
          Impossible de charger le modèle 3D.
        </div>
      )}
    </div>
  );
}