import { create } from 'zustand';

interface UserProfile {
  firstName: string;
  lastName: string;
}

interface User {
  id: string;
  email: string;
  roles: string[];
  profile: UserProfile;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  setUser: (user: User | null): void => set({ user }),
  isAuthenticated: () => !!get().user,
}));
