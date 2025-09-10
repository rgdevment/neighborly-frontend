'use client';

import { useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

import { PreRegisterSchema, RegisterSchema } from '@/lib/validators/auth';
import { formatRutForDisplay, cleanRut } from '@/lib/utils/rut';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

type PreRegisterFormData = z.infer<typeof PreRegisterSchema>;
type RegisterFormData = z.infer<typeof RegisterSchema>;

const API_URL = 'http://localhost:3023/v1';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [preRegisterData, setPreRegisterData] = useState<PreRegisterFormData | null>(null);

  const {
    control: preRegisterControl,
    handleSubmit: handleSubmitPreRegister,
  } = useForm<PreRegisterFormData>({
    resolver: zodResolver(PreRegisterSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      documentValue: '',
    },
  });

  const {
    register,
    handleSubmit: handleSubmitRegister,
    formState: { errors: errorsRegister }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema)
  });

  const handlePreRegister: SubmitHandler<PreRegisterFormData> = async (data) => {
    setApiError(null);
    setIsLoading(true);
    try {
      const validationResponse = await fetch(`${API_URL}/users/validate/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          documentType: 'RUT',
          documentValue: data.documentValue
        }),
      });

      if (validationResponse.status === 200) {
        setApiError('Tu RUT o correo ya están registrados.');
        setIsLoading(false);
        return;
      }

      if (validationResponse.status !== 404) {
        throw new Error('Error al verificar los datos.');
      }

      const otpResponse = await fetch(`${API_URL}/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, purpose: 'registration' }),
      });

      if (!otpResponse.ok) {
        const errorData = await otpResponse.json();
        throw new Error(errorData.message || 'Error al solicitar el código OTP.');
      }

      setPreRegisterData(data);
      setStep(2);
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister: SubmitHandler<RegisterFormData> = async (data) => {
    if (!preRegisterData) return;
    setApiError(null);
    setIsLoading(true);
    const payload = {
      ...data,
      email: preRegisterData.email,
      documentType: 'RUT',
      documentValue: preRegisterData.documentValue,
    };

    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la cuenta.');
      }

      alert('¡Cuenta creada con éxito!');
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
          {step === 1 ? 'Únete a la comunidad' : 'Un último paso'}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {step === 1
            ? 'Ingresa tu correo y RUT para comenzar.'
            : `Completa tus datos y el código que enviamos a ${preRegisterData?.email}.`}
        </p>
      </div>

      <div className="mt-6">
        {step === 1 && (
          <form className="space-y-4" onSubmit={handleSubmitPreRegister(handlePreRegister)}>
            <Controller
              name="email"
              control={preRegisterControl}
              render={({ field, fieldState }) => (
                <Input
                  label="Correo electrónico"
                  type="email"
                  placeholder="personal@email.com"
                  error={fieldState.error?.message}
                  {...field}
                />
              )}/>
            <Controller
              name="documentValue"
              control={preRegisterControl}
              render={({ field, fieldState }) => (
                <Input
                  label="RUT"
                  type="text"
                  placeholder="12.345.678-9"
                  {...field}
                  value={field.value ? formatRutForDisplay(field.value) : ''}
                  onChange={(e) => field.onChange(cleanRut(e.target.value))}
                  error={fieldState.error?.message}
                />
              )}/>
            {apiError && (
              <div className="text-sm text-red-600">
                {apiError}
                <Link href="/auth/login" className="font-bold underline ml-1">Iniciar sesión</Link> o
                <Link href="/auth/forgot-password" className="font-bold underline ml-1">recuperar contraseña</Link>.
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verificando...' : 'Solicitar Código'}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form className="space-y-4" onSubmit={handleSubmitRegister(handleRegister)}>
            <Input label="Nombre" error={errorsRegister.firstName?.message} {...register('firstName')} />
            <Input label="Apellido" error={errorsRegister.lastName?.message} {...register('lastName')} />
            <Input label="Contraseña" error={errorsRegister.password?.message} type="password" {...register('password')} />
            <Input label="Confirmar contraseña" error={errorsRegister.confirmPassword?.message} type="password" {...register('confirmPassword')} />
            <Input label="Código OTP" error={errorsRegister.otp?.message} type="text" inputMode="numeric" maxLength={6} {...register('otp')} />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
            {apiError && <p className="text-sm text-red-600 text-center">{apiError}</p>}
          </form>
        )}
      </div>
    </Card>
  );
}
