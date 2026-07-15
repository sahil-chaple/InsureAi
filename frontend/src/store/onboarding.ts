import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RiskProfile } from "@/services/ai";

export type OnboardingData = {
  dob?: string;
  gender?: string;
  marital?: string;
  occupation?: string;
  income?: number;
  city?: string;
  state?: string;
  heightCm?: number;
  weightKg?: number;
  smoker?: boolean;
  drinks?: boolean;
  conditions?: string[];
  familyHistory?: string[];
  ownsVehicle?: boolean;
  vehicleType?: string;
  vehicleYear?: number;
  vehicleValue?: number;
  ownsHome?: boolean;
  propertyType?: string;
  propertyValue?: number;
  travelFreq?: string;
  currentlyInsured?: boolean;
  existingPolicies?: string[];
  priorClaims?: boolean;
  priorClaimAmount?: number;
  reasons?: string[];
};

type Store = {
  profileData: OnboardingData;
  data: OnboardingData;
  riskProfile: RiskProfile | null;
  currentStep: number;
  step: number;
  saveStepData: (patch: Partial<OnboardingData>) => void;
  set: (patch: Partial<OnboardingData>) => void;
  setRiskProfile: (profile: RiskProfile) => void;
  setStep: (n: number) => void;
  reset: () => void;
};

export const useOnboarding = create<Store>()(
  persist(
    (set) => ({
      profileData: {},
      data: {},
      riskProfile: null,
      currentStep: 0,
      step: 0,

      saveStepData: (patch) =>
        set((s) => {
          const merged = { ...s.profileData, ...s.data, ...patch };
          return { profileData: merged, data: merged };
        }),

      set: (patch) =>
        set((s) => {
          const merged = { ...s.profileData, ...s.data, ...patch };
          return { profileData: merged, data: merged };
        }),

      setRiskProfile: (profile) => set({ riskProfile: profile }),

      setStep: (n) => set({ currentStep: n, step: n }),

      reset: () => set({ profileData: {}, data: {}, riskProfile: null, currentStep: 0, step: 0 }),
    }),
    { name: "insureai-onboarding" },
  ),
);

export const useOnboardingStore = useOnboarding;
