import { z } from "zod";

export const optionSchema = z.object({
  text: z.string().min(1),
  isCorrect: z.boolean(),
});

export const questionSchema = z.object({
  text: z.string().min(1),
  options: z.array(optionSchema).min(2),
});

export const materialSchema = z.object({
  type: z.enum(["video", "file"]),
  title: z.string().min(1),
  fileUrl: z.string().min(1),
});

export const trainingScopeSchema = z.object({
  sedeId: z.string().min(1),
  puestoId: z.string().min(1),
  tareaId: z.string().min(1),
  validityDays: z.number().int().min(1).max(3650),
});

export const trainingCreateSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  coverImage: z.string().nullable().optional(),
  roomId: z.string().min(1),
  minPassScore: z.number().min(1).max(100),
  published: z.boolean().optional(),
  validityDays: z.number().int().min(1).max(3650).optional(),
  scope: trainingScopeSchema,
  materials: z.array(materialSchema).default([]),
  questions: z.array(questionSchema).min(1),
});

export const trainingUpdateSchema = trainingCreateSchema.extend({
  published: z.boolean(),
});

export type TrainingPayload = z.infer<typeof trainingCreateSchema>;

export function questionsHaveCorrectAnswers(
  questions: { options: { isCorrect: boolean }[] }[]
): boolean {
  return questions.every((q) => q.options.some((o) => o.isCorrect));
}
