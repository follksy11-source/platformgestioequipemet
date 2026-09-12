import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", motDePasse: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(form);
      navigate("/catalogue");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-16">
      <h1 className="font-display text-2xl text-ink">Connexion</h1>
      <p className="mt-1 text-sm text-ink/60">
        Accédez au catalogue et à vos réservations.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-ink/80">Email</span>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-ink/80">Mot de passe</span>
          <input
            type="password"
            required
            value={form.motDePasse}
            onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
            className="border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>

        {error && <p className="text-sm text-status-panne">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex items-center justify-center gap-2 bg-primary py-2.5 text-sm font-medium text-paper transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          {loading && <Spinner className="h-4 w-4 text-paper" />}
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink/60">
        Pas encore de compte ?{" "}
        <Link to="/register" className="font-medium text-primary">
          Inscrivez-vous
        </Link>
      </p>
    </div>
  );
}
