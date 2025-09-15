'use client';

import { useAuthStore } from '@/store/auth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/ui/Loading';

const API_URL = 'http://localhost:3023/v1';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const { setUser } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    setUser(null);
    router.push('/auth/login');
  };

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-lg">
      <h1 className="text-2xl font-semibold">¡Hola, {user.profile.firstName}!</h1>
      <div className="mt-4 space-y-2">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>ID de Usuario:</strong> {user.id}</p>
        <p><strong>Roles:</strong> {user.roles.join(', ')}</p>
      </div>
      <Button onClick={handleLogout} className="mt-6">
        Cerrar Sesión
      </Button>
    </Card>
  );
}
