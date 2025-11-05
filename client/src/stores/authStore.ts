import { create } from "zustand";
import { getUser } from "../libs/apis/auth";

export interface User {
  id: number;
  username: string;
  email: string;
  profile_picture: string;
}

interface AuthState {
  user: User | null;
  login: (user: User) => void;
  singup:(user:User) => void;
  logout: () => void;
  verify: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  login: (user) => set({ user }),

  singup:(user) => set({user}),

  logout: () => set({ user: null }),

  verify: async () => {
    try {
      const data = await getUser();
      if (data) {
        set({ user: data.user });
      } else {
        set({ user: null });
      }
    } catch (error) {
        set({ user: null });
    }
  },
}));
