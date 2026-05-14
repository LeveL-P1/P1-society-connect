"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import LegalAdviserCall from "@/components/ui/LegalAdviserCall";
import { usePushNotifications } from "@/lib/use-push";
import { UserProvider, useUser } from "@/lib/user-context";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useUser();

  // Auto-subscribe to push notifications
  usePushNotifications();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar
        societyName={user.societyName}
        societyAddress={user.societyAddress}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={user.role}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          userName={user.name}
          userRole={user.role}
          userEmail={user.email}
          joinCode={user.joinCode}
          onMenuToggle={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6" style={{ paddingBottom: "calc(4.5rem + env(safe-area-inset-bottom, 0px))" }} >{children}</main>
      </div>
      <BottomNav userRole={user.role} />
      <LegalAdviserCall />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <DashboardShell>{children}</DashboardShell>
    </UserProvider>
  );
}
