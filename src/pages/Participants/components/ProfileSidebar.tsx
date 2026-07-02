import { useState } from "react";
import { FileText, Mail, Phone, Briefcase, Sparkles } from "lucide-react";
import { Badge } from "../../../components/common/Badge";
import type { Participant } from "../../../types/participant";
import { assetUrl } from "../../../utils/api";
import { statusTone } from "../../../utils/status";

interface Props {
  participant: Participant;
  skills: string[];
  aiScore: number;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("");
}

export function ProfileSidebar({ participant, skills, aiScore }: Props) {
  const photoUrl = participant.photoUrl ? assetUrl(participant.photoUrl) : "";
  const [imageError, setImageError] = useState(false);

  return (
    <div className="surface overflow-hidden p-6">
      <div className="flex flex-col items-center text-center">
        {photoUrl && !imageError ? (
          <img
            src={photoUrl}
            alt={participant.name}
            onError={() => setImageError(true)}
            className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg"
          />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-emerald-500 to-sky-500 text-2xl font-semibold text-white shadow-lg">
            {initials(participant.name)}
          </div>
        )}
        <h2 className="mt-4 text-xl font-semibold text-zinc-900">
          {participant.name}
        </h2>
        <p className="text-sm text-zinc-500">{participant.participantCode}</p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <Badge tone={statusTone(participant.status)}>
            {participant.status}
          </Badge>
          <Badge tone="blue">AI Score {aiScore}</Badge>
        </div>
      </div>

      <div className="mt-6 space-y-4 text-sm text-zinc-600">
        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3">
          <Briefcase className="h-4 w-4 text-emerald-600" />
          <span>
            {participant.experienceYears
              ? `${participant.experienceYears} years experience`
              : "Experience not listed"}
          </span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3">
          <Mail className="h-4 w-4 text-emerald-600" />
          <span>{participant.email}</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3">
          <Phone className="h-4 w-4 text-emerald-600" />
          <span>{participant.phone || "Phone not provided"}</span>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          Skills
        </div>
        {skills.length ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-gradient-to-r from-emerald-500/10 to-sky-500/10 px-3 py-1 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-600">No skills listed.</p>
        )}
      </div>

      <div className="mt-6 border-t border-zinc-200 pt-4">
        <a
          href={
            participant.resumeUrl ? assetUrl(participant.resumeUrl) : undefined
          }
          target="_blank"
          rel="noreferrer"
          className={`btn-primary w-full ${!participant.resumeUrl ? "pointer-events-none opacity-60" : ""}`}
        >
          <FileText className="h-4 w-4" />
          View Resume
        </a>
      </div>
    </div>
  );
}
