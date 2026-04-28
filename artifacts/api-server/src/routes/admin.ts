import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, studentsTable } from "@workspace/db";
import {
  GetAdminDashboardResponse,
  GetRecentActivityQueryParams,
  GetRecentActivityResponse,
  GetScoreDistributionResponse,
  GetTopStudentsQueryParams,
  GetTopStudentsResponse,
  ListBatchesResponse,
} from "@workspace/api-zod";
import { withScore } from "../lib/scoring";

const router: IRouter = Router();

router.get("/admin/dashboard", async (_req, res): Promise<void> => {
  const rows = await db.select().from(studentsTable);
  const enriched = rows.map(withScore);
  const total = enriched.length;
  const avg =
    total === 0
      ? 0
      : Math.round(
          (enriched.reduce((acc, s) => acc + s.score, 0) / total) * 100,
        ) / 100;
  const ready = enriched.filter((s) => s.readinessLevel === "ready").length;
  const almost = enriched.filter((s) => s.readinessLevel === "almost-ready")
    .length;
  const needs = enriched.filter(
    (s) => s.readinessLevel === "needs-improvement",
  ).length;
  const critical = enriched.filter((s) => s.readinessLevel === "critical")
    .length;

  const top = [...enriched].sort((a, b) => b.score - a.score).slice(0, 10);
  const batches = computeBatchSummaries(enriched);
  const distribution = computeDistribution(enriched);
  const roles = computeRoleSummaries(enriched);

  res.json(
    GetAdminDashboardResponse.parse({
      totalStudents: total,
      averageScore: avg,
      readyCount: ready,
      almostReadyCount: almost,
      needsImprovementCount: needs,
      criticalCount: critical,
      topStudents: top,
      batchAverages: batches,
      scoreDistribution: distribution,
      roleDistribution: roles,
    }),
  );
});

router.get("/admin/batches", async (_req, res): Promise<void> => {
  const rows = await db.select().from(studentsTable);
  const enriched = rows.map(withScore);
  res.json(ListBatchesResponse.parse(computeBatchSummaries(enriched)));
});

router.get("/admin/top-students", async (req, res): Promise<void> => {
  const parsed = GetTopStudentsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const limit = parsed.data.limit ?? 10;
  const rows = await db.select().from(studentsTable);
  const enriched = rows.map(withScore);
  const top = [...enriched].sort((a, b) => b.score - a.score).slice(0, limit);
  res.json(GetTopStudentsResponse.parse(top));
});

router.get("/admin/score-distribution", async (_req, res): Promise<void> => {
  const rows = await db.select().from(studentsTable);
  const enriched = rows.map(withScore);
  res.json(GetScoreDistributionResponse.parse(computeDistribution(enriched)));
});

router.get("/admin/recent-activity", async (req, res): Promise<void> => {
  const parsed = GetRecentActivityQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const limit = parsed.data.limit ?? 10;
  const rows = await db
    .select()
    .from(studentsTable)
    .orderBy(desc(studentsTable.updatedAt))
    .limit(limit);
  const items = rows.map((r) => {
    const w = withScore(r);
    const created = r.createdAt.getTime();
    const updated = r.updatedAt.getTime();
    const action: "created" | "updated" =
      Math.abs(updated - created) < 1500 ? "created" : "updated";
    return {
      id: r.id,
      studentId: r.id,
      studentName: r.name,
      action,
      score: w.score,
      timestamp: r.updatedAt.toISOString(),
    };
  });
  res.json(GetRecentActivityResponse.parse(items));
});

function computeBatchSummaries(
  enriched: ReturnType<typeof withScore>[],
): {
  batch: string;
  studentCount: number;
  averageScore: number;
  averageMarks: number;
  averageAptitude: number;
  averageSkill: number;
  readyCount: number;
}[] {
  const groups = new Map<string, ReturnType<typeof withScore>[]>();
  for (const s of enriched) {
    const arr = groups.get(s.batch) ?? [];
    arr.push(s);
    groups.set(s.batch, arr);
  }
  const result = [];
  for (const [batch, list] of groups) {
    const n = list.length;
    result.push({
      batch,
      studentCount: n,
      averageScore: round2(list.reduce((a, s) => a + s.score, 0) / n),
      averageMarks: round2(list.reduce((a, s) => a + s.marks, 0) / n),
      averageAptitude: round2(list.reduce((a, s) => a + s.aptitude, 0) / n),
      averageSkill: round2(list.reduce((a, s) => a + s.skillScore, 0) / n),
      readyCount: list.filter((s) => s.readinessLevel === "ready").length,
    });
  }
  return result.sort((a, b) => a.batch.localeCompare(b.batch));
}

function computeDistribution(enriched: ReturnType<typeof withScore>[]): {
  bucket: string;
  min: number;
  max: number;
  count: number;
}[] {
  const buckets = [
    { bucket: "0-19", min: 0, max: 19 },
    { bucket: "20-39", min: 20, max: 39 },
    { bucket: "40-59", min: 40, max: 59 },
    { bucket: "60-69", min: 60, max: 69 },
    { bucket: "70-79", min: 70, max: 79 },
    { bucket: "80-89", min: 80, max: 89 },
    { bucket: "90-100", min: 90, max: 100 },
  ];
  return buckets.map((b) => ({
    ...b,
    count: enriched.filter((s) => s.score >= b.min && s.score <= b.max).length,
  }));
}

function computeRoleSummaries(enriched: ReturnType<typeof withScore>[]): {
  role: string;
  studentCount: number;
  averageScore: number;
}[] {
  const groups = new Map<string, ReturnType<typeof withScore>[]>();
  for (const s of enriched) {
    const arr = groups.get(s.targetRole) ?? [];
    arr.push(s);
    groups.set(s.targetRole, arr);
  }
  const result = [];
  for (const [role, list] of groups) {
    result.push({
      role,
      studentCount: list.length,
      averageScore: round2(list.reduce((a, s) => a + s.score, 0) / list.length),
    });
  }
  return result.sort((a, b) => b.studentCount - a.studentCount);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export default router;
