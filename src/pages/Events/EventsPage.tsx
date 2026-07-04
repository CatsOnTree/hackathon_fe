import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Copy, Eye, Plus, QrCode, Trash2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "../../components/common/Badge";
import { DataTable, type Column } from "../../components/common/DataTable";
import { Drawer } from "../../components/common/Drawer";
import { Modal } from "../../components/common/Modal";
import { PageHeader } from "../../components/common/PageHeader";
import { useCreateEvent, useEvents } from "../../hooks/useEvents";
import { eventService } from "../../services/eventService";
import type { EventPayload, RecruitmentEvent } from "../../types/event";
import { assetUrl, formatDate, getApiErrorMessage } from "../../utils/api";
import { statusTone } from "../../utils/status";
import { RoleGuard } from "../../utils/roleGuard";

export function EventsPage() {
  const { data = [], isLoading } = useEvents();
  const createEvent = useCreateEvent();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [qrEvent, setQrEvent] = useState<RecruitmentEvent | null>(null);
  const [detailEvent, setDetailEvent] = useState<RecruitmentEvent | null>(null);
  const [deleteEvent, setDeleteEvent] = useState<RecruitmentEvent | null>(null);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventPayload>({ defaultValues: { status: "OPEN" } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createEvent.mutateAsync(values);
      toast.success("Event created");
      reset({ status: "OPEN" });
      setCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  });

  const handleDeleteClick = (event: RecruitmentEvent) => {
    setDeleteEvent(event);
    setDeleteStep(1);
  };

  const confirmDelete = async () => {
    if (!deleteEvent) return;
    if (deleteStep === 1) {
      setDeleteStep(2);
      return;
    }

    try {
      await eventService.delete(deleteEvent.id);
      toast.success("Event deleted");
      setDeleteEvent(null);
      setDeleteStep(1);
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const columns: Column<RecruitmentEvent>[] = [
    {
      key: "name",
      header: "Event",
      render: (row) => (
        <span className="font-medium text-zinc-900">{row.name}</span>
      ),
    },
    {
      key: "eventDate",
      header: "Date",
      render: (row) => formatDate(row.eventDate),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge tone={statusTone(row.status)}>{row.status}</Badge>
      ),
    },
    {
      key: "registrationUrl",
      header: "Registration Link",
      render: (row) => (
        <button
          className="btn-secondary py-1.5"
          onClick={() =>
            navigator.clipboard
              .writeText(row.registrationUrl || "")
              .then(() => toast.success("Registration link copied"))
          }
          disabled={!row.registrationUrl}
        >
          <Copy className="h-4 w-4" /> Copy
        </button>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            className="btn-secondary h-9 w-9 p-0"
            onClick={() => setQrEvent(row)}
            aria-label="QR preview"
          >
            <QrCode className="h-4 w-4" />
          </button>
          <button
            className="btn-secondary h-9 w-9 p-0"
            onClick={() => setDetailEvent(row)}
            aria-label="View event"
          >
            <Eye className="h-4 w-4" />
          </button>
          <RoleGuard requiredRoles={["ADMIN"]}>
            <button
              className="btn-secondary h-9 w-9 p-0 text-rose-600 hover:text-rose-700"
              onClick={() => handleDeleteClick(row)}
              aria-label="Delete event"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </RoleGuard>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Events"
        description="Create drives, share registration links, and inspect event details."
        actions={
          <RoleGuard requiredRoles={["ADMIN"]}>
            <button className="btn-primary" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> Create Event
            </button>
          </RoleGuard>
        }
      />
      <DataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        emptyTitle="No events yet"
      />

      <Modal
        title="Create Event"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name ? (
              <p className="mt-1 text-xs text-rose-600">
                {errors.name.message}
              </p>
            ) : null}
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-24" {...register("description")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Event Date</label>
              <input
                type="date"
                className="input"
                {...register("eventDate", {
                  required: "Event date is required",
                })}
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" {...register("status")}>
                {["DRAFT", "OPEN", "CLOSED", "COMPLETED"].map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            className="btn-primary w-full"
            disabled={createEvent.isPending}
          >
            {createEvent.isPending ? "Creating..." : "Create Event"}
          </button>
        </form>
      </Modal>

      <Modal
        title="QR Code Preview"
        open={Boolean(qrEvent)}
        onClose={() => setQrEvent(null)}
      >
        {qrEvent ? (
          <div className="text-center">
            <div className="mx-auto inline-block rounded-lg bg-white p-4 ring-1 ring-zinc-200">
              <QRCodeSVG value={qrEvent.registrationUrl || ""} size={220} />
            </div>
            {qrEvent.qrCodeUrl ? (
              <img
                src={assetUrl(qrEvent.qrCodeUrl)}
                alt="Server generated QR"
                className="mx-auto mt-4 h-28 w-28 rounded-md object-contain"
              />
            ) : null}
            <p className="mt-4 break-all text-sm text-zinc-600">
              {qrEvent.registrationUrl}
            </p>
          </div>
        ) : null}
      </Modal>

      <Modal
        title={deleteStep === 1 ? "Delete event?" : "Are you absolutely sure?"}
        open={Boolean(deleteEvent)}
        onClose={() => {
          setDeleteEvent(null);
          setDeleteStep(1);
        }}
      >
        {deleteEvent ? (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600">
              {deleteStep === 1
                ? `This will permanently delete "${deleteEvent.name}" and related event data.`
                : "This action cannot be undone. Do you want to continue?"}
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="btn-secondary"
                onClick={() => {
                  setDeleteEvent(null);
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

      <Drawer
        title="Event Details"
        open={Boolean(detailEvent)}
        onClose={() => setDetailEvent(null)}
      >
        {detailEvent ? (
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="font-semibold">Name</dt>
              <dd>{detailEvent.name}</dd>
            </div>
            <div>
              <dt className="font-semibold">Description</dt>
              <dd>{detailEvent.description || "-"}</dd>
            </div>
            <div>
              <dt className="font-semibold">Date</dt>
              <dd>{formatDate(detailEvent.eventDate)}</dd>
            </div>
            <div>
              <dt className="font-semibold">Status</dt>
              <dd>
                <Badge tone={statusTone(detailEvent.status)}>
                  {detailEvent.status}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Registration URL</dt>
              <dd className="break-all">
                {detailEvent.registrationUrl || "-"}
              </dd>
            </div>
          </dl>
        ) : null}
      </Drawer>
    </>
  );
}
