import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Claim = {
  id: string;
  policyId: string;
  type: string;
  amount: number;
  description: string;
  status: "Submitted" | "In Review" | "Approved" | "Rejected";
  submittedAt: string;
};

type Store = {
  claims: Claim[];
  add: (c: Claim) => void;
};

export const useClaimsStore = create<Store>()(
  persist((set) => ({
    claims: [],
    add: (c) => set((s) => ({ claims: [c, ...s.claims] })),
  }), { name: "insureai-claims" }),
);
