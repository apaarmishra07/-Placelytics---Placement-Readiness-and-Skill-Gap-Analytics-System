import {
  pgTable,
  serial,
  text,
  integer,
  doublePrecision,
  timestamp,
} from "drizzle-orm/pg-core";

export const studentsTable = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  batch: text("batch").notNull(),
  rollNumber: text("roll_number").notNull(),
  marks: doublePrecision("marks").notNull(),
  aptitude: doublePrecision("aptitude").notNull(),
  skillScore: doublePrecision("skill_score").notNull(),
  projects: integer("projects").notNull().default(0),
  targetRole: text("target_role").notNull(),
  currentSkills: text("current_skills").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Student = typeof studentsTable.$inferSelect;
export type InsertStudent = typeof studentsTable.$inferInsert;
