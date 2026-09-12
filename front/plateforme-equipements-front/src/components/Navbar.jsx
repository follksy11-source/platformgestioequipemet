import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_LINKS = {
  ADMINISTRATEUR: [
    { to: "/admin", label: "Administration" },
    { to: "/admin/laboratoires", label: "Laboratoires" },
    { to: "/admin/demandes", label: "Demandes" },
  ],
  RESPONSABLE_EQUIPEMENT: [{ to: "/mes-equipements", label: "Mes équipements" }],
  CHERCHEUR: [{ to: "/mes-reservations", label: "Mes réservations" }],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const roleLinks = user ? ROLE_LINKS[user.role] || [] : [];

  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl text-primary">Plateforme Équipements</span>
          <span className="font-mono text-xs text-ink/50">ANSSN · LaMERE</span>
        </Link>

        <nav className="flex items-center gap-6">
          <NavLink to="/catalogue" className={({ isActive }) =>
            `text-sm font-medium transition-colors ${isActive ? "text-primary" : "text-ink/70 hover:text-primary"}`
          }>
            Catalogue
          </NavLink>

          {roleLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? "text-primary" : "text-ink/70 hover:text-primary"}`
            }>
              {link.label}
            </NavLink>
          ))}

          {user ? (
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-ink/50">{user.prenom}</span>
              <button
                onClick={logout}
                className="text-sm font-medium text-ink/70 hover:text-primary"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-sm border border-primary px-4 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-paper"
            >
              Connexion
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
