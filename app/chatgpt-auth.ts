import { auth } from "@clerk/nextjs/server";

export type ChatGPTUser = {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  fullName: string | null;
};

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  const { userId } = await auth();
  if (!userId) return null;
  return { id: userId, userId, displayName: userId, email: "", fullName: null };
}
