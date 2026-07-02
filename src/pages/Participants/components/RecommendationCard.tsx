interface Props {
  recommendation?: string;
  score: number;
}

function tone(score: number) {
  if (score >= 80) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (score >= 60) return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-rose-200 bg-rose-50 text-rose-800";
}

export function RecommendationCard({ recommendation, score }: Props) {
  const title =
    score >= 80
      ? "Strongly Recommended"
      : score >= 60
        ? "Recommended with Review"
        : "Needs Improvement";

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${tone(score)}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">AI Recommendation</h3>
        <span className="rounded-full bg-white/70 px-3 py-1 text-sm font-semibold">
          {title}
        </span>
      </div>
      <p className="leading-7">
        {recommendation || "No recommendation available yet."}
      </p>
    </div>
  );
}
