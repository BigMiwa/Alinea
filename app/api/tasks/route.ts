import { desc, eq } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { tasks } from "@/db/schema";

const validPriorities = new Set(["none", "low", "medium", "high"]);
const validCategories = new Set(["Work", "Personal", "Learning"]);

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in to save your tasks." }, { status: 401 });
  const rows = await getDb().select().from(tasks).where(eq(tasks.userId, user.id)).orderBy(desc(tasks.updatedAt));
  return Response.json(rows);
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in to save your tasks." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim().slice(0, 120) : "";
  if (!title) return Response.json({ error: "A task name is required." }, { status: 400 });
  const now = new Date().toISOString();
  const task = { id: typeof body.id === "string" && body.id.length < 100 ? body.id : crypto.randomUUID(), userId: user.id, title, description: typeof body.description === "string" ? body.description.slice(0, 300) : "", category: validCategories.has(body.category) ? body.category : "Personal", priority: validPriorities.has(body.priority) ? body.priority : "none", dueDate: typeof body.dueDate === "string" ? body.dueDate.slice(0, 10) : "", completed: false, createdAt: now, updatedAt: now, completedAt: null };
  await getDb().insert(tasks).values(task);
  return Response.json(task, { status: 201 });
}
