const STATUS_CONFIG = {
  INSTALLE_FONCTIONNEL: { label: "Disponible", color: "bg-status-disponible" },
  PRESENT_NON_INSTALLE: { label: "Non installé", color: "bg-status-maintenance" },
  EN_COURS_DE_LIVRAISON: { label: "En livraison", color: "bg-status-maintenance" },
  PROJET_EN_COURS: { label: "Projet en cours", color: "bg-ink/40" },
};

export default function StatusBadge({ statut }) {
  const config = STATUS_CONFIG[statut] || { label: statut, color: "bg-ink/40" };
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink/80">
      <span className={`h-2 w-2 rounded-full ${config.color}`} />
      {config.label}
    </span>
  );
}
