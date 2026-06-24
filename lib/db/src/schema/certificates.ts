import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { coursesTable } from "./courses";
import { usersTable } from "./users";

export const certificatesTable = pgTable("certificates", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => usersTable.id),
  courseId: integer("course_id").notNull().references(() => coursesTable.id),
  certificateNumber: text("certificate_number").notNull().unique(),
  issueDate: text("issue_date").notNull(),
  driveFileId: text("drive_file_id"),
  driveViewUrl: text("drive_view_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCertificateSchema = createInsertSchema(certificatesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificatesTable.$inferSelect;
