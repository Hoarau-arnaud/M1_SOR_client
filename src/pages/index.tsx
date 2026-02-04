import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import type { ApiResponse } from "../shared/api.ts";
import { isApiResponse } from "../shared/api.ts";
import type { Poll } from "../shared/domain.ts";
import { isPollList } from "../shared/guards.ts";

const API_BASE = "http://127.0.0.1:8000";

export default function Index() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const response = await fetch(`${API_BASE}/polls`);
        if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);

        const jsonUnknown = (await response.json()) as unknown;

        // ✅ plus de <Poll[]>
        if (!isApiResponse(jsonUnknown)) {
          throw new Error("Réponse API invalide (shape).");
        }

        const json = jsonUnknown as ApiResponse<unknown>;
        if (!json.success) {
          throw new Error(`${json.error.code}: ${json.error.message}`);
        }

        if (!isPollList(json.data)) {
          throw new Error("Liste de sondages invalide (type guard).");
        }

        if (!cancelled) setPolls(json.data);
      } catch (e) {
        if (!cancelled) setErrorMsg(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main id="content" style={{ padding: 16 }}>
      <h1>📊 Real-time polls</h1>
      <p>Click on a poll below to participate.</p>

      {loading && <p>Chargement…</p>}
      {errorMsg && <p style={{ color: "crimson" }}>Erreur : {errorMsg}</p>}

      <ul>
        {polls.map((p) => (
          <li key={p.id}>
            <Link to={`/polls/${p.id}`}>{p.title}</Link>
            {p.description ? ` — ${p.description}` : ""}
          </li>
        ))}
      </ul>
    </main>
  );
}
