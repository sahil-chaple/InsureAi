import { create } from "zustand";

type FlaggedMessage = {
  id: string;
  question: string;
  timestamp: string;
};

type Store = {
  flaggedMessages: FlaggedMessage[];
  addFlagged: (question: string) => void;
};

export const useAssistantQueueStore = create<Store>()((set) => ({
  flaggedMessages: [],
  addFlagged: (question) =>
    set((s) => ({
      flaggedMessages: [
        { id: crypto.randomUUID(), question, timestamp: new Date().toISOString() },
        ...s.flaggedMessages,
      ],
    })),
}));
