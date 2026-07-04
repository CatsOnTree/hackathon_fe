import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { CheckCircle, UserPlus } from "lucide-react";
import { FileDropzone } from "../../components/forms/FileDropzone";
import { PageHeader } from "../../components/common/PageHeader";
import { useEvents } from "../../hooks/useEvents";
import { useRegisterParticipant } from "../../hooks/useParticipants";
import type {
  Participant,
  ParticipantRegistrationPayload,
} from "../../types/participant";
import { getApiErrorMessage } from "../../utils/api";
import { RoleGuard } from "../../utils/roleGuard";

export function RegistrationPage() {
  const { data: events = [] } = useEvents();
  const registerParticipant = useRegisterParticipant();
  const {
    register,
    watch,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<ParticipantRegistrationPayload>();
  const [registeredParticipant, setRegisteredParticipant] =
    useState<Participant | null>(null);
  const resumeFile = watch("resume")?.[0];
  const photoFile = watch("photo")?.[0];

  const onSubmit = handleSubmit(async (values) => {
    try {
      const participant = await registerParticipant.mutateAsync({
        ...values,
        eventId: Number(values.eventId),
        experienceYears: Number(values.experienceYears || 0),
      });
      setRegisteredParticipant(participant);
      reset();
      toast.success(`Registered ${participant.participantCode}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  });

  if (registeredParticipant) {
    return (
      <>
        <PageHeader
          title="Registration Complete"
          description="The participant has been successfully registered."
        />
        <div className="mx-auto max-w-2xl p-6">
          <div className="surface p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Registration Successful
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              The participant has been added successfully and can now be tracked
              in the system.
            </p>
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Participant Code</p>
              <p className="text-2xl font-semibold text-slate-900">
                {registeredParticipant.participantCode}
              </p>
            </div>
            <button
              className="btn-primary mt-6"
              onClick={() => setRegisteredParticipant(null)}
            >
              Register Another Participant
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Registration"
        description="Public participant registration with resume and photo uploads."
      />
      <RoleGuard requiredRoles={["PARTICIPANT"]}>
        <form onSubmit={onSubmit} className="surface mx-auto max-w-3xl p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Event</label>
              <select
                className="input"
                {...register("eventId", {
                  required: "Choose an event",
                  valueAsNumber: true,
                })}
              >
                <option value="">Select event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
              {errors.eventId ? (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.eventId.message}
                </p>
              ) : null}
            </div>
            <div>
              <label className="label">Name</label>
              <input
                className="input"
                {...register("name", { required: "Name is required" })}
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                {...register("email", { required: "Email is required" })}
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" {...register("phone")} />
            </div>
            <div>
              <label className="label">Experience Years</label>
              <input
                type="number"
                min={0}
                className="input"
                {...register("experienceYears", {
                  valueAsNumber: true,
                  min: 0,
                })}
              />
            </div>
            <FileDropzone
              label="Resume Upload"
              accept=".pdf,.doc,.docx"
              file={resumeFile}
              registration={register("resume")}
            />
            <FileDropzone
              label="Photo Upload"
              accept="image/*"
              file={photoFile}
              registration={register("photo")}
            />
          </div>
          <button
            className="btn-primary mt-6 w-full"
            disabled={registerParticipant.isPending}
          >
            <UserPlus className="h-4 w-4" />{" "}
            {registerParticipant.isPending
              ? "Submitting..."
              : "Register Participant"}
          </button>
        </form>
      </RoleGuard>
    </>
  );
}
