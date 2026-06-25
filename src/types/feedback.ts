export type Recommendation = 'HIRE' | 'HOLD' | 'REJECT';

export interface Feedback {
  id: number;
  participantId: number;
  panelistId: number;
  technicalRating: number;
  communicationRating: number;
  recommendation: Recommendation;
  comments?: string;
}

export type FeedbackPayload = Omit<Feedback, 'id'>;
