import { indexedDbStorage } from "@/utils/indexedDbStorage";
import { Organization } from "@/utils/type";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OrganizationStore {
  info: Organization | null;
  hasHydrated: boolean;
  setData: (data: Organization) => void;
  logout: () => void;
}

export const useOrgStore = create<OrganizationStore>()(
  persist(
    (set) => ({
      info: null,
      hasHydrated: false,

      setData: (data) => set({ info: data }),
      logout: () => set({ info: null }),
    }),
    {
      name: "org-storage",
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
