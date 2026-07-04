import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Trash2, UserPlus } from "lucide-react";
import { DataTable, type Column } from "../../components/common/DataTable";
import { EmptyState } from "../../components/common/EmptyState";
import { Modal } from "../../components/common/Modal";
import { PageHeader } from "../../components/common/PageHeader";
import { useEvents } from "../../hooks/useEvents";
import { useParticipants } from "../../hooks/useParticipants";
import { squadService } from "../../services/squadService";
import type { Squad, SquadPayload } from "../../types/squad";
import type { Participant } from "../../types/participant";
import { getApiErrorMessage } from "../../utils/api";
import { RoleGuard } from "../../utils/roleGuard";

export function SquadsPage() {
  const queryClient = useQueryClient();
  const { data: events = [] } = useEvents();
  const { data: participants = [] } = useParticipants();
  const [eventId, setEventId] = useState<number>(0);
  const [selectedSquadId, setSelectedSquadId] = useState<number>(0);
  const [deletingSquad, setDeletingSquad] = useState<Squad | null>(null);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const { register, handleSubmit, reset } = useForm<SquadPayload>();
  const { data: squads = [], isLoading } = useQuery({
    queryKey: ["squads", eventId],
    queryFn: () => squadService.byEvent(eventId),
    enabled: Boolean(eventId),
  });
  const { data: members = [] } = useQuery({
    queryKey: ["squad-members", selectedSquadId],
    queryFn: () => squadService.members(selectedSquadId),
    enabled: Boolean(selectedSquadId),
  });
  const createSquad = useMutation({
    mutationFn: squadService.create,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["squads", eventId] }),
  });
  const addMember = useMutation({
    mutationFn: ({
      squadId,
      participantId,
    }: {
      squadId: number;
      participantId: number;
    }) => squadService.addMember(squadId, participantId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["squad-members", selectedSquadId],
      }),
  });

  useEffect(() => {
    if (!eventId && events[0]) setEventId(events[0].id);
  }, [eventId, events]);

  const onCreate = handleSubmit(async (values) => {
    try {
      await createSquad.mutateAsync({
        eventId: Number(eventId),
        name: values.name,
      });
      toast.success("Squad created");
      reset();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  });

  const confirmDelete = async () => {
    if (!deletingSquad) return;
    if (deleteStep === 1) {
      setDeleteStep(2);
      return;
    }

    try {
      await squadService.delete(deletingSquad.id);
      toast.success("Squad deleted");
      setDeletingSquad(null);
      setDeleteStep(1);
      setSelectedSquadId(0);
      queryClient.invalidateQueries({ queryKey: ["squads", eventId] });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  async function handleAddMember(participantId: number) {
    try {
      await addMember.mutateAsync({ squadId: selectedSquadId, participantId });
      toast.success("Member added");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  const squadColumns: Column<Squad>[] = [
    {
      key: "name",
      header: "Squad",
      render: (row) => (
        <button
          className="font-semibold text-emerald-700"
          onClick={() => setSelectedSquadId(row.id)}
        >
          {row.name}
        </button>
      ),
    },
    { key: "id", header: "ID", render: (row) => row.id },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <button
          className="btn-secondary h-9 w-9 p-0 text-rose-600 hover:text-rose-700"
          onClick={(event) => {
            event.stopPropagation();
            setDeletingSquad(row);
            setDeleteStep(1);
          }}
          aria-label="Delete squad"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ];
  const memberColumns: Column<Participant>[] = [
    { key: "code", header: "Code", render: (row) => row.participantCode },
    { key: "name", header: "Name", render: (row) => row.name },
    { key: "status", header: "Status", render: (row) => row.status },
  ];

  return (
    <>
      <PageHeader
        title="Squads"
        description="Create squads per event and assign participants into groups."
      />
      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="surface p-5">
          <label className="label">Select Event</label>
          <select
            className="input"
            value={eventId}
            onChange={(event) => {
              setEventId(Number(event.target.value));
              setSelectedSquadId(0);
            }}
          >
            <option value="">Select event</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>
        <RoleGuard requiredRoles={["ADMIN"]}>
          <form
            className="surface flex flex-col gap-3 p-5 sm:flex-row sm:items-end"
            onSubmit={onCreate}
          >
            <div className="flex-1">
              <label className="label">Create Squad</label>
              <input
                className="input"
                placeholder="Backend Squad"
                {...register("name", { required: true })}
              />
            </div>
            <button
              className="btn-primary"
              disabled={!eventId || createSquad.isPending}
            >
              <Plus className="h-4 w-4" /> Create
            </button>
          </form>
        </RoleGuard>
      </div>
      <section className="grid gap-6 xl:grid-cols-2">
        <div>
          <h2 className="mb-3 font-semibold">Squads</h2>
          {eventId ? (
            <DataTable
              data={squads}
              columns={squadColumns}
              isLoading={isLoading}
              emptyTitle="No squads for this event"
            />
          ) : (
            <EmptyState title="Select an event" />
          )}
        </div>
        <div>
          <h2 className="mb-3 font-semibold">Squad Members</h2>
          {selectedSquadId ? (
            <DataTable
              data={members}
              columns={memberColumns}
              emptyTitle="No members in this squad"
            />
          ) : (
            <EmptyState title="Select a squad" />
          )}
        </div>
      </section>
      <Modal
        title={deleteStep === 1 ? "Delete squad?" : "Are you absolutely sure?"}
        open={Boolean(deletingSquad)}
        onClose={() => {
          setDeletingSquad(null);
          setDeleteStep(1);
        }}
      >
        {deletingSquad ? (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600">
              {deleteStep === 1
                ? `This will permanently delete the squad "${deletingSquad.name}" and its membership rows.`
                : "This action cannot be undone. Do you want to continue?"}
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="btn-secondary"
                onClick={() => {
                  setDeletingSquad(null);
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

      <RoleGuard requiredRoles={["ADMIN"]}>
        <section className="surface mt-6 p-5">
          <h2 className="mb-4 font-semibold">Assign Members</h2>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {participants.map((participant) => (
              <button
                key={participant.id}
                className="btn-secondary justify-between"
                disabled={!selectedSquadId || addMember.isPending}
                onClick={() => handleAddMember(participant.id)}
              >
                <span className="truncate">
                  {participant.participantCode} - {participant.name}
                </span>
                <UserPlus className="h-4 w-4" />
              </button>
            ))}
          </div>
        </section>
      </RoleGuard>
    </>
  );
}
