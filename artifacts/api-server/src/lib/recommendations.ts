import type { ScoreBreakdown } from "./scoring";
import type { SkillGapResult } from "./roles";

export function buildRecommendations(
  breakdown: ScoreBreakdown,
  gap: SkillGapResult,
): string[] {
  const recs: string[] = [];

  if (breakdown.marks < 70) {
    recs.push(
      "Strengthen academics — target +10 in core subjects through weekly mock tests and revision blocks.",
    );
  }
  if (breakdown.aptitude < 70) {
    recs.push(
      "Practice quantitative aptitude and logical reasoning daily (30 min). Try platforms like IndiaBix or Aptipedia.",
    );
  }
  if (breakdown.skillScore < 70) {
    recs.push(
      "Take a structured assessment in your target role's primary stack to lift the skill score.",
    );
  }
  if (breakdown.projects < 60) {
    recs.push(
      "Ship at least one substantial end-to-end project for the portfolio — depth beats count.",
    );
  }

  if (gap.missingSkills.length > 0) {
    const top = gap.missingSkills.slice(0, 3).join(", ");
    recs.push(
      `Close the skill gap for ${gap.targetRole}: prioritise ${top}.`,
    );
  }

  if (gap.coverage >= 80 && breakdown.total >= 75) {
    recs.push(
      "Begin mock interviews and resume reviews — readiness is high; convert it.",
    );
  }

  if (recs.length === 0) {
    recs.push(
      "All key indicators look strong. Maintain practice cadence and start mock interviews.",
    );
  }

  return recs;
}
