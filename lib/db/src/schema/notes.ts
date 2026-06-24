import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { coursesTable } from "./courses";
import { usersTable } from "./users";

export const notesTable = pgTable("notes", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  courseId: integer("course_id").notNull().references(() => coursesTable.id),
  driveFileId: text("drive_file_id").notNull(),
  driveViewUrl: text("drive_view_url"),
  facultyId: integer("faculty_id").references(() => usersTable.id),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertNoteSchema = createInsertSchema(notesTable).omit({
  id: true,
  uploadedAt: true,
});

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notesTable.$inferSelect;
