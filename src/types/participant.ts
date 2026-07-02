export type ParticipantStatus =
  | "REGISTERED"
  | "CHECKED_IN"
  | "ASSIGNED"
  | "SELECTED"
  | "REJECTED";

export interface Participant {
  id: number;
  participantCode: string;
  eventId?: number;
  name: string;
  email: string;
  phone?: string;
  experienceYears?: number;
  skills?: string;
  aiScore?: number;
  resumeUrl?: string | null;
  photoUrl?: string | null;
  resumeAnalysisJson?: string | null;
  status: ParticipantStatus;
}

export interface ParticipantRegistrationPayload {
  eventId: number;
  name: string;
  email: string;
  phone?: string;
  experienceYears?: number;
  resume?: FileList;
  photo?: FileList;
}
