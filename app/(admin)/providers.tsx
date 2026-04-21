"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReCaptchaProvider } from "@app/components/ReCaptcha";
import { AuthProvider } from "@/hooks/use-auth";
import { AdminAuthProvider } from "@/hooks/use-admin-auth";
import { SocketProvider } from "@/providers/socket-provider";
import AdminPanelProtection from "@/components/admin/AdminPanelProtection";
import { Toaster } from "@app/components/ui/toaster";
import { queryClient } from "@/lib/queryClient";
import { AdminHeader } from "@/views/admin/header";

export default function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ReCaptchaProvider>
          <AuthProvider>
            <AdminAuthProvider>
              <SocketProvider>
                <AdminPanelProtection>
                  <AdminHeader />
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-8">
                    <div className="max-w-full overflow-x-hidden">
                      {children}
                    </div>
                  </div>
                  <Toaster />
                </AdminPanelProtection>
              </SocketProvider>
            </AdminAuthProvider>
          </AuthProvider>
        </ReCaptchaProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
