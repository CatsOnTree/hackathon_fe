import { api } from './axios';
import type { Feedback, FeedbackPayload } from '../types/feedback';

export const feedbackService = {
  async list() {
    const { data } = await api.get<Feedback[]>('/api/feedback');
    return data;
  },
  async create(payload: FeedbackPayload) {
    const { data } = await api.post<Feedback>('/api/feedback', payload);
    return data;
  },
};
