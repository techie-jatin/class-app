import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  imageUrl: text("image_url"),
  target: text("target").notNull().default("all"), // 'all' | 'students' | 'faculty'
  sentById: integer("sent_by_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notificationsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notificationsTable.$inferSelect;

// Per-user read receipts
export const notificationReadsTable = pgTable("notification_reads", {
  id: serial("id").primaryKey(),
  notificationId: integer("notification_id").notNull().references(() => notificationsTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  readAt: timestamp("read_at").defaultNow().notNull(),
});

export type NotificationRead = typeof notificationReadsTable.$inferSelect;
