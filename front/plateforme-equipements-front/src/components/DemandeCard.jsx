import { useState } from "react";
import StatutDemandeBadge from "./StatutDemandeBadge";
import Spinner from "./Spinner";

const TYPE_LABELS = {
  REJOINDRE_LABORATOIRE: "Rejoindre un laboratoire",
  AJOUT_LABORATOIRE: "Création de laboratoire",
  DEVENIR_RESPONSABLE: "Devenir responsable d'équipement",
};

function targetLabel(demande) {
  if (demande.type === "REJOINDRE_LABORATOIRE") return demande.laboratoire?.nom;
  if (demande.type === "AJOUT_LABORATOIRE") return demande.nomLaboratoire || demande.laboratoire?.nom;
  if (demande.type === "DEVENIR_RESPONSABLE") return demande.equipement?.nom;
  return null;
}

export default function DemandeCard({ demande, showActions, onValider, onRefuser }) {
  const [actionLoading, setActionLoading] = useState(null); // "valider" | "refuser" | null

  async function handle(action, fn) {
    setActionLoading(action);
    try {
      await fn(demande.id);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-2 bg-paper p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-base text-ink">{TYPE_LABELS[demande.type] || demande.type}</p>
          {targetLabel(demande) && (
            <p className="text-sm text-ink/60">{targetLabel(demande)}</p>
          )}
          {demande.utilisateur && (
            <p className="mt-1 font-mono text-xs text-ink/40">
              {demande.utilisateur.prenom} {demande.utilisateur.nom} · {demande.utilisateur.email}
            </p>
          )}
        </div>
        <StatutDemandeBadge statut={demande.statut} />
      </div>

      {demande.contenuDemande && (
        <p className="text-sm text-ink/70">{demande.contenuDemande}</p>
      )}

      {showActions && demande.statut === "EN_ATTENTE" && (
        <div className="mt-2 flex gap-3 border-t border-line pt-3">
          <button
            onClick={() => handle("valider", onValider)}
            disabled={actionLoading !== null}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline disabled:opacity-50"
          >
            {actionLoading === "valider" && <Spinner className="h-3.5 w-3.5" />}
            Valider
          </button>
          <button
            onClick={() => handle("refuser", onRefuser)}
            disabled={actionLoading !== null}
            className="flex items-center gap-1.5 text-sm font-medium text-status-panne hover:underline disabled:opacity-50"
          >
            {actionLoading === "refuser" && <Spinner className="h-3.5 w-3.5" />}
            Refuser
          </button>
        </div>
      )}
    </div>
  );
}
