import { Users } from "lucide-react";
import { useParticipantSquads } from "../../../hooks/useParticipants";
import { Spinner } from "../../../components/common/Loading";
import { assetUrl } from "../../../utils/api";

interface Props {
  participantId: number | null;
  eventId: number | undefined | null;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("");
}

export function SquadMembers({ participantId, eventId }: Props) {
  const { data: squads = [], isLoading } = useParticipantSquads(eventId, participantId);

  const allMembers = squads.flatMap((squad) => squad.members || []);
  const uniqueMembers = Array.from(
    new Map(allMembers.map((member) => [member.id, member])).values(),
  );

  if (isLoading) {
    return (
      <div className="surface w-full p-6">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-zinc-900">Squad Members</h3>
        </div>
        <div className="flex items-center justify-center p-8">
          <Spinner label="Loading squad members..." />
        </div>
      </div>
    );
  }

  if (!eventId) {
    return (
      <div className="surface w-full p-6">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-zinc-900">Squad Members</h3>
        </div>
        <div className="flex items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-sm text-zinc-600">
          <span>No squad assigned.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="surface w-full p-6">
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-emerald-600" />
        <h3 className="text-lg font-semibold text-zinc-900">Squad Members</h3>
      </div>
      {uniqueMembers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {uniqueMembers.map((member) => (
            <div key={member.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 hover:shadow-md transition">
              <div className="flex items-center gap-3">
                {member.photoUrl ? (
                  <img
                    src={assetUrl(member.photoUrl)}
                    alt={member.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 text-sm font-semibold text-white">
                    {initials(member.name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-zinc-900 truncate">{member.name}</p>
                  <p className="text-xs text-zinc-600 truncate">{member.participantCode}</p>
                  {member.aiScore && (
                    <p className="text-xs text-emerald-600 font-medium">Score: {member.aiScore}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-sm text-zinc-600">
          <span>No squad assigned.</span>
        </div>
      )}
    </div>
  );
}
