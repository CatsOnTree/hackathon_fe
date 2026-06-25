export type EventStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'COMPLETED';

export interface RecruitmentEvent {
  id: number;
  name: string;
  description?: string;
  eventDate: string;
  status: EventStatus;
  registrationUrl?: string;
  qrCodeUrl?: string;
}

export interface EventPayload {
  name: string;
  description?: string;
  eventDate: string;
  status?: EventStatus;
}
