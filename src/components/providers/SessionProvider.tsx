'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';

const API_URL = 'http://localhost:3023/v1';

export default function SessionProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { setUser, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      if (user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/users/me`, {
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession().then();
  }, [setUser, user]);

  if (isLoading) {
    return <div>Verificando sesión...</div>;
  }

  return <>{children}</>;
}
