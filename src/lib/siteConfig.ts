import { z } from 'astro:content';
import siteData from '../data/site.json';

const SiteConfigSchema = z.object({
  siteName: z.string(),
  tagline: z.string(),
  contactEmail: z.string().email(),
  googleFormUrl: z.string().url(),
  beholdWidgetId: z.string(),
  socialLinks: z.object({
    instagram: z.string().url(),
    email: z.string().email(),
  }),
});

export type SiteConfig = z.infer<typeof SiteConfigSchema>;

export const siteConfig: SiteConfig = SiteConfigSchema.parse(siteData);
