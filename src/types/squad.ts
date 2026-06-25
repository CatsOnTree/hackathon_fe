import type { Participant } from './participant';

export interface Squad {
  id: number;
  eventId: number;
  name: string;
}

export interface SquadMember {
  id: number;
  squadId: number;
  participantId: number;
}

export interface SquadWithMembers extends Squad {
  members?: Participant[];
}

export type SquadPayload = Omit<Squad, 'id'>;
