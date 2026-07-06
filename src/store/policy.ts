import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Policy = {
  id: string;
  planId: string;
  planName: string;
  type: string;
  coverage: number;
  premium: number;
  status: "Active" | "Expiring" | "Expired";
  validFrom: string;
  validTo: string;
  holder: string;
};

type Store = {
  selectedPlanId: string | null;
  compare: string[];
  policies: Policy[];
  setSelected: (id: string | null) => void;
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  addPolicy: (p: Policy) => void;
};

export const usePolicyStore = create<Store>()(
  persist(
    (set) => ({
      selectedPlanId: null,
      compare: [],
      policies: [],
      setSelected: (id) => set({ selectedPlanId: id }),
      toggleCompare: (id) =>
        set((s) => {
          if (s.compare.includes(id)) return { compare: s.compare.filter((x) => x !== id) };
          if (s.compare.length >= 3) return s;
          return { compare: [...s.compare, id] };
        }),
      clearCompare: () => set({ compare: [] }),
      addPolicy: (p) => set((s) => ({ policies: [p, ...s.policies] })),
    }),
    { name: "insureai-policy" },
  ),
);
