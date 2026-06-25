import { api } from './axios';
import type { Participant, ParticipantRegistrationPayload } from '../types/participant';

export const participantService = {
  async list() {
    const { data } = await api.get<Participant[]>('/api/participants');
    return data;
  },
  async get(id: number) {
    const { data } = await api.get<Participant>(`/api/participants/${id}`);
    return data;
  },
  async byEvent(eventId: number) {
    const { data } = await api.get<Participant[]>(`/api/participants/event/${eventId}`);
    return data;
  },
  async register(payload: ParticipantRegistrationPayload) {
    const formData = new FormData();
    formData.append('eventId', String(payload.eventId));
    formData.append('name', payload.name);
    formData.append('email', payload.email);
    if (payload.phone) formData.append('phone', payload.phone);
    if (payload.experienceYears !== undefined) formData.append('experienceYears', String(payload.experienceYears));
    const resume = payload.resume?.[0];
    const photo = payload.photo?.[0];
    if (resume) formData.append('resume', resume);
    if (photo) formData.append('photo', photo);

    const { data } = await api.post<Participant>('/api/participants/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
