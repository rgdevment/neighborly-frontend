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
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setIsLoading: (loading: boolean) => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  setUser: (user: User | null): void => set({ user }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  isAuthenticated: () => !!get().user,
}));
