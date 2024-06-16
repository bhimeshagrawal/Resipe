import { create } from "zustand";

export const useUserStore = create((set) => ({
  user: null,
  profile: null,
  role: "Foodie",
  showModal: "true",
  closeModal: () => set({ showModal: false }),
  setRole: (role) => set({ role }),
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
}));
