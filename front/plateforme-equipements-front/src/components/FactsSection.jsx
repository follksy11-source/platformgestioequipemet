import { useState, useEffect } from "react";
import { factsApi } from "../services/api";
import Model3DViewer from "./Model3DViewer";
import Spinner from "./Spinner";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

export default function FactsSection() {
  const [facts, setFacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    factsApi
      .getAll()
      .then(setFacts)
      .catch(() => setFacts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mt-10 flex items-center justify-center gap-2 border-t border-line py-10 text-ink/60">
        <Spinner className="h-5 w-5" />
        <span className="text-sm">Chargement...</span>
      </div>
    );
  }

  if (facts.length === 0) return null; // rien à afficher tant que l'admin n'a rien publié

  const fact = facts[index];

  return (
    <div className="mt-10 border-t border-line pt-6">
      <h2 className="font-display text-xl text-ink">Facts:</h2>

      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {fact.modele3D ? (
          <Model3DViewer
            key={fact.id}
            glbUrl={`${API_ORIGIN}${fact.modele3D}`}
            className="h-80 border border-line"
          />
        ) : fact.imageCouverture ? (
          <img
            src={`${API_ORIGIN}${fact.imageCouverture}`}
            alt={fact.titre}
            className="h-80 w-full border border-line object-cover"
          />
        ) : (
          <div className="flex h-80 items-center justify-center border border-line bg-line/30 text-sm text-ink/40">
            Aucun visuel
          </div>
        )}

        <div className="flex flex-col justify-center">
          {fact.categorie && (
            <span className="font-mono text-[11px] text-primary">{fact.categorie.nom}</span>
          )}
          <h3 className="mt-1 font-display text-lg text-ink">{fact.titre}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink/70">{fact.contenu}</p>

          {facts.length > 1 && (
            <div className="mt-6 flex gap-2">
              {facts.map((f, i) => (
                <button
                  key={f.id}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 w-8 transition-colors ${
                    i === index ? "bg-primary" : "bg-line hover:bg-ink/30"
                  }`}
                  aria-label={`Voir le fait ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}