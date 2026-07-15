import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MockClaim } from "@/data/mockData";
import { submitClaim as submitClaimSvc, type SubmitClaimInput } from "@/services/claims";

export type Claim = MockClaim;

type Store = {
  userClaims: MockClaim[];
  claims: MockClaim[];
  activeClaim: MockClaim | null;
  add: (c: MockClaim) => void;
  submitClaim: (data: SubmitClaimInput) => Promise<MockClaim>;
  setActiveClaim: (c: MockClaim | null) => void;
};

export const useClaimsStore = create<Store>()(
  persist(
    (set, get) => ({
      userClaims: [],
      claims: [],
      activeClaim: null,

      add: (c) =>
        set((s) => ({
          userClaims: [c, ...s.userClaims],
          claims: [c, ...s.claims],
        })),

      submitClaim: async (data) => {
        const claim = await submitClaimSvc(data);
        get().add(claim);
        set({ activeClaim: claim });
        return claim;
      },

      setActiveClaim: (c) => set({ activeClaim: c }),
    }),
    { name: "insureai-claims" },
  ),
);
