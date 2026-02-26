import { z } from 'zod';

export const reportSchema = z.object({
  title: z
    .string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres')
    .trim(),
  
  description: z
    .string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .trim(),
  
  location: z
    .string()
    .min(5, 'Localização deve ter pelo menos 5 caracteres')
    .max(200, 'Localização deve ter no máximo 200 caracteres')
    .trim(),
});

export type ReportFormData = z.infer<typeof reportSchema>;