import { z } from 'zod';
import { isValidRut } from '@/lib/utils/rut';

export const OTPSchema = z.object({
  email: z.string().email({ message: 'Por favor, ingresa un correo válido.' })
});

export const RegisterSchema = z
  .object({
    email: z.string().email({}),
    firstName: z.string().min(2, { message: 'El nombre es demasiado corto.' }),
    lastName: z.string().min(2, { message: 'El apellido es demasiado corto.' }),
    documentValue: z.string().refine(isValidRut, { message: 'El RUT ingresado no es válido.' }),
    password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' }),
    confirmPassword: z.string().min(8, { message: 'La confirmación debe tener al menos 8 caracteres.' }),
    otp: z.string().length(6, { message: 'El código OTP debe tener 6 dígitos.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });
