import { api } from './axios';
import type { Assignment, AssignmentPayload } from '../types/assignment';

export const assignmentService = {
  async list() {
    const { data } = await api.get<Assignment[]>('/api/assignments');
    return data;
  },
  async create(payload: AssignmentPayload) {
    const { data } = await api.post<Assignment>('/api/assignments', payload);
    return data;
  },
};
