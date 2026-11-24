import { z } from "zod";

export const EntrySchema = z.object({
  id: z.string().uuid(),
  rawText: z.string(),
  source: z.enum(["voice", "text"]),
  createdAt: z.string().datetime(),
  synced: z.boolean().default(false),
  syncedAt: z.string().datetime().nullable().default(null),
});

export type Entry = z.infer<typeof EntrySchema>;

export const PersonSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  birthday: z.string().nullable().default(null),
  lastContact: z.string().datetime().nullable().default(null),
  notes: z.string().default(""),
  createdAt: z.string().datetime(),
});

export type Person = z.infer<typeof PersonSchema>;

export const MentionSchema = z.object({
  id: z.string().uuid(),
  entryId: z.string().uuid(),
  personId: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export type Mention = z.infer<typeof MentionSchema>;

export const CheckInSchema = z.object({
  id: z.string().uuid(),
  energy: z.number().int().min(1).max(5),
  hoursWorked: z.number().min(0),
  createdAt: z.string().datetime(),
});

export type CheckIn = z.infer<typeof CheckInSchema>;

export const IdeaSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1),
  createdAt: z.string().datetime(),
  resurfaceAt: z.string().datetime(),
});

export type Idea = z.infer<typeof IdeaSchema>;

export const NudgeSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  createdAt: z.string().datetime(),
  shownAt: z.string().datetime().nullable().default(null),
  actedOn: z.boolean().nullable().default(null),
});

export type Nudge = z.infer<typeof NudgeSchema>;
