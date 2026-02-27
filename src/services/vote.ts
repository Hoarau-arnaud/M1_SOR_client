// client/src/services/vote.ts
import type { VoteAckMessage, VoteCastMessage, VotesUpdateMessage } from "../shared/ws.ts";
import { isVoteAckMessage, isVotesUpdateMessage } from "../shared/ws_guards.ts";

let ws: WebSocket | null = null;
let pollId: string | null = null;

const updateCallbacks = new Set<(update: VotesUpdateMessage) => void>();
const ackCallbacks = new Set<(ack: VoteAckMessage) => void>();

export function connect(newPollId: string): void {
  pollId = newPollId;

  // ferme l'ancien WS si besoin
  if (ws) ws.close();

  ws = new WebSocket(`ws://127.0.0.1:8000/votes/${pollId}`);

  ws.onmessage = (e) => {
    let msg: unknown;
    try {
      msg = JSON.parse(String(e.data));
    } catch {
      return;
    }

    if (isVotesUpdateMessage(msg)) {
      updateCallbacks.forEach((cb) => cb(msg));
    } else if (isVoteAckMessage(msg)) {
      ackCallbacks.forEach((cb) => cb(msg));
    }
  };

  ws.onerror = () => {
    // optionnel : tu peux remonter un ack d’erreur local
  };

  ws.onclose = () => {
    // optionnel : reset local
  };
}

export function disconnect(): void {
  if (ws) ws.close();
  ws = null;
  pollId = null;
}

export function vote(optionId: string, userId?: string): { success: boolean; error?: string } {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    return { success: false, error: "Not connected" };
  }
  if (!pollId) return { success: false, error: "Missing pollId" };

  const payload: VoteCastMessage = {
    type: "vote_cast",
    pollId,
    optionId,
    ...(userId ? { userId } : {}),
  };

  ws.send(JSON.stringify(payload));
  return { success: true };
}

export function onVoteUpdate(cb: (update: VotesUpdateMessage) => void): () => void {
  updateCallbacks.add(cb);
  return () => updateCallbacks.delete(cb);
}

export function onVoteAck(cb: (ack: VoteAckMessage) => void): () => void {
  ackCallbacks.add(cb);
  return () => ackCallbacks.delete(cb);
}