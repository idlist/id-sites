import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { defineCollection } from 'astro:content'

const notes = defineCollection({
  loader: glob({
    base: './src/notes',
    pattern: '**/*.{md,mdx}',
  }),
  schema: z.object({
    lang: z.string().default('zh'),
    title: z.string(),
    route: z.string(),
    topic: z.string().optional(),
    license: z.string().optional(),
    created: z.coerce.date(),
    updated: z.coerce.date().optional(),
  }),
})

export const collections = { notes }
