import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { laboratoiresApi } from "../services/api";
import Spinner from "../components/Spinner";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    laboratoireId: "",
  });
  const [labos, setLabos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    laboratoiresApi
      .getAll()
      .then((data) => setLabos(data.filter((l) => l.statut === "VALIDE")))
      .catch(() => {});
  }, []);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.laboratoireId) delete payload.laboratoireId;
      else payload.laboratoireId = Number(payload.laboratoireId);
      await register(payload);
      navigate("/catalogue");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-16">
      <h1 className="font-display text-2xl text-ink">Créer un compte</h1>
      <p className="mt-1 text-sm text-ink/60">
        Votre compte sera activé après validation par un administrateur.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-sm font-medium text-ink/80">Prénom</span>
            <input required value={form.prenom} onChange={update("prenom")}
              className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </label>
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-sm font-medium text-ink/80">Nom</span>
            <input required value={form.nom} onChange={update("nom")}
              className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-ink/80">Email</span>
          <input type="email" required value={form.email} onChange={update("email")}
            className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-ink/80">Mot de passe</span>
          <input type="password" required value={form.motDePasse} onChange={update("motDePasse")}
            className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-ink/80">Laboratoire (optionnel)</span>
          <select
            value={form.laboratoireId}
            onChange={update("laboratoireId")}
            className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="">Aucun pour l'instant</option>
            {labos.map((l) => (
              <option key={l.id} value={l.id}>{l.nom}</option>
            ))}
          </select>
          <span className="text-xs text-ink/50">
            Vous pourrez rejoindre ou créer un laboratoire après validation de votre compte.
          </span>
        </label>

        {error && <p className="text-sm text-status-panne">{error}</p>}

        <button type="submit" disabled={loading}
          className="mt-2 flex items-center justify-center gap-2 bg-primary py-2.5 text-sm font-medium text-paper transition-colors hover:bg-primary-dark disabled:opacity-50">
          {loading && <Spinner className="h-4 w-4 text-paper" />}
          {loading ? "Création..." : "Créer mon compte"}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink/60">
        Déjà un compte ? <Link to="/login" className="font-medium text-primary">Connectez-vous</Link>
      </p>
    </div>
  );
}
