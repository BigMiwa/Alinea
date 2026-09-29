import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
export const metadata: Metadata = {title:"ALINEA — A little progress, every day",description:"A calm workspace to capture tasks, find your next step, and make room for what matters.",icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){
  const content=<html lang="en"><body><a className="skip-link" href="#main">Skip to content</a>{children}</body></html>;
  const publishableKey=process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return publishableKey?<ClerkProvider publishableKey={publishableKey}>{content}</ClerkProvider>:content;
}
