import { Users } from "lucide-react";

export function SquadMembers() {
  return (
    <div className="surface p-6">
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-emerald-600" />
        <h3 className="text-lg font-semibold text-zinc-900">Squad Members</h3>
      </div>
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/70 p-6 text-center text-sm text-zinc-600">
        No squad assigned.
      </div>
    </div>
  );
}
