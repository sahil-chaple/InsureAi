import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RecommendationPlan } from "@/data/mockData";

/** Issued policy from checkout flow */
export type IssuedPolicy = {
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
  selectedPlan: RecommendationPlan | null;
  selectedPlanId: string | null;
  comparedPlanIds: string[];
  compare: string[];
  userPolicies: IssuedPolicy[];
  policies: IssuedPolicy[];
  selectPlan: (plan: RecommendationPlan) => void;
  setSelected: (id: string | null) => void;
  addToCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  addPolicy: (p: IssuedPolicy) => void;
};

export const usePolicyStore = create<Store>()(
  persist(
    (set, get) => ({
      selectedPlan: null,
      selectedPlanId: null,
      comparedPlanIds: [],
      compare: [],
      userPolicies: [],
      policies: [],

      selectPlan: (plan) => set({ selectedPlan: plan, selectedPlanId: plan.id }),

      setSelected: (id) => set({ selectedPlanId: id }),

      addToCompare: (id) => {
        const { comparedPlanIds } = get();
        if (comparedPlanIds.includes(id) || comparedPlanIds.length >= 3) return;
        const next = [...comparedPlanIds, id];
        set({ comparedPlanIds: next, compare: next });
      },

      removeFromCompare: (id) => {
        const next = get().comparedPlanIds.filter((x) => x !== id);
        set({ comparedPlanIds: next, compare: next });
      },

      toggleCompare: (id) => {
        const { comparedPlanIds } = get();
        if (comparedPlanIds.includes(id)) {
          const next = comparedPlanIds.filter((x) => x !== id);
          set({ comparedPlanIds: next, compare: next });
        } else if (comparedPlanIds.length < 3) {
          const next = [...comparedPlanIds, id];
          set({ comparedPlanIds: next, compare: next });
        }
      },

      clearCompare: () => set({ comparedPlanIds: [], compare: [] }),

      addPolicy: (p) =>
        set((s) => ({
          userPolicies: [p, ...s.userPolicies],
          policies: [p, ...s.policies],
        })),
    }),
    { name: "insureai-policy" },
  ),
);

export type Policy = IssuedPolicy;
