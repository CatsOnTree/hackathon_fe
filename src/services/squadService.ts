import { api } from "./axios";
import type { Participant } from "../types/participant";
import type {
  Squad,
  SquadMember,
  SquadPayload,
  SquadWithMembers,
} from "../types/squad";

export const squadService = {
  async create(payload: SquadPayload) {
    const { data } = await api.post<Squad>("/api/squads", payload);
    return data;
  },
  async byEvent(eventId: number) {
    const { data } = await api.get<Squad[]>(`/api/squads/event/${eventId}`);
    return data;
  },
  async addMember(squadId: number, participantId: number) {
    const { data } = await api.post<SquadMember>(
      `/api/squads/${squadId}/members/${participantId}`,
    );
    return data;
  },
  async members(squadId: number) {
    const { data } = await api.get<Participant[]>(
      `/api/squads/${squadId}/members`,
    );
    return data;
  },
  async delete(id: number) {
    await api.delete(`/api/squads/${id}`);
  },
  async squadsForParticipant(
    eventId: number | undefined,
    participantId: number,
  ) {
    if (!eventId) return [];

    try {
      const squads = await this.byEvent(eventId);
      const squadsWithMembers: SquadWithMembers[] = [];

      for (const squad of squads) {
        const members = await this.members(squad.id);
        if (members.some((member) => member.id === participantId)) {
          squadsWithMembers.push({
            ...squad,
            members,
          });
        }
      }

      return squadsWithMembers;
    } catch {
      return [];
    }
  },
};
