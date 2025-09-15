import { z } from 'zod';
import { isValidRut } from '@/lib/utils/rut';

const EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const emailBase = z.string().trim().toLowerCase();
export const EmailSchema = z.object({
  email: emailBase.refine(v => EMAIL_REGEX.test(v), {
    message: 'Por favor, ingresa un correo válido.',
  }),
});

export const RutSchema = z.object({
  documentValue: z.string().refine(isValidRut, { message: 'El RUT ingresado no es válido.' }),
});

export const PasswordSchema = z
  .object({
    password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });

export const OtpOnlySchema = z.object({
  otp: z.string()
    .length(6, { message: 'El código OTP debe tener 6 dígitos.' })
    .regex(/^\d+$/, { message: 'El código solo debe contener números.' }),
});

export const PreRegisterSchema = EmailSchema.merge(RutSchema);

export const RegisterSchema = z.object({
  firstName: z.string().min(2, { message: 'El nombre es demasiado corto.' }),
  lastName: z.string().min(2, { message: 'El apellido es demasiado corto.' }),
})
  .merge(PasswordSchema)
  .merge(OtpOnlySchema);

export const LoginSchema = EmailSchema.extend({
  password: z.string().min(1, { message: 'La contraseña no puede estar vacía.' }),
});

export const ForgotPasswordSchema = EmailSchema;

export const ResetPasswordSchema = PasswordSchema.merge(OtpOnlySchema);
