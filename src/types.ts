import { z } from "zod";

export const LocaleSchema = z.object({
  code: z.string(),
  name: z.string(),
  paths: z.record(z.string()),
  texts: z.record(z.string()),
});

export type Locale = z.infer<typeof LocaleSchema>;

export const LocalesSchema = z.array(LocaleSchema);

export type Locales = z.infer<typeof LocalesSchema>;
