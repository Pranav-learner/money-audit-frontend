'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type DefaultValues, type FieldValues } from 'react-hook-form';
import type { z } from 'zod';

/**
 * Thin wrapper over react-hook-form that wires up a Zod schema resolver and full
 * type inference. Future forms need only: `const form = useZodForm(schema, { defaultValues })`.
 */
export function useZodForm<TSchema extends z.ZodType<FieldValues>>(
  schema: TSchema,
  options?: { defaultValues?: DefaultValues<z.infer<TSchema>> },
) {
  return useForm<z.infer<TSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    mode: 'onTouched',
    defaultValues: options?.defaultValues,
  });
}
