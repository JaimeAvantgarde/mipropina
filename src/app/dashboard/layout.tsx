"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { DashboardContext } from "@/lib/dashboard-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data, loading, isUsingMock, refetch } = useDashboardData();

  return (
    <DashboardContext.Provider value={{ data, loading, isUsingMock, refetch }}>
      <div className="min-h-screen bg-[#F5FAF7]">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          restaurantName={data?.restaurant.name}
          restaurantEmoji={data?.restaurant.logo_emoji}
          staffRole={
            data?.staff.find((s) => s.role === "owner") ? "owner" : "waiter"
          }
        />

        {/* Mobile top bar */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Abrir menu"
          >
            <svg
              width="20"
              height="16"
              viewBox="0 0 20 16"
              fill="none"
              stroke="#0D1B1E"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="0" y1="2" x2="20" y2="2" />
              <line x1="0" y1="8" x2="20" y2="8" />
              <line x1="0" y1="14" x2="20" y2="14" />
            </svg>
          </button>
          <h1 className="text-lg font-[family-name:var(--font-serif)] text-[#0D1B1E]">
            mipropina
          </h1>
          <div className="w-10" />
        </div>

        {/* Main content */}
        <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
          <div className="p-6 lg:p-8 max-w-6xl">{children}</div>
        </main>
      </div>
    </DashboardContext.Provider>
  );
}
