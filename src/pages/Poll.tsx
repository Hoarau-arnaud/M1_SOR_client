// client/src/pages/Poll.tsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { ApiResponse } from "../shared/api.ts";
import { isApiResponse } from "../shared/api.ts";
import type { Poll } from "../shared/domain.ts";
import { isPoll } from "../shared/guards.ts";

import { connect, disconnect, onVoteAck, onVoteUpdate, vote } from "../services/vote.ts";
import type { VoteAckMessage, VotesUpdateMessage } from "../shared/ws.ts";

const API_BASE = "http://127.0.0.1:8000";

export default function PollPage() {
  const { selectedPoll } = useParams<{ selectedPoll: string }>();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [voteError, setVoteError] = useState<string | null>(null);

  // ---------- TP3 : Charger le sondage ----------
  useEffect(() => {
    if (!selectedPoll) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);
        setVoteError(null);

        const response = await fetch(`${API_BASE}/polls/${selectedPoll}`);

        if (!response.ok) {
          if (response.status === 404) throw new Error("Sondage introuvable (404).");
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        const jsonUnknown = (await response.json()) as unknown;

        if (!isApiResponse(jsonUnknown)) {
          throw new Error("Réponse API invalide (shape).");
        }

        const api = jsonUnknown as ApiResponse<unknown>;
        if (!api.success) {
          throw new Error(`${api.error.code}: ${api.error.message}`);
        }

        if (!isPoll(api.data)) {
          throw new Error("Sondage invalide (type guard).");
        }

        if (!cancelled) setPoll(api.data);
      } catch (e) {
        if (!cancelled) {
          setPoll(null);
          setErrorMsg(e instanceof Error ? e.message : "Erreur inconnue");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedPoll]);

  // ---------- TP4 : Connexion WS après chargement ----------
  useEffect(() => {
    if (!poll) return;

    connect(poll.id);
    return () => disconnect();
  }, [poll]);

  // ---------- TP4 : Ack (vote traité / erreur) ----------
  useEffect(() => {
    return onVoteAck((ack: VoteAckMessage) => {
      if (!ack.success) {
        setVoteError(ack.error?.message || "Vote failed");
      } else {
        setVoteError(null);
      }
    });
  }, []);

  // ---------- TP4 : Mise à jour des compteurs ----------
  useEffect(() => {
    return onVoteUpdate((update: VotesUpdateMessage) => {
      setPoll((prev) => {
        if (!prev) return prev;
        if (prev.id !== update.pollId) return prev;

        return {
          ...prev,
          options: prev.options.map((opt) =>
            opt.id === update.optionId ? { ...opt, voteCount: update.voteCount } : opt
          ),
        };
      });
    });
  }, []);

  function handleVote(optionId: string) {
    const r = vote(optionId /*, userId optionnel */);
    if (!r.success) setVoteError(r.error ?? "Vote failed");
  }

  return (
    <main id="content" style={{ padding: 16 }}>
      <p>
        <Link to="/">← Back</Link>
      </p>

      {loading && <p>Loading poll…</p>}
      {!loading && errorMsg && <p style={{ color: "crimson" }}>Error: {errorMsg}</p>}

      {!loading && !errorMsg && poll && (
        <>
          <h1>{poll.title}</h1>
          {poll.description && <p>{poll.description}</p>}

          {voteError && <p style={{ color: "crimson" }}>Vote error: {voteError}</p>}

          <h2>Options</h2>
          <ul>
            {poll.options.map((opt) => (
              <li key={opt.id}>
                <button type="button" onClick={() => handleVote(opt.id)}>
                  Vote
                </button>{" "}
                {opt.text} — <strong>{opt.voteCount}</strong>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}