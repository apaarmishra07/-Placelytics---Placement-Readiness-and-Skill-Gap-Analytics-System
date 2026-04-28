import { Router, type IRouter } from "express";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db, studentsTable } from "@workspace/db";
import {
  CreateStudentBody,
  DeleteStudentParams,
  GetStudentParams,
  GetStudentReportUrlParams,
  GetStudentResponse,
  GetStudentScoreParams,
  GetStudentScoreResponse,
  GetStudentSkillGapParams,
  GetStudentSkillGapResponse,
  ListStudentsQueryParams,
  ListStudentsResponse,
  UpdateStudentBody,
  UpdateStudentParams,
  UpdateStudentResponse,
} from "@workspace/api-zod";
import { computeBreakdown, withScore } from "../lib/scoring";
import { computeSkillGap } from "../lib/roles";
import { buildRecommendations } from "../lib/recommendations";
import { generateStudentPdf } from "../lib/pdf";

const router: IRouter = Router();

router.get("/students", async (req, res): Promise<void> => {
  const parsed = ListStudentsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { batch, targetRole, search } = parsed.data;
  const conditions = [];
  if (batch) conditions.push(eq(studentsTable.batch, batch));
  if (targetRole) conditions.push(eq(studentsTable.targetRole, targetRole));
  if (search) {
    conditions.push(
      or(
        ilike(studentsTable.name, `%${search}%`),
        ilike(studentsTable.email, `%${search}%`),
        ilike(studentsTable.rollNumber, `%${search}%`),
      )!,
    );
  }
  const rows = await db
    .select()
    .from(studentsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(studentsTable.updatedAt));
  const enriched = rows.map(withScore);
  res.json(ListStudentsResponse.parse(enriched));
});

router.post("/students", async (req, res): Promise<void> => {
  const parsed = CreateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(studentsTable)
    .values(parsed.data)
    .returning();
  if (!row) {
    res.status(500).json({ error: "Failed to create student" });
    return;
  }
  res.status(201).json(GetStudentResponse.parse(buildDetail(row)));
});

router.get("/students/:id", async (req, res): Promise<void> => {
  const params = GetStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  res.json(GetStudentResponse.parse(buildDetail(row)));
});

router.put("/students/:id", async (req, res): Promise<void> => {
  const params = UpdateStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(studentsTable)
    .set(parsed.data)
    .where(eq(studentsTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  res.json(UpdateStudentResponse.parse(withScore(row)));
});

router.delete("/students/:id", async (req, res): Promise<void> => {
  const params = DeleteStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(studentsTable)
    .where(eq(studentsTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/students/:id/score", async (req, res): Promise<void> => {
  const params = GetStudentScoreParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  res.json(GetStudentScoreResponse.parse(computeBreakdown(row)));
});

router.get("/students/:id/skill-gap", async (req, res): Promise<void> => {
  const params = GetStudentSkillGapParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  res.json(
    GetStudentSkillGapResponse.parse(
      computeSkillGap(row.targetRole, row.currentSkills),
    ),
  );
});

router.get("/students/:id/report", async (req, res): Promise<void> => {
  const params = GetStudentReportUrlParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  res.json({
    url: `/api/students/${params.data.id}/report.pdf`,
    filename: `placelytics-student-${params.data.id}.pdf`,
  });
});

router.get("/students/:id/report.pdf", async (req, res): Promise<void> => {
  const idRaw = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;
  const id = parseInt(String(idRaw), 10);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid student id" });
    return;
  }
  const [row] = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.id, id));
  if (!row) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  const breakdown = computeBreakdown(row);
  const gap = computeSkillGap(row.targetRole, row.currentSkills);
  const recs = buildRecommendations(breakdown, gap);
  const pdf = generateStudentPdf({
    student: row,
    breakdown,
    gap,
    recommendations: recs,
  });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="placelytics-student-${row.id}.pdf"`,
  );
  res.send(pdf);
});

function buildDetail(row: typeof studentsTable.$inferSelect) {
  const breakdown = computeBreakdown(row);
  const gap = computeSkillGap(row.targetRole, row.currentSkills);
  const recommendations = buildRecommendations(breakdown, gap);
  return {
    ...row,
    score: breakdown.total,
    readinessLevel: breakdown.readinessLevel,
    breakdown,
    skillGap: gap,
    recommendations,
    reportUrl: `/api/students/${row.id}/report.pdf`,
  };
}

// Suppress unused import warning while exposing helper for typing
void sql;

export default router;
