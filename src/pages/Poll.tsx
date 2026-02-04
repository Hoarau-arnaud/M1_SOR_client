import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { ApiResponse } from "../shared/api.ts";
import { isApiResponse } from "../shared/api.ts";
import type { Poll } from "../shared/domain.ts";
import { isPoll } from "../shared/guards.ts";

const API_BASE = "http://127.0.0.1:8000";

export default function PollPage() {
  const { selectedPoll } = useParams<{ selectedPoll: string }>();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedPoll) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const response = await fetch(`${API_BASE}/polls/${selectedPoll}`);

        if (!response.ok) {
          if (response.status === 404) throw new Error("Sondage introuvable (404).");
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        const jsonUnknown = (await response.json()) as unknown;

        // ✅ plus de <Poll>
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

          <h2>Options</h2>
          <ul>
            {poll.options.map((opt) => (
              <li key={opt.id}>
                {opt.text} — <strong>{opt.voteCount}</strong>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
