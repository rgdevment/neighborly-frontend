'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

import { LoginSchema } from '@/lib/validators/auth';
import { useAuthStore } from '@/store/auth';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

type LoginFormData = z.infer<typeof LoginSchema>;

const API_URL = 'http://localhost:3023/v1';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin: SubmitHandler<LoginFormData> = async (data) => {
    setApiError(null);
    setIsLoading(true);
    try {
      const payload = {
        username: data.email,
        password: data.password,
      };

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Credenciales inválidas. Por favor, inténtalo de nuevo.');
      }

      const userData = await response.json();
      setUser(userData);

      window.location.href = '/mi-perfil';

    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <div className="space-y-6 text-center">
        <h1 className="text-2xl font-semibold text-neutral-900">
          Bienvenido de vuelta
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Ingresa tus credenciales para acceder a tu comunidad.
        </p>
      </div>

      <div className="mt-6">
        <form className="space-y-4" onSubmit={handleSubmit(handleLogin)}>
          <Input
            label="Correo electrónico"
            id="email"
            type="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Contraseña"
            id="password"
            type="password"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="text-right text-sm">
            <Link href="/auth/forgot-password" className="font-medium text-primary hover:text-primary-hover">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {apiError && <p className="text-sm text-red-600 text-center">{apiError}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
          </Button>

          <div className="text-center text-sm text-neutral-500">
            ¿No tienes una cuenta?{' '}
            <Link href="/auth/register" className="font-medium text-primary hover:text-primary-hover">
              Regístrate aquí
            </Link>
          </div>
        </form>
      </div>
    </Card>
  );
}
