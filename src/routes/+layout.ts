import { dev } from '$app/env';
import { injectAnalytics } from '@vercel/analytics/sveltekit';

// Cookieless page-view counting via Vercel Web Analytics; logs locally in dev instead of sending.
injectAnalytics({ mode: dev ? 'development' : 'production' });

// Every page is static: built once, served from Vercel's edge without a function.
export const prerender = true;
