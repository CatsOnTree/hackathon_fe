import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { participantService } from "../services/participantService";
import { squadService } from "../services/squadService";

export function useParticipants(eventId?: number | null) {
  return useQuery({
    queryKey: ["participants", eventId ?? "all"],
    queryFn: () =>
      eventId != null
        ? participantService.byEvent(eventId)
        : participantService.list(),
  });
}

export function useParticipant(id: number) {
  return useQuery({
    queryKey: ["participant", id],
    queryFn: () => participantService.get(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useParticipantSquads(
  eventId: number | undefined | null,
  participantId: number | null,
) {
  return useQuery({
    queryKey: ["participant-squads", eventId, participantId],
    queryFn: () =>
      squadService.squadsForParticipant(eventId ?? undefined, participantId!),
    enabled:
      Number.isFinite(participantId!) &&
      participantId != null &&
      (eventId == null || Number.isFinite(eventId)),
  });
}

export function useRegisterParticipant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: participantService.register,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["participants"] }),
  });
}
