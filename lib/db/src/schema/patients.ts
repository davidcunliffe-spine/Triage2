import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const patientsTable = pgTable("patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  age: text("age").notNull(),
  species: text("species").notNull(),
  presentingProblem: text("presenting_problem").notNull(),
  triageClass: text("triage_class").notNull(),
  consultationOrder: integer("consultation_order"),
  caseOwner: text("case_owner").notNull(),
  notes: text("notes"),
  arrivedAt: timestamp("arrived_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  seenAt: timestamp("seen_at", { withTimezone: true }),
  isSeen: boolean("is_seen").notNull().default(false),
  isRemoved: boolean("is_removed").notNull().default(false),
  removedAt: timestamp("removed_at", { withTimezone: true }),
  inConsult: boolean("in_consult").notNull().default(false),
  consultStartedAt: timestamp("consult_started_at", { withTimezone: true }),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertPatientSchema = createInsertSchema(patientsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  seenAt: true,
  isSeen: true,
});

export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patientsTable.$inferSelect;
