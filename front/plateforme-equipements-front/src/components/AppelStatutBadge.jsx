import { getStatutAppel } from "../lib/publications";

const CONFIG = {
  OUVERT: { label: "Ouvert", color: "bg-status-disponible" },
  BIENTOT: { label: "Bientôt clos", color: "bg-status-maintenance" },
  CLOTURE: { label: "Clôturé", color: "bg-ink/40" },
};

export default function AppelStatutBadge({ dateCloture }) {
  const statut = getStatutAppel(dateCloture);
  if (!statut) return null;
  const config = CONFIG[statut];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink/80">
      <span className={`h-2 w-2 rounded-full ${config.color}`} />
      {config.label}
    </span>
  );
}