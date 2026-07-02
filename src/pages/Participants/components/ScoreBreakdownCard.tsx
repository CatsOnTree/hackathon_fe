interface Breakdown {
  baseScore: number | null;
  skillScore: number | null;
  experienceScore: number | null;
  strengthScore: number | null;
  gapPenalty: number | null;
  finalScore: number | null;
}

interface Props {
  breakdown: Breakdown;
}

const metrics = [
  { label: "Base Score", key: "baseScore" },
  { label: "Skill Score", key: "skillScore" },
  { label: "Experience Score", key: "experienceScore" },
  { label: "Strength Score", key: "strengthScore" },
  { label: "Gap Penalty", key: "gapPenalty" },
  { label: "Final AI Score", key: "finalScore" },
] as const;

function metricTone(label: string, value: number | null) {
  if (label === "Gap Penalty" && value) return "text-rose-600";
  if (label === "Final AI Score" || value === null) return "text-zinc-700";
  if (value && value >= 80) return "text-emerald-600";
  if (value && value >= 60) return "text-amber-600";
  return "text-zinc-700";
}

export function ScoreBreakdownCard({ breakdown }: Props) {
  return (
    <div className="surface p-6">
      <h3 className="mb-4 text-lg font-semibold text-zinc-900">
        AI Score Breakdown
      </h3>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => {
          const value = breakdown[metric.key];
          const displayValue = value === null ? "—" : `${value}`;
          return (
            <div
              key={metric.label}
              className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4"
            >
              <p className="text-sm text-zinc-500">{metric.label}</p>
              <p
                className={`mt-2 text-xl font-semibold ${metricTone(metric.label, value)}`}
              >
                {displayValue}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
