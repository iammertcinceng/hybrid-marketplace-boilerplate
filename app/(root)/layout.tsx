import * as React from "react";
import type { Metadata } from "next";
import { ClientLayout } from "@app/components/ClientLayout";
import "../globals.css";
import { getSiteSettings } from "@app/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  // Get site settings for metadata
  const settings = await getSiteSettings();
  
  return {
    title: settings.home_title || "SaaS Boilerplate",
    description: settings.home_description || "Reliable classifieds platform where you can find used items, vehicles and more.",
    icons: settings.site_favicon ? { icon: settings.site_favicon } : undefined,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Load site settings on server-side
  const settings = await getSiteSettings();
  
  return <ClientLayout settings={settings}>{children}</ClientLayout>;
}
