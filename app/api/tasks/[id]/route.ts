import { and, eq } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { tasks } from "@/db/schema";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in to save your tasks." }, { status: 401 });
  const { id } = await context.params; const body = await request.json().catch(() => null);
  const values: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (typeof body?.completed === "boolean") { values.completed = body.completed; values.completedAt = body.completed ? new Date().toISOString() : null; }
  if (typeof body?.title === "string" && body.title.trim()) values.title = body.title.trim().slice(0, 120);
  await getDb().update(tasks).set(values).where(and(eq(tasks.id, id), eq(tasks.userId, user.id)));
  return Response.json({ ok: true });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in to save your tasks." }, { status: 401 });
  const { id } = await context.params;
  await getDb().delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, user.id)));
  return Response.json({ ok: true });
}
