import { api } from "./axios";
import type { Panelist, PanelistPayload } from "../types/panelist";

export const panelistService = {
  async list() {
    const { data } = await api.get<Panelist[]>("/api/panelists");
    return data;
  },
  async create(payload: PanelistPayload) {
    const { data } = await api.post<Panelist>("/api/panelists", payload);
    return data;
  },
  async delete(id: number) {
    await api.delete(`/api/panelists/${id}`);
  },
};
