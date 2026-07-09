'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCategory, deleteCategory, getCategories, type Category } from '@/lib/services/categories';
import { queryKeys } from '@/shared/lib/query-keys';

export type { Category };

export function useCategories() {
  return useQuery({ queryKey: queryKeys.categories(), queryFn: getCategories, staleTime: 5 * 60_000 });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, icon }: { name: string; icon: string }) => createCategory(name, icon),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories() }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.categories() });
      qc.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}
