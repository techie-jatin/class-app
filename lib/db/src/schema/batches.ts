import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { coursesTable } from "./courses";
import { usersTable } from "./users";

export const batchesTable = pgTable("batches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  courseId: integer("course_id").notNull().references(() => coursesTable.id),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBatchSchema = createInsertSchema(batchesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBatch = z.infer<typeof insertBatchSchema>;
export type Batch = typeof batchesTable.$inferSelect;

// Batch members
export const batchMembersTable = pgTable("batch_members", {
  id: serial("id").primaryKey(),
  batchId: integer("batch_id").notNull().references(() => batchesTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  role: text("role").notNull(), // 'student' | 'faculty'
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
});

export type BatchMember = typeof batchMembersTable.$inferSelect;
