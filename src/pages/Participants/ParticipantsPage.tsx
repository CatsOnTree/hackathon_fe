import { useMemo, useState } from 'react';
import { Eye, FileText, ImageIcon, Search } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { PageHeader } from '../../components/common/PageHeader';
import { useParticipants } from '../../hooks/useParticipants';
import type { Participant } from '../../types/participant';
import { assetUrl } from '../../utils/api';
import { statusTone } from '../../utils/status';

const pageSize = 8;

export function ParticipantsPage() {
  const { data = [], isLoading } = useParticipants();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState('participantCode');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<Participant | null>(null);

  const columns: Column<Participant>[] = useMemo(() => [
    { key: 'participantCode', header: 'Code', sortValue: (row) => row.participantCode, render: (row) => <span className="font-semibold text-zinc-900">{row.participantCode}</span> },
    { key: 'name', header: 'Name', sortValue: (row) => row.name, render: (row) => row.name },
    { key: 'email', header: 'Email', sortValue: (row) => row.email, render: (row) => row.email },
    { key: 'skills', header: 'Skills', render: (row) => <span className="max-w-52 truncate">{row.skills || '-'}</span> },
    { key: 'aiScore', header: 'AI Score', sortValue: (row) => row.aiScore ?? 0, render: (row) => row.aiScore ?? '-' },
    { key: 'status', header: 'Status', sortValue: (row) => row.status, render: (row) => <Badge tone={statusTone(row.status)}>{row.status}</Badge> },
    { key: 'resume', header: 'Resume', render: (row) => row.resumeUrl ? <a className="btn-secondary py-1.5" href={assetUrl(row.resumeUrl)} target="_blank"><FileText className="h-4 w-4" /> Open</a> : '-' },
    { key: 'photo', header: 'Photo', render: (row) => row.photoUrl ? <a className="btn-secondary py-1.5" href={assetUrl(row.photoUrl)} target="_blank"><ImageIcon className="h-4 w-4" /> View</a> : '-' },
    { key: 'view', header: 'View', render: (row) => <button className="btn-secondary h-9 w-9 p-0" onClick={() => setSelected(row)} aria-label="View participant"><Eye className="h-4 w-4" /></button> },
  ], []);

  const filtered = useMemo(() => {
    const lowered = query.toLowerCase();
    const base = data.filter((item) => [item.participantCode, item.name, item.email, item.skills, item.status].some((value) => value?.toLowerCase().includes(lowered)));
    const column = columns.find((item) => item.key === sortKey);
    const sorted = [...base].sort((a, b) => {
      const av = column?.sortValue?.(a) ?? '';
      const bv = column?.sortValue?.(b) ?? '';
      return String(av).localeCompare(String(bv), undefined, { numeric: true }) * (sortDirection === 'asc' ? 1 : -1);
    });
    return sorted;
  }, [columns, data, query, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  function handleSort(key: string) {
    setSortKey(key);
    setSortDirection((current) => (sortKey === key && current === 'asc' ? 'desc' : 'asc'));
  }

  return (
    <>
      <PageHeader title="Participants" description="Search, sort, inspect AI scores, and open submitted files." />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input className="input pl-9" placeholder="Search participants" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
        </label>
        <p className="text-sm text-zinc-500">{filtered.length} participants</p>
      </div>
      <DataTable data={pageData} columns={columns} isLoading={isLoading} sortKey={sortKey} sortDirection={sortDirection} onSort={handleSort} emptyTitle="No participants found" />
      <div className="mt-4 flex items-center justify-end gap-2">
        <button className="btn-secondary" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
        <span className="text-sm text-zinc-600">Page {page} of {totalPages}</span>
        <button className="btn-secondary" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>Next</button>
      </div>
      <Modal title="Participant Details" open={Boolean(selected)} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="space-y-3 text-sm">
            {selected.photoUrl ? <img src={assetUrl(selected.photoUrl)} alt={selected.name} className="h-28 w-28 rounded-lg object-cover" /> : null}
            <p><strong>Code:</strong> {selected.participantCode}</p>
            <p><strong>Name:</strong> {selected.name}</p>
            <p><strong>Email:</strong> {selected.email}</p>
            <p><strong>Phone:</strong> {selected.phone || '-'}</p>
            <p><strong>Experience:</strong> {selected.experienceYears ?? 0} years</p>
            <p><strong>Skills:</strong> {selected.skills || '-'}</p>
            <p><strong>AI Score:</strong> {selected.aiScore ?? '-'}</p>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
