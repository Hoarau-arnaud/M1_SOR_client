// client/src/shared/ws_guards.ts
import type { VoteAckMessage, VotesUpdateMessage } from "./ws.ts";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export function isVotesUpdateMessage(v: unknown): v is VotesUpdateMessage {
  if (!isRecord(v)) return false;
  return (
    v.type === "votes_update" &&
    typeof v.pollId === "string" &&
    typeof v.optionId === "string" &&
    typeof v.voteCount === "number"
  );
}

export function isVoteAckMessage(v: unknown): v is VoteAckMessage {
  if (!isRecord(v)) return false;
  // error est optionnel
  const hasValidError =
    v.error === undefined ||
    (isRecord(v.error) && typeof v.error.code === "string" && typeof v.error.message === "string");

  return (
    v.type === "vote_ack" &&
    typeof v.pollId === "string" &&
    typeof v.optionId === "string" &&
    typeof v.success === "boolean" &&
    hasValidError
  );
}