'use client';

import { useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ForgotPasswordSchema, PasswordSchema, OtpOnlySchema, ResetPasswordSchema } from '@/lib/validators/auth';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import OtpInput from '@/components/ui/OtpInput';

type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>;
type PasswordFormData = z.infer<typeof PasswordSchema>;
type OtpOnlyFormData = z.infer<typeof OtpOnlySchema>;

const API_URL = 'http://localhost:3023/v1';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const router = useRouter();

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: errorsEmail },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPassword },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const {
    control: controlOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: errorsOtp },
  } = useForm<OtpOnlyFormData>({
    resolver: zodResolver(OtpOnlySchema),
    defaultValues: { otp: '' },
  });

  const handleRequestCode: SubmitHandler<ForgotPasswordFormData> = async (data) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await fetch(`${API_URL}/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, purpose: 'password-reset' }),
      });
      setUserEmail(data.email);
      setStep(2);
    } catch (error) {
      console.error("Error requesting OTP:", error);
      setApiError('Estamos teniendo problemas en estos momentos, intenta más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetNewPassword: SubmitHandler<PasswordFormData> = (data) => {
    setNewPassword(data.password);
    setStep(3);
  };

  const handleFinalReset: SubmitHandler<OtpOnlyFormData> = async (data) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const payload = {
        email: userEmail,
        newPassword: newPassword,
        otp: data.otp,
      };

      ResetPasswordSchema.parse(payload);

      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      if (!response.ok) throw new Error();
      alert('¡Contraseña actualizada con éxito!');
      router.push('/login');
    } catch (err: any) {
      console.error("Error during password reset:", err);
      setApiError('El código OTP que ingresaste no es válido o ha expirado. Inténtalo de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form key="step1-email" id="form-step-1" className="space-y-4" onSubmit={handleSubmitEmail(handleRequestCode)}>
            <p className="text-sm text-neutral-500">Ingresa tu correo para recibir un código de recuperación.</p>
            <Input label="Correo electrónico" type="email" error={errorsEmail.email?.message} {...registerEmail('email')} autoComplete="email" />
            <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Enviando...' : 'Enviar Código'}</Button>
          </form>
        );
      case 2:
        return (
          <form key="step2-password" id="form-step-2" className="space-y-4" onSubmit={handleSubmitPassword(handleSetNewPassword)}>
            <p className="text-sm text-neutral-500">Ingresa tu nueva contraseña.</p>
            <Input label="Nueva Contraseña" type="password" error={errorsPassword.password?.message} {...registerPassword('password')} autoComplete="new-password" />
            <Input label="Confirmar Nueva Contraseña" type="password" error={errorsPassword.confirmPassword?.message} {...registerPassword('confirmPassword')} autoComplete="new-password" />
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setStep(1)} className="text-sm font-medium text-primary hover:text-primary-hover">Volver</button>
              <Button type="submit" className="w-auto">Continuar</Button>
            </div>
          </form>
        );
      case 3:
        return (
          <form key="step3-otp" id="form-step-3" className="space-y-4" onSubmit={handleSubmitOtp(handleFinalReset)}>
            <p className="text-sm text-neutral-500">Ingresa el código enviado a {userEmail} para confirmar el cambio.</p>
            <Controller name="otp" control={controlOtp} render={({ field }) => (
              <div>
                <label htmlFor="otp-input" className="block text-sm font-medium text-neutral-900 mb-1">Código OTP</label>
                <OtpInput value={field.value} onChange={field.onChange} />
                {errorsOtp.otp && <p className="mt-1 text-sm text-red-600">{errorsOtp.otp.message}</p>}
              </div>
            )}/>
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setStep(2)} className="text-sm font-medium text-primary hover:text-primary-hover">Volver</button>
              <Button type="submit" className="w-auto" disabled={isLoading}>{isLoading ? 'Confirmando...' : 'Cambiar Contraseña'}</Button>
            </div>
          </form>
        );
      default: return null;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Recuperar Contraseña</h1>
      </div>
      <div className="mt-6">
        {renderStep()}
        {apiError && <p className="mt-4 text-center text-sm text-red-600">{apiError}</p>}
        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="font-medium text-primary hover:text-primary-hover">Volver a Iniciar Sesión</Link>
        </div>
      </div>
    </Card>
  );
}
