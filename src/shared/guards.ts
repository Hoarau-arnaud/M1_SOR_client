// client/src/shared/guards.ts
import type { Poll, PollOption } from "./domain.ts";

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

const isString = (v: unknown): v is string => typeof v === "string";
const isBool = (v: unknown): v is boolean => typeof v === "boolean";
const isNumber = (v: unknown): v is number => typeof v === "number";
const isNullableString = (v: unknown): v is string | null => v === null || typeof v === "string";

export function isPollOption(v: unknown): v is PollOption {
  if (!isRecord(v)) return false;

  return (
    isString(v.id) &&
    isString(v.pollId) &&
    isString(v.text) &&
    isNumber(v.position) &&
    isString(v.createdAt) &&
    isNumber(v.voteCount)
  );
}

export function isPoll(v: unknown): v is Poll {
  if (!isRecord(v)) return false;

  return (
    isString(v.id) &&
    isString(v.ownerId) &&
    isString(v.title) &&
    isNullableString(v.description) &&
    (v.status === "ACTIVE" || v.status === "INACTIVE") &&
    isBool(v.allowGuests) &&
    isBool(v.allowMultiple) &&
    isString(v.createdAt) &&
    (v.expiresAt === null || isString(v.expiresAt)) &&
    Array.isArray(v.options) &&
    v.options.every(isPollOption)
  );
}

export function isPollList(v: unknown): v is Poll[] {
  return Array.isArray(v) && v.every(isPoll);
}
