import { pgTable, serial, text, timestamp, integer, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { coursesTable } from "./courses";
import { usersTable } from "./users";

export const lecturesTable = pgTable("lectures", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  courseId: integer("course_id").notNull().references(() => coursesTable.id),
  youtubeVideoId: text("youtube_video_id").notNull(),
  thumbnail: text("thumbnail"),
  facultyId: integer("faculty_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLectureSchema = createInsertSchema(lecturesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLecture = z.infer<typeof insertLectureSchema>;
export type Lecture = typeof lecturesTable.$inferSelect;

export const liveClassesTable = pgTable("live_classes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  courseId: integer("course_id").notNull().references(() => coursesTable.id),
  scheduledAt: text("scheduled_at").notNull(),
  youtubeUrl: text("youtube_url").notNull(),
  facultyId: integer("faculty_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLiveClassSchema = createInsertSchema(liveClassesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLiveClass = z.infer<typeof insertLiveClassSchema>;
export type LiveClass = typeof liveClassesTable.$inferSelect;

// Lecture progress (student completion tracking)
export const lectureProgressTable = pgTable("lecture_progress", {
  id: serial("id").primaryKey(),
  lectureId: integer("lecture_id").notNull().references(() => lecturesTable.id, { onDelete: "cascade" }),
  studentId: integer("student_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
}, (t) => [
  unique("lecture_progress_unique").on(t.lectureId, t.studentId),
]);

export type LectureProgress = typeof lectureProgressTable.$inferSelect;
