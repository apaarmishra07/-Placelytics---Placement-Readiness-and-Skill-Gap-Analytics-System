import type { Student } from "@workspace/db";

export type ReadinessLevel =
  | "ready"
  | "almost-ready"
  | "needs-improvement"
  | "critical";

export interface ScoreBreakdown {
  marks: number;
  aptitude: number;
  skillScore: number;
  projects: number;
  weightedMarks: number;
  weightedAptitude: number;
  weightedSkill: number;
  weightedProjects: number;
  total: number;
  readinessLevel: ReadinessLevel;
}

export const WEIGHT_MARKS = 0.4;
export const WEIGHT_APTITUDE = 0.2;
export const WEIGHT_SKILL = 0.3;
export const WEIGHT_PROJECTS = 0.1;

export function projectsToScore(projects: number): number {
  return Math.min(projects * 20, 100);
}

export function readinessLevelFor(total: number): ReadinessLevel {
  if (total >= 80) return "ready";
  if (total >= 65) return "almost-ready";
  if (total >= 50) return "needs-improvement";
  return "critical";
}

export function computeBreakdown(input: {
  marks: number;
  aptitude: number;
  skillScore: number;
  projects: number;
}): ScoreBreakdown {
  const projectsNorm = projectsToScore(input.projects);
  const weightedMarks = round2(input.marks * WEIGHT_MARKS);
  const weightedAptitude = round2(input.aptitude * WEIGHT_APTITUDE);
  const weightedSkill = round2(input.skillScore * WEIGHT_SKILL);
  const weightedProjects = round2(projectsNorm * WEIGHT_PROJECTS);
  const total = round2(
    weightedMarks + weightedAptitude + weightedSkill + weightedProjects,
  );
  return {
    marks: round2(input.marks),
    aptitude: round2(input.aptitude),
    skillScore: round2(input.skillScore),
    projects: projectsNorm,
    weightedMarks,
    weightedAptitude,
    weightedSkill,
    weightedProjects,
    total,
    readinessLevel: readinessLevelFor(total),
  };
}

export function withScore(student: Student): Student & {
  score: number;
  readinessLevel: ReadinessLevel;
} {
  const b = computeBreakdown(student);
  return { ...student, score: b.total, readinessLevel: b.readinessLevel };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
