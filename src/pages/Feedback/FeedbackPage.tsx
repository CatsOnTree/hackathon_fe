import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { MessageSquarePlus } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { DataTable, type Column } from '../../components/common/DataTable';
import { PageHeader } from '../../components/common/PageHeader';
import { useParticipants } from '../../hooks/useParticipants';
import { feedbackService } from '../../services/feedbackService';
import { panelistService } from '../../services/panelistService';
import type { Feedback, FeedbackPayload } from '../../types/feedback';
import { getApiErrorMessage } from '../../utils/api';
import { statusTone } from '../../utils/status';
import { RoleGuard } from '../../utils/roleGuard';

export function FeedbackPage() {
  const queryClient = useQueryClient();
  const { data: participants = [] } = useParticipants();
  const { data: panelists = [] } = useQuery({ queryKey: ['panelists'], queryFn: panelistService.list });
  const { data: feedback = [], isLoading } = useQuery({ queryKey: ['feedback'], queryFn: feedbackService.list });
  const { register, handleSubmit, reset } = useForm<FeedbackPayload>({ defaultValues: { recommendation: 'HIRE', technicalRating: 5, communicationRating: 5 } });
  const createFeedback = useMutation({
    mutationFn: feedbackService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createFeedback.mutateAsync({
        ...values,
        participantId: Number(values.participantId),
        panelistId: Number(values.panelistId),
        technicalRating: Number(values.technicalRating),
        communicationRating: Number(values.communicationRating),
      });
      toast.success('Feedback submitted');
      reset({ recommendation: 'HIRE', technicalRating: 5, communicationRating: 5 });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  });

  const columns: Column<Feedback>[] = [
    { key: 'participant', header: 'Participant', render: (row) => participants.find((item) => item.id === row.participantId)?.name || row.participantId },
    { key: 'panelist', header: 'Panelist', render: (row) => panelists.find((item) => item.id === row.panelistId)?.name || row.panelistId },
    { key: 'technical', header: 'Technical', render: (row) => row.technicalRating },
    { key: 'communication', header: 'Communication', render: (row) => row.communicationRating },
    { key: 'recommendation', header: 'Recommendation', render: (row) => <Badge tone={statusTone(row.recommendation)}>{row.recommendation}</Badge> },
    { key: 'comments', header: 'Comments', render: (row) => row.comments || '-' },
  ];

  return (
    <>
      <PageHeader title="Feedback" description="Capture panel interview ratings and hiring recommendations." />
      <RoleGuard requiredRoles={['PANELIST']}>
        <form onSubmit={onSubmit} className="surface mb-6 grid gap-4 p-5 lg:grid-cols-2">
          <div><label className="label">Participant</label><select className="input" {...register('participantId', { required: true, valueAsNumber: true })}><option value="">Select participant</option>{participants.map((participant) => <option key={participant.id} value={participant.id}>{participant.name}</option>)}</select></div>
          <div><label className="label">Panelist</label><select className="input" {...register('panelistId', { required: true, valueAsNumber: true })}><option value="">Select panelist</option>{panelists.map((panelist) => <option key={panelist.id} value={panelist.id}>{panelist.name}</option>)}</select></div>
          <div><label className="label">Technical Rating</label><input type="number" min={1} max={5} className="input" {...register('technicalRating', { required: true, valueAsNumber: true })} /></div>
          <div><label className="label">Communication Rating</label><input type="number" min={1} max={5} className="input" {...register('communicationRating', { required: true, valueAsNumber: true })} /></div>
          <div><label className="label">Recommendation</label><select className="input" {...register('recommendation', { required: true })}>{['HIRE', 'HOLD', 'REJECT'].map((value) => <option key={value}>{value}</option>)}</select></div>
          <div className="lg:row-span-2"><label className="label">Comments</label><textarea className="input min-h-28" {...register('comments')} /></div>
          <button className="btn-primary lg:w-fit" disabled={createFeedback.isPending}><MessageSquarePlus className="h-4 w-4" /> Submit Feedback</button>
        </form>
      </RoleGuard>
      <DataTable data={feedback} columns={columns} isLoading={isLoading} emptyTitle="No feedback submitted" />
    </>
  );
}
