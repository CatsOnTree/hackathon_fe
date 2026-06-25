import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { attendanceService } from '../../services/attendanceService';
import { getApiErrorMessage } from '../../utils/api';
import { RoleGuard } from '../../utils/roleGuard';

export function AttendancePage() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ participantCode: string }>();
  const checkIn = useMutation({
    mutationFn: attendanceService.checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  const onSubmit = handleSubmit(async ({ participantCode }) => {
    try {
      await checkIn.mutateAsync(participantCode.trim());
      toast.success('Participant checked in');
      reset();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  });

  return (
    <>
      <PageHeader title="Attendance" description="Check participants in using their generated participant code." />
      <RoleGuard requiredRoles={['ADMIN', 'PANELIST']}>
        <form onSubmit={onSubmit} className="surface max-w-xl p-6">
          <label className="label">Participant Code</label>
          <input className="input uppercase" placeholder="PART-0001" {...register('participantCode', { required: 'Participant code is required' })} />
          {errors.participantCode ? <p className="mt-1 text-xs text-rose-600">{errors.participantCode.message}</p> : null}
          <button className="btn-primary mt-5" disabled={checkIn.isPending}><CheckCircle2 className="h-4 w-4" /> {checkIn.isPending ? 'Checking in...' : 'Check In'}</button>
        </form>
      </RoleGuard>
    </>
  );
}
