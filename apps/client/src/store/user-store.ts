import { indexedDbStorage } from "@/utils/indexedDbStorage";
import { User } from "@/utils/type";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserStore {
  info: User | null;
  hasHydrated: boolean;
  setData: (data: User) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      info: null,
      hasHydrated: false,

      setData: (data) => set({ info: data }),
      logout: () => set({ info: null }),
    }),
    {
      name: "user-storage",
      storage: indexedDbStorage as any,
      partialize: (state) => ({
        info: state.info,
      }),
      version: 1,
      migrate: (persistedState, version) => {
        if (version === 0) {
          return persistedState;
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true;
        }
      },
    },
  ),
);
