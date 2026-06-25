import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { participantService } from '../services/participantService';

export function useParticipants() {
  return useQuery({ queryKey: ['participants'], queryFn: participantService.list });
}

export function useRegisterParticipant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: participantService.register,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['participants'] }),
  });
}
