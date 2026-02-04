// client/src/shared/domain.ts

export type PollStatus = "ACTIVE" | "INACTIVE";

export interface PollOption {
  id: string;
  pollId: string;
  text: string;
  position: number;
  createdAt: string;
  voteCount: number;
}

export interface Poll {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  status: PollStatus;
  allowGuests: boolean;
  allowMultiple: boolean;
  createdAt: string;
  expiresAt: string | null;
  options: PollOption[];
}
