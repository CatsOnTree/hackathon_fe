interface Props {
  summary?: string;
}

export function CandidateSummaryCard({ summary }: Props) {
  return (
    <div className="surface p-6">
      <h3 className="mb-3 text-lg font-semibold text-zinc-900">
        About Candidate
      </h3>
      <p className="leading-7 text-zinc-700">
        {summary || "No AI summary available."}
      </p>
    </div>
  );
}
