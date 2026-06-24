import { pgTable, serial, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roleEnum = pgEnum("user_role", ["superadmin", "admin", "faculty", "student"]);
export const statusEnum = pgEnum("user_status", ["pending", "active", "blocked", "rejected"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  mobileNumber: text("mobile_number"),
  role: roleEnum("role").notNull().default("student"),
  status: statusEnum("status").notNull().default("pending"),
  profilePhoto: text("profile_photo"),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  address: text("address"),
  qualification: text("qualification"),
  occupation: text("occupation"),
  interestedCourse: text("interested_course"),
  experience: text("experience"),
  expertise: text("expertise"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
