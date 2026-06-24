import { pgTable, serial, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const courseStatusEnum = pgEnum("course_status", ["active", "inactive"]);

export const coursesTable = pgTable("courses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  thumbnail: text("thumbnail"),
  status: courseStatusEnum("status").notNull().default("active"),
  facultyId: integer("faculty_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCourseSchema = createInsertSchema(coursesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof coursesTable.$inferSelect;

// Course access (student <-> course)
export const courseAccessTable = pgTable("course_access", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => coursesTable.id),
  studentId: integer("student_id").notNull().references(() => usersTable.id),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
});

export type CourseAccess = typeof courseAccessTable.$inferSelect;
