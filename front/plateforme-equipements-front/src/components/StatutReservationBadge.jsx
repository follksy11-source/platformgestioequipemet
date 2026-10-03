const CONFIG = {
  EN_ATTENTE: { label: "En attente", color: "bg-status-maintenance" },
  ACCEPTEE: { label: "Acceptée", color: "bg-status-disponible" },
  REFUSEE: { label: "Refusée", color: "bg-status-panne" },
  ANNULEE: { label: "Annulée", color: "bg-ink/40" },
  TERMINEE: { label: "Terminée", color: "bg-ink/40" },
};

export default function StatutReservationBadge({ statut }) {
  const config = CONFIG[statut] || { label: statut, color: "bg-ink/40" };
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink/80">
      <span className={`h-2 w-2 rounded-full ${config.color}`} />
      {config.label}
    </span>
  );
}