'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/store/authStore';
import { authService } from '@/lib/api/services/authService';

// Esquema de validación
const loginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email requerido'),
  password: z.string().min(4, 'La contraseña debe tener al menos 4 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      // 1. Login y obtener token
      const { access_token } = await authService.login({
        email: data.email,
        password: data.password,
      });

      // 2. Obtener datos del usuario
      // Primero guardamos el token temporalmente para que el interceptor lo use
      localStorage.setItem('auth-token', access_token);

      const user = await authService.getCurrentUser();

      // 3. Guardar en store (esto también guarda en localStorage vía persist)
      login(access_token, user);

      // 4. Mostrar mensaje de éxito
      toast.success(`¡Bienvenido, ${user.email}!`);

      // 5. Redirigir al dashboard
      router.push('/');
    } catch (error: any) {
      console.error('Error en login:', error);

      // Limpiar token temporal si falla
      localStorage.removeItem('auth-token');

      // Manejar errores específicos
      if (error.response?.status === 401) {
        toast.error('Credenciales incorrectas');
      } else if (error.response?.status === 400) {
        toast.error('Datos inválidos');
      } else if (!error.response) {
        toast.error('Error de conexión con el servidor');
      } else {
        toast.error('Error al iniciar sesión');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="usuario@gpamex.com"
          disabled={isLoading}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          disabled={isLoading}
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full transition-colors hover:bg-primary/90 hover:shadow-md" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Iniciando sesión...
          </>
        ) : (
          'Iniciar Sesión'
        )}
      </Button>
    </form>
  );
}
