import { DataTable, type Column } from '../../components/common/DataTable';
import { PageHeader } from '../../components/common/PageHeader';
import type { EmailLog } from '../../types/emailLog';
import { RoleGuard } from '../../utils/roleGuard';

const mockEmailLogs: EmailLog[] = [
  { id: 1, email: 'john@test.com', subject: 'Registration confirmed', sentTime: '2026-06-25T12:30:00.000' },
  { id: 2, email: 'priya@test.com', subject: 'Panel assignment summary', sentTime: '2026-06-25T12:40:00.000' },
];

export function EmailLogsPage() {
  const columns: Column<EmailLog>[] = [
    { key: 'email', header: 'Email', render: (row) => row.email },
    { key: 'subject', header: 'Subject', render: (row) => row.subject },
    { key: 'sentTime', header: 'Sent Time', render: (row) => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(row.sentTime)) },
  ];

  return (
    <>
      <PageHeader title="Email Logs" description="Reusable log view with mock data until the email log API is exposed." />
      <RoleGuard requiredRoles={['ADMIN']}>
        <DataTable data={mockEmailLogs} columns={columns} emptyTitle="No email logs yet" />
      </RoleGuard>
    </>
  );
}
