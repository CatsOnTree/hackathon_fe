import { useEffect, useState } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { UserPlus, AlertCircle, CheckCircle } from "lucide-react";
import { FileDropzone } from "../../components/forms/FileDropzone";
// import { PageHeader } from "../../components/common/PageHeader";
import { Spinner } from "../../components/common/Loading";
import { participantService } from "../../services/participantService";
import { eventService } from "../../services/eventService";
import type { RecruitmentEvent } from "../../types/event";
import type {
  Participant,
  ParticipantRegistrationPayload,
} from "../../types/participant";
import { publicRegistrationQuotes } from "../../config/quotes";
import { getApiErrorMessage } from "../../utils/api";

export function PublicRegistrationPage() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");
  const [event, setEvent] = useState<RecruitmentEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [registeredParticipant, setRegisteredParticipant] =
    useState<Participant | null>(null);

  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    if (!submitting) return;
    const id = setInterval(
      () => setQuoteIndex((i) => (i + 1) % publicRegistrationQuotes.length),
      3000,
    );
    return () => clearInterval(id);
  }, [submitting]);

  const {
    register,
    watch,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<ParticipantRegistrationPayload>();
  const resumeFile = watch("resume")?.[0];
  const photoFile = watch("photo")?.[0];

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!eventId) {
          setError("Event ID is required");
          return;
        }

        const eventData = await eventService.get(Number(eventId));
        setEvent(eventData);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const onSubmit = handleSubmit(async (values) => {
    if (!event) {
      toast.error("Event not found");
      return;
    }

    try {
      setSubmitting(true);
      const participant = await participantService.register({
        ...values,
        eventId: event.id,
        experienceYears: Number(values.experienceYears || 0),
      });

      setRegisteredParticipant(participant);
      reset();
      toast.success("Registration successful!");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  });

  if (!eventId) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="surface max-w-md w-full p-8 rounded-lg shadow-lg text-center">
          <Spinner label="Loading event details..." />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="surface max-w-md w-full p-8 rounded-lg shadow-lg">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-center text-xl font-bold text-slate-900 mb-2">
            Error
          </h2>
          <p className="text-center text-slate-600">
            {error || "Event not found"}
          </p>
        </div>
      </div>
    );
  }

  const isRegistrationClosed = event.status === "CLOSED";

  if (isRegistrationClosed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="surface max-w-md w-full p-8 rounded-lg shadow-lg">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-amber-100 rounded-full mb-4">
            <AlertCircle className="h-6 w-6 text-amber-600" />
          </div>
          <h2 className="text-center text-xl font-bold text-slate-900 mb-2">
            Registration Closed
          </h2>
          <p className="text-center text-slate-600 mb-4">
            Registration for <strong>{event.name}</strong> is currently closed.
          </p>
          <p className="text-center text-sm text-slate-500">
            Event Date: {new Date(event.eventDate).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  }

  if (registeredParticipant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="surface max-w-2xl w-full p-8 rounded-lg shadow-lg text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Registration Successful!
          </h2>
          <p className="text-slate-600 mb-4">
            Your registration for <strong>{event.name}</strong> has been
            completed.
          </p>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 mb-6">
            <p className="text-sm text-slate-500">Participant Code</p>
            <p className="text-2xl font-semibold text-slate-900">
              {registeredParticipant.participantCode}
            </p>
          </div>
          <p className="text-sm text-slate-600 mb-6">
            Please check your email for further instructions and event updates.
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setRegisteredParticipant(null)}
          >
            Register Another Participant
          </button>
        </div>
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="surface max-w-2xl w-full p-8 rounded-lg shadow-lg text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-white rounded-full mb-4">
            <Spinner label="Registering..." />
          </div>
          <p className="mt-4 text-sm text-slate-600">
            {publicRegistrationQuotes[quoteIndex]}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* <PageHeader
        title={event.name}
        description={event.description || "Register for this event"}
      /> */}
      <div className="mx-auto max-w-3xl p-6">
        <form onSubmit={onSubmit} className="surface p-6">
          <div className="mb-6 pb-6 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-2">{event.name}</h3>
            <p className="text-sm text-slate-600">{event.description}</p>
            <p className="text-xs text-slate-500 mt-2">
              Event Date: {new Date(event.eventDate).toLocaleDateString()}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Name *</label>
              <input
                className="input"
                placeholder="Your full name"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name ? (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.name.message}
                </p>
              ) : null}
            </div>

            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                className="input"
                placeholder="your.email@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email ? (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            <div>
              <label className="label">Phone</label>
              <input
                className="input"
                placeholder="Your phone number"
                {...register("phone")}
              />
            </div>

            <div>
              <label className="label">Experience (Years)</label>
              <input
                type="number"
                min={0}
                className="input"
                placeholder="0"
                {...register("experienceYears", {
                  valueAsNumber: true,
                  min: { value: 0, message: "Must be 0 or greater" },
                })}
              />
              {errors.experienceYears ? (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.experienceYears.message}
                </p>
              ) : null}
            </div>

            <FileDropzone
              label="Resume Upload (Optional)"
              accept=".pdf,.doc,.docx"
              file={resumeFile}
              registration={register("resume")}
            />

            <FileDropzone
              label="Photo Upload (Optional)"
              accept="image/*"
              file={photoFile}
              registration={register("photo")}
            />
          </div>

          <button
            type="submit"
            className="btn-primary mt-8 w-full"
            disabled={submitting}
          >
            <UserPlus className="h-4 w-4" />
            {submitting ? "Registering..." : "Register for Event"}
          </button>

          <p className="text-xs text-slate-500 text-center mt-4">
            By registering, you agree to receive event updates and
            communications.
          </p>
        </form>
      </div>
    </>
  );
}
