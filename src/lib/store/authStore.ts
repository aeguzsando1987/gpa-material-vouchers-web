import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '../types/auth';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      hasHydrated: false,

      // Login: guardar token y usuario
      login: (token: string, user: User) => {
        // Guardar token en localStorage para Axios interceptor
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth-token', token);
        }

        set({
          token,
          user,
          isAuthenticated: true,
        });
      },

      // Logout: limpiar todo
      logout: () => {
        // Limpiar localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-token');
          localStorage.removeItem('auth-user');
        }

        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },

      // Actualizar usuario (por ejemplo después de editar perfil)
      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage', // Nombre en localStorage
      partialize: (state) => ({
        // Solo persistir token, user e isAuthenticated
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Marcar como hidratado cuando termine de cargar desde localStorage
        state?.hasHydrated && (state.hasHydrated = true);
        if (state) {
          state.hasHydrated = true;
        }
      },
    }
  )
);
