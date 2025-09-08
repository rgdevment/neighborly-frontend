'use client';

import { useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

import { OTPSchema, RegisterSchema } from '@/lib/validators/auth';
import { formatRutForDisplay, cleanRut } from '@/lib/utils/rut';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

type OTPFormData = z.infer<typeof OTPSchema>;
type RegisterFormData = z.infer<typeof RegisterSchema>;

const API_URL = 'http://localhost:3023/v1';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [emailCheck, setEmailCheck] = useState<{ status: 'idle' | 'exists' }>({ status: 'idle' });
  const [rutCheck, setRutCheck] = useState<{ status: 'idle' | 'checking' | 'exists' | 'ok'; message?: string }>({ status: 'idle' });

  const {
    register: registerOTP,
    handleSubmit: handleSubmitOTP,
    getValues: getOTPValues,
    formState: { errors: errorsOTP },
  } = useForm<OTPFormData>({
    resolver: zodResolver(OTPSchema),
  });

  const {
    register,
    handleSubmit: handleSubmitRegister,
    control,
    getValues: getRegisterValues,
    trigger: triggerRegister,
    formState: { errors: errorsRegister },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    mode: 'onBlur',
  });

  const handleRutBlur = async () => {
    const rutIsValid = await triggerRegister('documentValue');
    if (!rutIsValid) {
      setRutCheck({ status: 'idle' });
      return;
    }
    setRutCheck({ status: 'checking' });
    try {
      const response = await fetch(`${API_URL}/users/validate/document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentType: 'RUT', documentValue: getRegisterValues('documentValue') }),
      });
      if (response.status === 404) {
        setRutCheck({ status: 'ok', message: 'RUT disponible.' });
      } else if (response.status === 200) {
        setRutCheck({ status: 'exists', message: 'Este RUT ya está registrado.' });
      } else {
        throw new Error('Error al verificar el RUT.');
      }
    } catch (err) {
      setRutCheck({ status: 'idle' });
    }
  };

  const handleRequestOtp: SubmitHandler<OTPFormData> = async (data) => {
    setApiError(null);
    setEmailCheck({ status: 'idle' });
    setIsLoading(true);

    try {
      const validationResponse = await fetch(`${API_URL}/users/validate/mail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });

      if (validationResponse.status === 200) {
        setEmailCheck({ status: 'exists' });
        setIsLoading(false);
        return;
      }

      if (validationResponse.status !== 404) {
        throw new Error('Error al verificar el correo.');
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

      setStep(2);
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister: SubmitHandler<RegisterFormData> = async (data) => {
    setApiError(null);
    setIsLoading(true);
    const emailFromStep1 = getOTPValues('email');
    const payload = { ...data, email: emailFromStep1, documentType: 'RUT' };

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
            ? 'Empieza ingresando tu correo electrónico.'
            : `Completa tus datos y el código que enviamos a ${getOTPValues('email')}.`}
        </p>
      </div>

      <div className="mt-6">
        {step === 1 && (
          <form className="space-y-4" onSubmit={handleSubmitOTP(handleRequestOtp)}>
            <Input
              label="Correo electrónico"
              id="email"
              type="email"
              placeholder="tu@correo.com"
              error={errorsOTP.email?.message}
              {...registerOTP('email')}
            />
            {emailCheck.status === 'exists' && (
              <div className="text-sm text-red-600">
                Este correo ya está registrado.
                <Link href="/auth/login" className="font-bold underline ml-1">Iniciar sesión</Link> o
                <Link href="/auth/forgot-password" className="font-bold underline ml-1">recuperar contraseña</Link>.
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verificando...' : 'Solicitar Código'}
            </Button>
            {apiError && <p className="text-sm text-red-600 text-center">{apiError}</p>}
          </form>
        )}

        {step === 2 && (
          <form className="space-y-4" onSubmit={handleSubmitRegister(handleRegister)}>
            <Input
              label="Correo electrónico"
              type="email"
              value={getOTPValues('email')}
              disabled
            />
            <Input
              label="Nombre"
              id="firstName"
              type="text"
              error={errorsRegister.firstName?.message}
              {...register('firstName')}
            />
            <Input
              label="Apellido"
              id="lastName"
              type="text"
              error={errorsRegister.lastName?.message}
              {...register('lastName')}
            />
            <Controller
              name="documentValue"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="RUT"
                  id="documentValue"
                  type="text"
                  placeholder="12.345.678-9"
                  onBlur={handleRutBlur}
                  ref={field.ref}
                  value={field.value ? formatRutForDisplay(field.value) : ''}
                  onChange={(e) => field.onChange(cleanRut(e.target.value))}
                  error={fieldState.error?.message}
                />
              )}
            />
            {rutCheck.status === 'checking' && <p className="text-sm text-neutral-500">Verificando RUT...</p>}
            {rutCheck.status === 'ok' && <p className="text-sm text-green-600">{rutCheck.message}</p>}
            {rutCheck.status === 'exists' && <p className="text-sm text-red-600">{rutCheck.message}</p>}
            <Input
              label="Contraseña"
              id="password"
              type="password"
              error={errorsRegister.password?.message}
              {...register('password')}
            />
            <Input
              label="Confirmar contraseña"
              id="confirmPassword"
              type="password"
              error={errorsRegister.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <Input
              label="Código OTP"
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              error={errorsRegister.otp?.message}
              {...register('otp')}
            />
            <Button type="submit" className="w-full" disabled={isLoading || rutCheck.status === 'exists'}>
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
            {apiError && <p className="text-sm text-red-600 text-center">{apiError}</p>}
          </form>
        )}
      </div>
    </Card>
  );
}
