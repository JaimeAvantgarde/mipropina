"use client";

import { useState, useEffect, useCallback } from "react";
import type { Restaurant, Staff, Tip, InviteCode } from "@/lib/types";

// Mock data for fallback when Supabase is not available
const mockRestaurant: Restaurant = {
  id: "demo",
  name: "La Tasca de Maria",
  slug: "la-tasca-de-maria",
  logo_emoji: "🍽️",
  logo_url: null,
  theme_color: "#2ECC87",
  owner_id: "1",
  stripe_account_id: null,
  stripe_charges_enabled: false,
  stripe_payouts_enabled: false,
  tip_amounts: [100, 200, 300, 500],
  custom_amount_enabled: true,
  thank_you_message: null,
  email_notifications_enabled: true,
  notification_email: null,
  google_maps_url: null,
  created_at: "2024-01-01",
  deleted_at: null,
};

const mockTips: Tip[] = [
  { id: "1", restaurant_id: "demo", amount_cents: 500, platform_fee_cents: 75, stripe_payment_id: "pi_1", status: "completed", customer_session: null, created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: "2", restaurant_id: "demo", amount_cents: 300, platform_fee_cents: 50, stripe_payment_id: "pi_2", status: "completed", customer_session: null, created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: "3", restaurant_id: "demo", amount_cents: 1000, platform_fee_cents: 150, stripe_payment_id: "pi_3", status: "completed", customer_session: null, created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: "4", restaurant_id: "demo", amount_cents: 200, platform_fee_cents: 50, stripe_payment_id: "pi_4", status: "pending", customer_session: null, created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: "5", restaurant_id: "demo", amount_cents: 2000, platform_fee_cents: 300, stripe_payment_id: "pi_5", status: "completed", customer_session: null, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
];

const mockStaff: Staff[] = [
  { id: "1", restaurant_id: "demo", auth_user_id: null, name: "Carlos Garcia", email: "carlos@test.com", phone: "+34612345678", avatar_emoji: "👨‍🍳", role: "owner", iban: "ES12 1234 5678 9012 3456 7890", stripe_payout_id: "acct_1", stripe_payouts_enabled: true, active: true, created_at: "2024-01-01" },
  { id: "2", restaurant_id: "demo", auth_user_id: null, name: "Maria Lopez", email: "maria@test.com", phone: "+34623456789", avatar_emoji: "👩‍🍳", role: "waiter", iban: "ES34 9876 5432 1098 7654 3210", stripe_payout_id: "acct_2", stripe_payouts_enabled: true, active: true, created_at: "2024-02-15" },
  { id: "3", restaurant_id: "demo", auth_user_id: null, name: "Pedro Ruiz", email: "pedro@test.com", phone: "+34634567890", avatar_emoji: "🧑‍🍳", role: "waiter", iban: null, stripe_payout_id: null, stripe_payouts_enabled: false, active: true, created_at: "2024-03-01" },
];

const mockPendingInvites: InviteCode[] = [];

export type DashboardData = {
  restaurant: Restaurant;
  staff: Staff[];
  tips: Tip[];
  pendingInvites: InviteCode[];
  currentUserRole: "owner" | "waiter";
  currentUserStaffId: string;
  stats: {
    totalCents: number;
    netCents: number;
    tipsThisWeek: number;
    tipsThisWeekCents: number;
    activeStaff: number;
    avgCents: number;
  };
};

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMock, setIsUsingMock] = useState(false);

  const computeMockStats = useCallback(() => {
    const completedTips = mockTips.filter((t) => t.status === "completed");
    const totalCents = completedTips.reduce((sum, t) => sum + t.amount_cents, 0);
    const totalFeeCents = completedTips.reduce((sum, t) => sum + (t.platform_fee_cents || 0), 0);
    const netCents = totalCents - totalFeeCents;
    const avgCents = completedTips.length > 0 ? Math.round(netCents / completedTips.length) : 0;
    const activeStaff = mockStaff.filter((s) => s.active);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);
    const thisWeekCompleted = completedTips.filter((t) => new Date(t.created_at) >= weekStart);
    const tipsThisWeekCents = thisWeekCompleted.reduce(
      (sum, t) => sum + t.amount_cents - (t.platform_fee_cents || 0), 0
    );
    return {
      totalCents,
      netCents,
      tipsThisWeek: mockTips.length,
      tipsThisWeekCents,
      activeStaff: activeStaff.length,
      avgCents,
    };
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/dashboard/data");

      if (res.status === 404) {
        // No restaurant found — don't load mock data
        setData(null);
        setIsUsingMock(false);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error("Error al cargar datos");
      }

      const json = await res.json();
      setData(json);
      setIsUsingMock(false);
    } catch {
      // Only use mock data if Supabase is not configured at all
      const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!hasSupabase) {
        console.warn("[useDashboardData] Usando datos de prueba (Supabase no configurado)");
        setData({
          restaurant: mockRestaurant,
          staff: mockStaff,
          tips: mockTips,
          pendingInvites: mockPendingInvites,
          currentUserRole: "owner",
          currentUserStaffId: mockStaff[0].id,
          stats: computeMockStats(),
        });
        setIsUsingMock(true);
      } else {
        setData(null);
        setIsUsingMock(false);
      }
    } finally {
      setLoading(false);
    }
  }, [computeMockStats]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, isUsingMock, refetch: fetchData };
}
