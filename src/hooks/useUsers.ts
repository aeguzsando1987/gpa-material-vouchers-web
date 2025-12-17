import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/lib/api/services/userService';
import { individualService } from '@/lib/api/services/individualService';
import { UserUpdateInput } from '@/lib/types/user';
import { IndividualWithUserInput } from '@/lib/types/individual';
import toast from 'react-hot-toast';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
  roles: () => [...userKeys.all, 'roles'] as const,
};

/**
 * Hook para obtener lista de todos los usuarios
 */
export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: () => userService.getAll(),
    staleTime: 30000, // 30 segundos
  });
}

/**
 * Hook para obtener un usuario por ID
 */
export function useUser(id: number) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook para obtener lista de roles
 */
export function useRoles() {
  return useQuery({
    queryKey: userKeys.roles(),
    queryFn: () => userService.getRoles(),
    staleTime: 300000, // 5 minutos (los roles no cambian frecuentemente)
  });
}

/**
 * Hook para crear un usuario con individuo (método recomendado)
 * Usa el endpoint /individuals/with-user que crea ambos de forma atómica
 */
export function useCreateUserWithIndividual() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IndividualWithUserInput) =>
      individualService.createWithUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success('Usuario creado exitosamente');
    },
    onError: (error: any) => {
      // Manejar errores de validación de FastAPI (422)
      let message = 'Error al crear usuario';

      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;

        if (typeof detail === 'string') {
          // Error simple (string)
          message = detail;
        } else if (Array.isArray(detail)) {
          // Errores de validación de Pydantic (422)
          // Formato: [{loc: [...], msg: "...", type: "..."}]
          const errors = detail.map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : 'campo';
            return `${field}: ${err.msg}`;
          }).join('\n');
          message = errors || 'Error de validación';
        } else if (typeof detail === 'object' && detail.message) {
          // Objeto con message
          message = detail.message;
        }
      }

      toast.error(message);
    },
  });
}

/**
 * Hook para actualizar un usuario
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserUpdateInput }) =>
      userService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      toast.success('Usuario actualizado exitosamente');
    },
    onError: (error: any) => {
      let message = 'Error al actualizar usuario';

      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;

        if (typeof detail === 'string') {
          message = detail;
        } else if (Array.isArray(detail)) {
          const errors = detail.map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : 'campo';
            return `${field}: ${err.msg}`;
          }).join('\n');
          message = errors || 'Error de validación';
        } else if (typeof detail === 'object' && detail.message) {
          message = detail.message;
        }
      }

      toast.error(message);
    },
  });
}

/**
 * Hook para eliminar un usuario (soft delete)
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success('Usuario eliminado exitosamente');
    },
    onError: (error: any) => {
      let message = 'Error al eliminar usuario';

      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;

        if (typeof detail === 'string') {
          message = detail;
        } else if (Array.isArray(detail)) {
          const errors = detail.map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : 'campo';
            return `${field}: ${err.msg}`;
          }).join('\n');
          message = errors || 'Error de validación';
        } else if (typeof detail === 'object' && detail.message) {
          message = detail.message;
        }
      }

      toast.error(message);
    },
  });
}

/**
 * Hook para activar un usuario
 */
export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userService.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      toast.success('Usuario activado exitosamente');
    },
    onError: (error: any) => {
      let message = 'Error al activar usuario';

      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;

        if (typeof detail === 'string') {
          message = detail;
        } else if (Array.isArray(detail)) {
          const errors = detail.map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : 'campo';
            return `${field}: ${err.msg}`;
          }).join('\n');
          message = errors || 'Error de validación';
        } else if (typeof detail === 'object' && detail.message) {
          message = detail.message;
        }
      }

      toast.error(message);
    },
  });
}

/**
 * Hook para desactivar un usuario
 */
export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userService.deactivate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      toast.success('Usuario desactivado exitosamente');
    },
    onError: (error: any) => {
      let message = 'Error al desactivar usuario';

      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;

        if (typeof detail === 'string') {
          message = detail;
        } else if (Array.isArray(detail)) {
          const errors = detail.map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : 'campo';
            return `${field}: ${err.msg}`;
          }).join('\n');
          message = errors || 'Error de validación';
        } else if (typeof detail === 'object' && detail.message) {
          message = detail.message;
        }
      }

      toast.error(message);
    },
  });
}
