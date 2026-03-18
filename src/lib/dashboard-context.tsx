"use client";

import { createContext, useContext } from "react";
import type { DashboardData } from "@/hooks/use-dashboard-data";

type DashboardContextType = {
  data: DashboardData | null;
  loading: boolean;
  isUsingMock: boolean;
  refetch: () => Promise<void>;
};

export const DashboardContext = createContext<DashboardContextType>({
  data: null,
  loading: true,
  isUsingMock: false,
  refetch: async () => {},
});

export function useDashboard() {
  return useContext(DashboardContext);
}
