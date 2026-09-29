import { boolean, index, pgTable, text } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  category: text("category").notNull().default("Personal"),
  priority: text("priority").notNull().default("none"),
  dueDate: text("due_date").notNull().default(""),
  completed: boolean("completed").notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  completedAt: text("completed_at"),
}, (table) => [index("tasks_user_updated_idx").on(table.userId, table.updatedAt)]);
