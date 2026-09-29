import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
export const metadata: Metadata = {title:"ALINEA — A little progress, every day",description:"A calm workspace to capture tasks, find your next step, and make room for what matters.",icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <ClerkProvider><html lang="en"><body><a className="skip-link" href="#main">Skip to content</a>{children}</body></html></ClerkProvider>;}
