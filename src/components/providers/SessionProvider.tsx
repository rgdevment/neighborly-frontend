'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';

const API_URL = 'http://localhost:3023/v1';

export default function SessionProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { setUser, setIsLoading, user } = useAuthStore();

  useEffect(() => {
    const checkUserSession = async () => {
      if (user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/users/me`, { credentials: 'include' });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('[SessionProvider] Error while checking the session', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession().then();
  }, [setUser, setIsLoading, user]);

  return <>{children}</>;
}
