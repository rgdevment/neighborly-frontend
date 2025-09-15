'use client';

import { useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { PreRegisterSchema, RegisterSchema, OtpOnlySchema } from '@/lib/validators/auth';
import { formatRutForDisplay, cleanRut } from '@/lib/utils/rut';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import OtpInput from '@/components/ui/OtpInput';
import { useAuthStore } from '@/store/auth';

type PreRegisterFormData = z.infer<typeof PreRegisterSchema>;
type RegisterFormData = z.infer<typeof RegisterSchema>;
type OtpOnlyFormData = z.infer<typeof OtpOnlySchema>;

const API_URL = 'http://localhost:3023/v1';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [preRegisterData, setPreRegisterData] = useState<PreRegisterFormData | null>(null);
  const [registerDetailsData, setRegisterDetailsData] = useState<Omit<RegisterFormData, 'otp'> | null>(null);
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();

  const {
    control: preRegisterControl,
    handleSubmit: handleSubmitPreRegister,
  } = useForm<PreRegisterFormData>({
    resolver: zodResolver(PreRegisterSchema),
    mode: 'onBlur',
    defaultValues: { email: '', documentValue: '' },
  });

  const {
    register: registerDetails,
    handleSubmit: handleSubmitDetails,
    formState: { errors: errorsDetails },
  } = useForm<Omit<RegisterFormData, 'otp'>>({
    resolver: zodResolver(RegisterSchema.omit({ otp: true })),
    defaultValues: { firstName: '', lastName: '', password: '', confirmPassword: '' },
  });

  const {
    control: otpControl,
    handleSubmit: handleSubmitOtp,
    formState: { errors: errorsOtp },
  } = useForm<OtpOnlyFormData>({
    resolver: zodResolver(OtpOnlySchema),
    defaultValues: { otp: '' },
  });

  const handlePreRegister: SubmitHandler<PreRegisterFormData> = async (data) => {
    setApiError(null);
    setIsLoading(true);
    try {
      const validationResponse = await fetch(`${API_URL}/auth/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, documentType: 'RUT', documentValue: data.documentValue }),
      });

      if (validationResponse.status === 200) {
        setApiError('Tu RUT o correo ya están registrados.');
        setIsLoading(false);
        return;
      }
      if (validationResponse.status !== 404) {
        throw new Error();
      }
      const otpResponse = await fetch(`${API_URL}/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, purpose: 'registration' }),
      });
      if (!otpResponse.ok) {
        throw new Error();
      }
      setPreRegisterData(data);
      setStep(2);
    } catch (err: any) {
      console.error("Error during pre-registration:", err);
      setApiError('Estamos teniendo problemas en estos momentos, intenta más tarde.');
    } finally {
      if (step === 1) setIsLoading(false);
    }
  };

  const handleSetDetails: SubmitHandler<Omit<RegisterFormData, 'otp'>> = (data) => {
    setRegisterDetailsData(data);
    setStep(3);
  };

  const handleFinalRegister: SubmitHandler<OtpOnlyFormData> = async (data) => {
    if (!preRegisterData || !registerDetailsData) return;
    setApiError(null);
    setIsLoading(true);
    const payload = { ...preRegisterData, ...registerDetailsData, ...data, documentType: 'RUT' };
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error();
      }
      const userData = await response.json();
      setUser(userData);
      router.push('/mi-perfil');
    } catch (err: any) {
      console.error("Error during pre-registration:", err);
      setApiError('El código OTP que ingresaste no es válido o ha expirado. Intenta de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form key="step1-preregister" id="form-step-1" className="space-y-4" onSubmit={handleSubmitPreRegister(handlePreRegister)}>
            <Controller name="email" control={preRegisterControl} render={({ field, fieldState }) => ( <Input label="Correo electrónico" type="email" placeholder="personal@email.com" error={fieldState.error?.message} {...field} /> )}/>
            <Controller name="documentValue" control={preRegisterControl} render={({ field, fieldState }) => ( <Input label="RUT" type="text" placeholder="12.345.678-9" {...field} value={field.value ? formatRutForDisplay(field.value) : ''} onChange={(e) => field.onChange(cleanRut(e.target.value))} error={fieldState.error?.message} /> )}/>
            {apiError && (
              <div className="text-sm text-red-600">
                {apiError}
                {apiError.includes("registrados") && <Link href="/login" className="font-bold underline ml-1">Iniciar sesión</Link>}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Verificando...' : 'Solicitar Código'}</Button>
          </form>
        );
      case 2:
        return (
          <form key="step2-details" id="form-step-2" className="space-y-4" onSubmit={handleSubmitDetails(handleSetDetails)}>
            <Input label="Nombre" error={errorsDetails.firstName?.message} {...registerDetails('firstName')} />
            <Input label="Apellido" error={errorsDetails.lastName?.message} {...registerDetails('lastName')} />
            <Input label="Contraseña" error={errorsDetails.password?.message} type="password" {...registerDetails('password')} />
            <Input label="Confirmar contraseña" error={errorsDetails.confirmPassword?.message} type="password" {...registerDetails('confirmPassword')} />
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setStep(1)} className="text-sm font-medium text-primary hover:text-primary-hover">Volver</button>
              <Button type="submit" className="w-auto">Continuar</Button>
            </div>
          </form>
        );
      case 3:
        return (
          <form key="step3-otp" id="form-step-3" className="space-y-4" onSubmit={handleSubmitOtp(handleFinalRegister)}>
            <Controller name="otp" control={otpControl} render={({ field }) => (
              <div>
                <label htmlFor="otp-input" className="block text-sm font-medium text-neutral-900 mb-1">Código OTP</label>
                <OtpInput value={field.value} onChange={field.onChange} />
                {errorsOtp.otp && <p className="mt-1 text-sm text-red-600">{errorsOtp.otp.message}</p>}
              </div>
            )}/>
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setStep(2)} className="text-sm font-medium text-primary hover:text-primary-hover">Volver</button>
              <Button type="submit" className="w-auto" disabled={isLoading}>{isLoading ? 'Creando cuenta...' : 'Confirmar y Crear Cuenta'}</Button>
            </div>
          </form>
        );
      default: return null;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <div className="space-y-6 text-center">
        <h1 className="text-2xl font-semibold text-neutral-900">{step === 1 ? 'Únete a la comunidad' : (step === 2 ? 'Crea tu perfil' : 'Un último paso')}</h1>
        <p className="mt-2 text-sm text-neutral-500">{step === 1 ? 'Ingresa tu correo y RUT para comenzar.' : (step === 2 ? 'Ahora, crea una contraseña segura.' : `Ingresa el código que enviamos a ${preRegisterData?.email}.`)}</p>
      </div>
      <div className="mt-6">
        {renderStep()}
        {apiError && step !== 1 && <p className="mt-4 text-center text-sm text-red-600">{apiError}</p>}
        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="font-medium text-primary hover:text-primary-hover">¿Ya tienes una cuenta? Inicia Sesión</Link>
        </div>
      </div>
    </Card>
  );
}
