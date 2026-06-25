export interface Assignment {
  id: number;
  participantId: number;
  panelistId: number;
}

export type AssignmentPayload = Omit<Assignment, 'id'>;
