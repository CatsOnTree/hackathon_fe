import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { participantService } from "../services/participantService";

export function useParticipants() {
  return useQuery({
    queryKey: ["participants"],
    queryFn: participantService.list,
  });
}

export function useParticipant(id: number) {
  return useQuery({
    queryKey: ["participant", id],
    queryFn: () => participantService.get(id),
    enabled: Number.isFinite(id) && id > 0,
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
