import type { Student } from "@workspace/db";
import type { ScoreBreakdown } from "./scoring";
import type { SkillGapResult } from "./roles";

interface PdfInput {
  student: Student;
  breakdown: ScoreBreakdown;
  gap: SkillGapResult;
  recommendations: string[];
}

interface PdfObject {
  num: number;
  body: string;
}

const FONT_FALLBACK = "Helvetica";

function escapePdfText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function readinessLabel(level: string): string {
  switch (level) {
    case "ready":
      return "Placement Ready";
    case "almost-ready":
      return "Almost Ready";
    case "needs-improvement":
      return "Needs Improvement";
    case "critical":
      return "Critical";
    default:
      return level;
  }
}

interface ContentLine {
  text: string;
  font?: "title" | "section" | "body" | "small";
  yOffset?: number;
}

function buildContentStream(lines: ContentLine[]): string {
  let stream = "BT\n";
  let firstLine = true;
  for (const line of lines) {
    const fontSize =
      line.font === "title"
        ? 24
        : line.font === "section"
          ? 14
          : line.font === "small"
            ? 9
            : 11;
    const fontName = line.font === "title" || line.font === "section"
      ? "/F2"
      : "/F1";
    const yOffset = line.yOffset ?? (firstLine ? 0 : -16);
    if (firstLine) {
      stream += `${fontName} ${fontSize} Tf\n`;
      stream += `1 0 0 1 60 780 Tm\n`;
      firstLine = false;
    } else {
      stream += `${fontName} ${fontSize} Tf\n`;
      stream += `0 ${yOffset} Td\n`;
    }
    stream += `(${escapePdfText(line.text)}) Tj\n`;
  }
  stream += "ET\n";
  return stream;
}

export function generateStudentPdf(input: PdfInput): Buffer {
  const { student, breakdown, gap, recommendations } = input;

  const lines: ContentLine[] = [];
  lines.push({ text: "Placelytics", font: "title" });
  lines.push({
    text: "Placement Readiness Report",
    font: "section",
    yOffset: -22,
  });
  lines.push({ text: " ", font: "small" });
  lines.push({ text: `Name: ${student.name}` });
  lines.push({ text: `Email: ${student.email}` });
  lines.push({ text: `Roll No: ${student.rollNumber}` });
  lines.push({ text: `Batch: ${student.batch}` });
  lines.push({ text: `Target Role: ${student.targetRole}` });
  lines.push({ text: " " });
  lines.push({ text: "Readiness Score", font: "section" });
  lines.push({
    text: `Total: ${breakdown.total} / 100  (${readinessLabel(breakdown.readinessLevel)})`,
  });
  lines.push({
    text: `Academic Marks (40%): ${breakdown.marks} -> ${breakdown.weightedMarks}`,
  });
  lines.push({
    text: `Aptitude (20%):       ${breakdown.aptitude} -> ${breakdown.weightedAptitude}`,
  });
  lines.push({
    text: `Skill Score (30%):    ${breakdown.skillScore} -> ${breakdown.weightedSkill}`,
  });
  lines.push({
    text: `Projects (10%):       ${student.projects} project(s) (${breakdown.projects}/100) -> ${breakdown.weightedProjects}`,
  });
  lines.push({ text: " " });
  lines.push({ text: "Skill Gap Analysis", font: "section" });
  lines.push({ text: `Coverage for ${gap.targetRole}: ${gap.coverage}%` });
  lines.push({
    text: `Matched (${gap.matchedSkills.length}): ${gap.matchedSkills.join(", ") || "(none yet)"}`,
  });
  lines.push({
    text: `Missing (${gap.missingSkills.length}): ${gap.missingSkills.join(", ") || "(none)"}`,
  });
  lines.push({ text: " " });
  lines.push({ text: "Recommendations", font: "section" });
  recommendations.forEach((r, i) => {
    lines.push({ text: `${i + 1}. ${r}` });
  });
  lines.push({ text: " " });
  lines.push({
    text: `Generated: ${new Date().toISOString()}`,
    font: "small",
  });

  const contentStream = buildContentStream(lines);

  const objects: PdfObject[] = [];
  const addObj = (body: string) => {
    objects.push({ num: objects.length + 1, body });
    return objects.length;
  };

  // 1 Catalog
  addObj("<< /Type /Catalog /Pages 2 0 R >>");
  // 2 Pages
  addObj("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  // 3 Page
  addObj(
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>",
  );
  // 4 Contents
  const streamBody = `<< /Length ${Buffer.byteLength(contentStream, "utf8")} >>\nstream\n${contentStream}endstream`;
  addObj(streamBody);
  // 5 Font Helvetica
  addObj(`<< /Type /Font /Subtype /Type1 /BaseFont /${FONT_FALLBACK} >>`);
  // 6 Font Helvetica-Bold
  addObj(`<< /Type /Font /Subtype /Type1 /BaseFont /${FONT_FALLBACK}-Bold >>`);

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${obj.num} 0 obj\n${obj.body}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    pdf += `${String(off).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, "utf8");
}
