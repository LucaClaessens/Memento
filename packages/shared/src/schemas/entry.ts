import { z } from "zod";

export const MAX_ENTRY_LENGTH = 10_000;

export const EntrySchema = z.object({
  id: z.string().uuid(),
  rawText: z.string(),
  source: z.enum(["voice", "text"]),
  createdAt: z.string().datetime(),
  parentId: z.string().uuid().nullable().default(null),
  title: z.string().nullable().default(null),
  summary: z.string().nullable().default(null),
  titleSource: z.enum(["first_line", "ai"]).nullable().default(null),
  synced: z.boolean().default(false),
  syncedAt: z.string().datetime().nullable().default(null),
});

export type Entry = z.infer<typeof EntrySchema>;

export const CreateEntrySchema = z.object({
  id: z.string().uuid().optional(),
  rawText: z
    .string()
    .max(
      MAX_ENTRY_LENGTH,
      `rawText must be at most ${MAX_ENTRY_LENGTH.toLocaleString("en-US")} characters`
    )
    .refine((value) => value.trim().length > 0, "rawText must not be empty"),
  source: z.enum(["voice", "text"]).default("text"),
  createdAt: z.string().datetime().optional(),
  parentId: z.string().uuid().nullable().optional(),
});

export type CreateEntry = z.infer<typeof CreateEntrySchema>;

export const EntryListSchema = z.object({
  entries: z.array(EntrySchema),
});

export type EntryList = z.infer<typeof EntryListSchema>;

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
