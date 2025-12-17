import LoginForm from '@/components/forms/LoginForm';

export const metadata = {
  title: 'Login - Sistema de Vales',
  description: 'Iniciar sesión en el sistema de gestión de vales',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-neutral-900">
              Sistema de Vales
            </h1>
            <p className="text-sm text-neutral-500">
              Ingresa tus credenciales para acceder
            </p>
          </div>

          {/* Login Form */}
          <LoginForm />

          {/* Footer */}
          <div className="pt-4 border-t border-neutral-200">
            <p className="text-xs text-center text-neutral-400">
              Si olvido su contraseña favor de comunicarse al correo <strong>alonso.guzman@gpamex.com</strong>
              <br />
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <p className="mt-6 text-center text-xs text-neutral-400">
          © 2025 Sistema de Vales de salida y entrada de material GPA. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
