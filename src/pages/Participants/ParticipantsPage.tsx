import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, FileText, ImageIcon, Search, Trash2 } from "lucide-react";
import { Badge } from "../../components/common/Badge";
import { DataTable, type Column } from "../../components/common/DataTable";
import { Modal } from "../../components/common/Modal";
import toast from "react-hot-toast";
import { PageHeader } from "../../components/common/PageHeader";
import { useEvents } from "../../hooks/useEvents";
import { useParticipants } from "../../hooks/useParticipants";
import { participantService } from "../../services/participantService";
import type { Participant } from "../../types/participant";
import { assetUrl, getApiErrorMessage } from "../../utils/api";
import { statusTone } from "../../utils/status";
import { RoleGuard } from "../../utils/roleGuard";

const pageSize = 8;

export function ParticipantsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const { data: events = [] } = useEvents();
  const { data = [], isLoading } = useParticipants(
    selectedEventId ? Number(selectedEventId) : undefined,
  );
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState("participantCode");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<Participant | null>(null);
  const [deletingParticipant, setDeletingParticipant] =
    useState<Participant | null>(null);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);

  const columns: Column<Participant>[] = useMemo(
    () => [
      {
        key: "participantCode",
        header: "Code",
        sortValue: (row) => row.participantCode,
        render: (row) => (
          <span className="font-semibold text-zinc-900">
            {row.participantCode}
          </span>
        ),
      },
      {
        key: "name",
        header: "Name",
        sortValue: (row) => row.name,
        render: (row) => row.name,
      },
      {
        key: "email",
        header: "Email",
        sortValue: (row) => row.email,
        render: (row) => row.email,
      },
      {
        key: "skills",
        header: "Skills",
        render: (row) => (
          <span className="max-w-52 truncate">{row.skills || "-"}</span>
        ),
      },
      {
        key: "aiScore",
        header: "AI Score",
        sortValue: (row) => row.aiScore ?? 0,
        render: (row) => row.aiScore ?? "-",
      },
      {
        key: "status",
        header: "Status",
        sortValue: (row) => row.status,
        render: (row) => (
          <Badge tone={statusTone(row.status)}>{row.status}</Badge>
        ),
      },
      {
        key: "resume",
        header: "Resume",
        render: (row) =>
          row.resumeUrl ? (
            <a
              className="btn-secondary py-1.5"
              href={assetUrl(row.resumeUrl)}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
            >
              <FileText className="h-4 w-4" /> Open
            </a>
          ) : (
            "-"
          ),
      },
      {
        key: "photo",
        header: "Photo",
        render: (row) =>
          row.photoUrl ? (
            <a
              className="btn-secondary py-1.5"
              href={assetUrl(row.photoUrl)}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
            >
              <ImageIcon className="h-4 w-4" /> View
            </a>
          ) : (
            "-"
          ),
      },
      {
        key: "actions",
        header: "Actions",
        render: (row) => (
          <div className="flex gap-2">
            <button
              className="btn-secondary h-9 w-9 p-0"
              onClick={(event) => {
                event.stopPropagation();
                setSelected(row);
              }}
              aria-label="View participant"
            >
              <Eye className="h-4 w-4" />
            </button>
            <RoleGuard requiredRoles={["ADMIN"]}>
              <button
                className="btn-secondary h-9 w-9 p-0 text-rose-600 hover:text-rose-700"
                onClick={(event) => {
                  event.stopPropagation();
                  setDeletingParticipant(row);
                  setDeleteStep(1);
                }}
                aria-label="Delete participant"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </RoleGuard>
          </div>
        ),
      },
    ],
    [],
  );

  const handleRowClick = (row: Participant) => {
    navigate(`/participants/${row.id}`);
  };

  const confirmDelete = async () => {
    if (!deletingParticipant) return;
    if (deleteStep === 1) {
      setDeleteStep(2);
      return;
    }

    try {
      await participantService.delete(deletingParticipant.id);
      toast.success("Participant deleted");
      setDeletingParticipant(null);
      setDeleteStep(1);
      queryClient.invalidateQueries({ queryKey: ["participants"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const filtered = useMemo(() => {
    const lowered = query.toLowerCase();
    const base = data.filter((item) => {
      return [
        item.participantCode,
        item.name,
        item.email,
        item.skills,
        item.status,
      ].some((value) => value?.toLowerCase().includes(lowered));
    });
    const column = columns.find((item) => item.key === sortKey);
    const sorted = [...base].sort((a, b) => {
      const av = column?.sortValue?.(a) ?? "";
      const bv = column?.sortValue?.(b) ?? "";
      return (
        String(av).localeCompare(String(bv), undefined, { numeric: true }) *
        (sortDirection === "asc" ? 1 : -1)
      );
    });
    return sorted;
  }, [columns, data, query, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  function handleSort(key: string) {
    setSortKey(key);
    setSortDirection((current) =>
      sortKey === key && current === "asc" ? "desc" : "asc",
    );
  }

  return (
    <>
      <PageHeader
        title="Participants"
        description="Search, sort, inspect AI scores, and open submitted files."
      />
      <div className="mb-4 grid gap-3 xl:grid-cols-[minmax(420px,1fr)_auto] xl:items-end">
        <div className="grid gap-3 sm:grid-cols-[minmax(320px,1fr)_minmax(220px,280px)] items-end">
          <label className="relative block w-full">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              className="input w-full pl-9"
              placeholder="Search participants"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </label>
          <label className="block w-full">
            <span className="mb-1 block text-sm text-zinc-600">
              Filter by event
            </span>
            <select
              className="input w-full"
              value={selectedEventId}
              onChange={(event) => {
                setSelectedEventId(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-sm text-zinc-500 self-end">
          {filtered.length} participants
        </p>
      </div>
      <DataTable
        data={pageData}
        columns={columns}
        isLoading={isLoading}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
        onRowClick={handleRowClick}
        emptyTitle="No participants found"
      />
      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          className="btn-secondary"
          disabled={page === 1}
          onClick={() => setPage((value) => value - 1)}
        >
          Previous
        </button>
        <span className="text-sm text-zinc-600">
          Page {page} of {totalPages}
        </span>
        <button
          className="btn-secondary"
          disabled={page === totalPages}
          onClick={() => setPage((value) => value + 1)}
        >
          Next
        </button>
      </div>
      <Modal
        title={
          deleteStep === 1 ? "Delete participant?" : "Are you absolutely sure?"
        }
        open={Boolean(deletingParticipant)}
        onClose={() => {
          setDeletingParticipant(null);
          setDeleteStep(1);
        }}
      >
        {deletingParticipant ? (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600">
              {deleteStep === 1
                ? `This will permanently delete ${deletingParticipant.name} (${deletingParticipant.participantCode}) and related records.`
                : "This action cannot be undone. Do you want to continue?"}
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="btn-secondary"
                onClick={() => {
                  setDeletingParticipant(null);
                  setDeleteStep(1);
                }}
              >
                Cancel
              </button>
              <button
                className="btn-primary bg-rose-600 hover:bg-rose-700"
                onClick={confirmDelete}
              >
                {deleteStep === 1 ? "Yes, delete" : "Yes, delete permanently"}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        title="Participant Details"
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
      >
        {selected ? (
          <div className="space-y-3 text-sm">
            {selected.photoUrl ? (
              <img
                src={assetUrl(selected.photoUrl)}
                alt={selected.name}
                className="h-28 w-28 rounded-lg object-cover"
              />
            ) : null}
            <p>
              <strong>Code:</strong> {selected.participantCode}
            </p>
            <p>
              <strong>Name:</strong> {selected.name}
            </p>
            <p>
              <strong>Email:</strong> {selected.email}
            </p>
            <p>
              <strong>Phone:</strong> {selected.phone || "-"}
            </p>
            <p>
              <strong>Experience:</strong> {selected.experienceYears ?? 0} years
            </p>
            <p>
              <strong>Skills:</strong> {selected.skills || "-"}
            </p>
            <p>
              <strong>AI Score:</strong> {selected.aiScore ?? "-"}
            </p>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
