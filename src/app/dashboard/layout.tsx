"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { DashboardContext } from "@/lib/dashboard-context";
import { CreateRestaurant } from "@/components/dashboard/create-restaurant";
import { createClient } from "@/lib/supabase/client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data, loading, isUsingMock, refetch } = useDashboardData();
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [noRestaurant, setNoRestaurant] = useState(false);

  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({
          email: authUser.email || "",
          name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "",
        });
      }
    }
    getUser();
  }, []);

  // Check if dashboard data came back with no restaurant
  useEffect(() => {
    if (!loading && !data?.restaurant?.id) {
      setNoRestaurant(true);
    } else if (data?.restaurant?.id) {
      setNoRestaurant(false);
    }
  }, [loading, data]);

  // Show create restaurant flow if user has no restaurant
  if (noRestaurant && !isUsingMock && user) {
    return (
      <div className="min-h-screen bg-[#F5FAF7]">
        {/* Simple top bar */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <span className="font-[family-name:var(--font-serif)] text-xl text-[#0D1B1E]">
            mi<span className="text-[#2ECC87]">propina</span>
          </span>
          <span className="text-sm text-gray-500">{user.email}</span>
        </div>
        <div className="p-6">
          <CreateRestaurant
            userEmail={user.email}
            userName={user.name}
            onCreated={refetch}
          />
        </div>
      </div>
    );
  }

  return (
    <DashboardContext.Provider value={{ data, loading, isUsingMock, refetch }}>
      <div className="min-h-screen bg-[#F5FAF7]">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          restaurantName={data?.restaurant.name}
          restaurantEmoji={data?.restaurant.logo_emoji}
          restaurantLogoUrl={data?.restaurant.logo_url}
          staffRole={data?.currentUserRole || "waiter"}
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
