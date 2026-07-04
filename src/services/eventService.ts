import { api } from "./axios";
import type { EventPayload, RecruitmentEvent } from "../types/event";

export const eventService = {
  async list() {
    const { data } = await api.get<RecruitmentEvent[]>("/api/events");
    return data;
  },
  async get(id: number) {
    const { data } = await api.get<RecruitmentEvent>(`/api/events/${id}`);
    return data;
  },
  async create(payload: EventPayload) {
    const { data } = await api.post<RecruitmentEvent>("/api/events", payload);
    return data;
  },
  async delete(id: number) {
    await api.delete(`/api/events/${id}`);
  },
};
