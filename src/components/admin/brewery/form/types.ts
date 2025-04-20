
import { z } from 'zod';

// Schema for brewery validation
export const brewerySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  brewery_type: z.string().optional().nullable(),
  about: z.string().optional().nullable(),
  website_url: z.string().url('Must be a valid URL').optional().nullable(),
  facebook_url: z.string().url('Must be a valid URL').optional().nullable(),
  instagram_url: z.string().url('Must be a valid URL').optional().nullable(),
  logo_url: z.string().url('Must be a valid URL').optional().nullable(),
  is_verified: z.boolean().default(false),
  country: z.string().optional().nullable(),
  contact_phone: z.string().optional(),
});

export type BreweryFormValues = z.infer<typeof brewerySchema>;
