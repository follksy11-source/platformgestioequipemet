import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { messagesApi } from "../services/api";
import Spinner from "../components/Spinner";

function formatDate(d) {
  return new Date(d).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

export default function Messages() {
  const { user } = useAuth();
  const [allMessages, setAllMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  function refresh() {
    setLoading(true);
    Promise.all([messagesApi.recus(), messagesApi.envoyes()])
      .then(([recusData, envoyesData]) => {
        const recus = recusData.messages.map((m) => ({ ...m, direction: "recu" }));
        const envoyes = envoyesData.messages.map((m) => ({ ...m, direction: "envoye" }));
        setAllMessages([...recus, ...envoyes]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  // Regroupe tous les messages par interlocuteur
  const conversations = useMemo(() => {
    const map = new Map();
    for (const m of allMessages) {
      const interlocuteur = m.direction === "recu" ? m.expediteur : m.destinataire;
      if (!interlocuteur) continue;
      if (!map.has(interlocuteur.id)) {
        map.set(interlocuteur.id, { user: interlocuteur, messages: [] });
      }
      map.get(interlocuteur.id).messages.push(m);
    }
    const list = Array.from(map.values());
    for (const conv of list) {
      conv.messages.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    list.sort((a, b) => {
      const lastA = a.messages[a.messages.length - 1]?.date;
      const lastB = b.messages[b.messages.length - 1]?.date;
      return new Date(lastB) - new Date(lastA);
    });
    return list;
  }, [allMessages]);

  const activeConv = conversations.find((c) => c.user.id === selectedUserId);

  // Marque les messages reçus non lus comme lus à l'ouverture de la conversation
  useEffect(() => {
    if (!activeConv) return;
    const nonLus = activeConv.messages.filter((m) => m.direction === "recu" && m.statut === "ENVOYE");
    nonLus.forEach((m) => {
      messagesApi.marquerLu(m.id).then(() => {
        setAllMessages((prev) =>
          prev.map((msg) => (msg.id === m.id ? { ...msg, statut: "LU" } : msg))
        );
      });
    });
  }, [selectedUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleReply(e) {
    e.preventDefault();
    if (!reply.trim() || !activeConv) return;
    setSending(true);
    try {
      const lastEquipementId = [...activeConv.messages].reverse().find((m) => m.equipementId)?.equipementId;
      const sent = await messagesApi.send({
        destinataireId: activeConv.user.id,
        contenu: reply,
        ...(lastEquipementId ? { equipementId: lastEquipementId } : {}),
      });
      setReply("");
      setAllMessages((prev) => [...prev, { ...sent.data, direction: "envoye" }]);
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-ink/60">
        <Spinner className="h-5 w-5" />
        <span className="text-sm">Chargement des messages...</span>
      </div>
    );
  }

  if (error) {
    return <p className="mx-auto max-w-3xl px-6 py-16 text-sm text-status-panne">{error}</p>;
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-5xl">
      {/* Liste des conversations */}
      <div className="w-72 shrink-0 overflow-y-auto border-r border-line">
        <h1 className="border-b border-line px-4 py-4 font-display text-xl text-ink">Messages</h1>
        {conversations.length === 0 && (
          <p className="px-4 py-6 text-sm text-ink/60">Aucune conversation pour l'instant.</p>
        )}
        {conversations.map((conv) => {
          const last = conv.messages[conv.messages.length - 1];
          const hasUnread = conv.messages.some((m) => m.direction === "recu" && m.statut === "ENVOYE");
          return (
            <button
              key={conv.user.id}
              onClick={() => setSelectedUserId(conv.user.id)}
              className={`flex w-full flex-col gap-0.5 border-b border-line px-4 py-3 text-left transition-colors ${
                selectedUserId === conv.user.id ? "bg-primary/5" : "hover:bg-primary/5"
              }`}
            >
              <span className={`text-sm ${hasUnread ? "font-semibold text-ink" : "font-medium text-ink"}`}>
                {conv.user.prenom} {conv.user.nom}
                {hasUnread && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-primary" />}
              </span>
              <span className="truncate text-xs text-ink/50">{last?.contenu}</span>
            </button>
          );
        })}
      </div>

      {/* Fil de la conversation */}
      <div className="flex flex-1 flex-col">
        {!activeConv ? (
          <div className="flex flex-1 items-center justify-center text-sm text-ink/50">
            Sélectionnez une conversation
          </div>
        ) : (
          <>
            <div className="border-b border-line px-6 py-4">
              <p className="font-display text-lg text-ink">
                {activeConv.user.prenom} {activeConv.user.nom}
              </p>
              <p className="text-xs text-ink/50">{activeConv.user.email}</p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="flex flex-col gap-3">
                {activeConv.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-md rounded-sm px-4 py-2.5 text-sm ${
                      m.direction === "envoye"
                        ? "self-end bg-primary text-paper"
                        : "self-start border border-line bg-paper text-ink"
                    }`}
                  >
                    {m.equipement && (
                      <Link
                        to={`/equipements/${m.equipement.id}`}
                        className={`mb-1 block font-mono text-[11px] underline ${
                          m.direction === "envoye" ? "text-paper/80" : "text-primary"
                        }`}
                      >
                        à propos de : {m.equipement.nom}
                      </Link>
                    )}
                    <p>{m.contenu}</p>
                    <p className={`mt-1 text-[10px] ${m.direction === "envoye" ? "text-paper/60" : "text-ink/40"}`}>
                      {formatDate(m.date)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleReply} className="flex gap-2 border-t border-line p-4">
              <input
                type="text"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Répondre..."
                className="flex-1 border border-line bg-paper px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                disabled={sending || !reply.trim()}
                className="flex items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-paper hover:bg-primary-dark disabled:opacity-50"
              >
                {sending && <Spinner className="h-4 w-4 text-paper" />}
                Envoyer
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}