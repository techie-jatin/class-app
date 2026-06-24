import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const activityLogsTable = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  userName: text("user_name").notNull(),
  userRole: text("user_role").notNull(),
  action: text("action").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogsTable.$inferSelect;

export const deviceSessionsTable = pgTable("device_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  deviceFingerprint: text("device_fingerprint").notNull(),
  token: text("token").notNull(),
  lastLoginAt: timestamp("last_login_at").defaultNow().notNull(),
});

export type DeviceSession = typeof deviceSessionsTable.$inferSelect;

export const systemSettingsTable = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  platformName: text("platform_name").notNull().default("Trading Academy"),
  platformLogo: text("platform_logo"),
  supportEmail: text("support_email").notNull().default("support@tradingacademy.com"),
  contactNumber: text("contact_number"),
  maintenanceMode: text("maintenance_mode").notNull().default("false"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SystemSettings = typeof systemSettingsTable.$inferSelect;

export const securityEventsTable = pgTable("security_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  eventType: text("event_type").notNull(), // 'failed_login' | 'device_change' | 'blocked'
  description: text("description").notNull(),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SecurityEvent = typeof securityEventsTable.$inferSelect;
