import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link2 } from 'lucide-react';
import { DataTable, type Column } from '../../components/common/DataTable';
import { PageHeader } from '../../components/common/PageHeader';
import { useParticipants } from '../../hooks/useParticipants';
import { assignmentService } from '../../services/assignmentService';
import { panelistService } from '../../services/panelistService';
import type { Assignment, AssignmentPayload } from '../../types/assignment';
import { getApiErrorMessage } from '../../utils/api';
import { RoleGuard } from '../../utils/roleGuard';

export function AssignmentsPage() {
  const queryClient = useQueryClient();
  const { data: participants = [] } = useParticipants();
  const { data: panelists = [] } = useQuery({ queryKey: ['panelists'], queryFn: panelistService.list });
  const { data: assignments = [], isLoading } = useQuery({ queryKey: ['assignments'], queryFn: assignmentService.list });
  const { register, handleSubmit, reset } = useForm<AssignmentPayload>();
  const createAssignment = useMutation({
    mutationFn: assignmentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['participants'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createAssignment.mutateAsync({ participantId: Number(values.participantId), panelistId: Number(values.panelistId) });
      toast.success('Participant assigned');
      reset();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  });

  const columns: Column<Assignment>[] = [
    { key: 'participant', header: 'Participant', render: (row) => participants.find((item) => item.id === row.participantId)?.name || row.participantId },
    { key: 'panelist', header: 'Panelist', render: (row) => panelists.find((item) => item.id === row.panelistId)?.name || row.panelistId },
    { key: 'id', header: 'Assignment ID', render: (row) => row.id },
  ];

  return (
    <>
      <PageHeader title="Assignments" description="Connect participants with panelists for interviews." />
      <RoleGuard requiredRoles={['ADMIN']}>
        <form onSubmit={onSubmit} className="surface mb-6 grid gap-4 p-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div>
            <label className="label">Participant</label>
            <select className="input" {...register('participantId', { required: true, valueAsNumber: true })}>
              <option value="">Select participant</option>
              {participants.map((participant) => <option key={participant.id} value={participant.id}>{participant.participantCode} - {participant.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Panelist</label>
            <select className="input" {...register('panelistId', { required: true, valueAsNumber: true })}>
              <option value="">Select panelist</option>
              {panelists.map((panelist) => <option key={panelist.id} value={panelist.id}>{panelist.name} - {panelist.domain}</option>)}
            </select>
          </div>
          <button className="btn-primary" disabled={createAssignment.isPending}><Link2 className="h-4 w-4" /> Assign</button>
        </form>
      </RoleGuard>
      <DataTable data={assignments} columns={columns} isLoading={isLoading} emptyTitle="No assignments yet" />
    </>
  );
}
