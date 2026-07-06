import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OnboardingData = {
  // step 1
  dob?: string;
  gender?: string;
  marital?: string;
  occupation?: string;
  income?: number;
  city?: string;
  state?: string;
  // step 2
  heightCm?: number;
  weightKg?: number;
  smoker?: boolean;
  drinks?: boolean;
  conditions?: string[];
  familyHistory?: string[];
  // step 3
  ownsVehicle?: boolean;
  vehicleType?: string;
  vehicleYear?: number;
  vehicleValue?: number;
  ownsHome?: boolean;
  propertyType?: string;
  propertyValue?: number;
  travelFreq?: string;
  // step 4
  currentlyInsured?: boolean;
  existingPolicies?: string[];
  priorClaims?: boolean;
  priorClaimAmount?: number;
  reasons?: string[];
};

type Store = {
  data: OnboardingData;
  step: number;
  set: (patch: Partial<OnboardingData>) => void;
  setStep: (n: number) => void;
  reset: () => void;
};

export const useOnboarding = create<Store>()(
  persist(
    (set) => ({
      data: {},
      step: 0,
      set: (patch) => set((s) => ({ data: { ...s.data, ...patch } })),
      setStep: (n) => set({ step: n }),
      reset: () => set({ data: {}, step: 0 }),
    }),
    { name: "insureai-onboarding" },
  ),
);
