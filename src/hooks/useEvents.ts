import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eventService } from '../services/eventService';

export function useEvents() {
  return useQuery({ queryKey: ['events'], queryFn: eventService.list });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });
}
