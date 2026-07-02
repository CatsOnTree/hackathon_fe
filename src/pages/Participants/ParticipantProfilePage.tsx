import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { useParticipant } from "../../hooks/useParticipants";
import { getApiErrorMessage } from "../../utils/api";
import { ProfileSidebar } from "./components/ProfileSidebar";
import { CandidateSummaryCard } from "./components/CandidateSummaryCard";
import { RecommendationCard } from "./components/RecommendationCard";
import { ScoreBreakdownCard } from "./components/ScoreBreakdownCard";
import { SquadMembers } from "./components/SquadMembers";

interface ResumeAnalysisShape {
  summary?: string;
  recommendation?: string;
  strengths?: string[];
  gaps?: string[];
  scoreBreakdown?: Record<string, unknown>;
  skills?: string[];
  aiScore?: number;
}

function parseResumeAnalysis(value?: string | null) {
  if (!value) return null;

  if (typeof value === "object") {
    return value as ResumeAnalysisShape;
  }

  try {
    const parsed = JSON.parse(value) as ResumeAnalysisShape | null;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function getValueFromBreakdown(
  breakdown: Record<string, unknown> | undefined,
  keys: string[],
) {
  for (const key of keys) {
    const value = breakdown?.[key];
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return null;
}

export function ParticipantProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const participantId = Number(id);
  const {
    data: participant,
    isLoading,
    error,
  } = useParticipant(
    Number.isFinite(participantId) && participantId > 0 ? participantId : 0,
  );

  const analysis = useMemo(
    () => parseResumeAnalysis(participant?.resumeAnalysisJson),
    [participant?.resumeAnalysisJson],
  );

  const skills = useMemo(() => {
    if (!participant?.skills) return [];
    return participant.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }, [participant?.skills]);

  const breakdown = useMemo(() => {
    const scoreBreakdown = analysis?.scoreBreakdown as
      | Record<string, unknown>
      | undefined;
    const baseScore = getValueFromBreakdown(scoreBreakdown, [
      "baseScore",
      "Base Score",
      "base",
    ]);
    const skillScore = getValueFromBreakdown(scoreBreakdown, [
      "skillScore",
      "Skill Score",
      "skills",
    ]);
    const experienceScore = getValueFromBreakdown(scoreBreakdown, [
      "experienceScore",
      "Experience Score",
      "experience",
    ]);
    const strengthScore = getValueFromBreakdown(scoreBreakdown, [
      "strengthScore",
      "Strength Score",
      "strengths",
    ]);
    const gapPenalty = getValueFromBreakdown(scoreBreakdown, [
      "gapPenalty",
      "Gap Penalty",
      "gapPenalty",
    ]);
    const finalScore =
      getValueFromBreakdown(scoreBreakdown, [
        "finalScore",
        "Final AI Score",
        "score",
      ]) ??
      participant?.aiScore ??
      null;

    return {
      baseScore,
      skillScore,
      experienceScore,
      strengthScore,
      gapPenalty,
      finalScore,
    };
  }, [analysis?.scoreBreakdown, participant?.aiScore]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Participant Profile"
          description="Loading candidate profile details."
        />
        <div className="grid gap-6 lg:grid-cols-[30%_1fr]">
          <div className="surface p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="h-24 w-24 animate-pulse rounded-full bg-zinc-200" />
              <div className="h-4 w-32 animate-pulse rounded bg-zinc-200" />
              <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
            </div>
            <div className="mt-6 space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-zinc-200" />
              <div className="h-4 w-full animate-pulse rounded bg-zinc-200" />
              <div className="h-4 w-full animate-pulse rounded bg-zinc-200" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="surface h-40 animate-pulse" />
            <div className="surface h-32 animate-pulse" />
            <div className="surface h-32 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !participant) {
    const isNotFound =
      (error as { response?: { status?: number } } | undefined)?.response
        ?.status === 404;
    return (
      <div className="space-y-4">
        <PageHeader
          title="Participant Profile"
          description="Review candidate details and AI insights."
        />
        <div className="surface p-8">
          {isNotFound ? (
            <EmptyState
              title="Participant not found"
              description="The requested participant could not be found."
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 text-center">
              <p className="text-lg font-semibold text-zinc-900">
                Unable to load this profile
              </p>
              <p className="max-w-md text-sm text-zinc-600">
                {getApiErrorMessage(error)}
              </p>
              <button
                className="btn-secondary"
                onClick={() => navigate("/participants")}
              >
                Back to participants
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const finalScore =
    typeof breakdown.finalScore === "number"
      ? breakdown.finalScore
      : (participant.aiScore ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title={participant.name}
          description={participant.participantCode}
        />
        <button
          className="btn-secondary"
          onClick={() => navigate("/participants")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to participants
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[30%_1fr]">
        <ProfileSidebar
          participant={participant}
          skills={skills}
          aiScore={finalScore}
        />

        <div className="space-y-6">
          <CandidateSummaryCard summary={analysis?.summary} />
          <RecommendationCard
            recommendation={analysis?.recommendation}
            score={finalScore}
          />

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="surface p-6">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-semibold text-zinc-900">
                  Strengths
                </h3>
              </div>
              {analysis?.strengths?.length ? (
                <div className="space-y-3">
                  {analysis.strengths.map((strength) => (
                    <div
                      key={strength}
                      className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-sm text-emerald-800"
                    >
                      <span className="mr-2 font-semibold">✓</span>
                      {strength}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-600">
                  No strengths have been captured yet.
                </p>
              )}
            </div>

            <div className="surface p-6">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-600" />
                <h3 className="text-lg font-semibold text-zinc-900">
                  Improvement Areas
                </h3>
              </div>
              {analysis?.gaps?.length ? (
                <div className="space-y-3">
                  {analysis.gaps.map((gap) => (
                    <div
                      key={gap}
                      className="rounded-xl border border-amber-100 bg-amber-50/70 p-3 text-sm text-amber-800"
                    >
                      <span className="mr-2 font-semibold">!</span>
                      {gap}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-600">
                  No improvement areas identified yet.
                </p>
              )}
            </div>
          </div>

          <ScoreBreakdownCard breakdown={breakdown} />
          <SquadMembers />
        </div>
      </div>
    </div>
  );
}
