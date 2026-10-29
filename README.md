# ArulKit Store

Next.js 14 + TypeScript + Tailwind + Supabase starter for a digital ZIP store.

## Local setup
1. Install Node.js 20+.
2. Copy `.env.example` to `.env.local` and fill in Supabase project URL and anon key.
3. Run `npm install` then `npm run dev`.
4. Open `http://localhost:3000`.

## Vercel
- Import this repository into Vercel.
- Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, and `NEXAPAYZ_API_KEY` in Project Settings > Environment Variables.
- Add `https://store.arulkit.my.id/auth/callback` to Supabase Auth > URL Configuration > Redirect URLs.
- Configure Google provider in Supabase Auth and Google Cloud Console.
- Point `store.arulkit.my.id` to Vercel using the DNS records Vercel displays.

## Supabase SQL
Run `supabase/schema.sql` in the Supabase SQL Editor. This creates starter tables and limited RLS policies.

## Admin
1. Register/log in once using the intended admin account.
2. Find that user in Supabase Authentication > Users and copy their UUID.
3. Ensure a matching row exists in `public.profiles`, then run:
   `update public.profiles set role='admin' where id='USER_UUID';`
Do not expose service-role keys in browser code. The current UI does not yet include the production admin dashboard or trusted admin authorization.

## Important unfinished integrations
- Product cards currently use sample data in `lib/products.ts`. Replace titles/prices with your real catalogue.
- Product ZIP uploads, private storage, order checkout, and authenticated download URLs are not enabled yet.
- NexaPayz invoice creation needs the exact API-key header/authorization format and response behavior confirmed by the provider. Do not guess the header.
- The webhook endpoint currently validates basic JSON shape and acknowledges receipt only. It does NOT mark an order paid. Add provider signature/secret validation or another trusted verification method before enabling delivery.
- Custom Supabase auth domain is optional and may require a Supabase plan/configuration. Google consent branding and redirect URLs must be configured separately.


## Intro loading video

The first visit in each browser tab shows an intro screen before the store. Put your own video at `public/intro.mp4` (that folder is created when you add the file), or set `NEXT_PUBLIC_INTRO_VIDEO_URL` in Vercel to a public HTTPS video URL.

- Supported display ratios: 16:9 and 9:16; the video area adapts to the actual video ratio.
- Maximum video duration: 15 seconds. If the video is longer, the intro uses the fallback panel instead.
- The video starts muted because mobile browsers usually block autoplay with sound. Visitors can toggle sound.
- Progress reacts to page-load and video-readiness signals, so slower connections generally take longer. A 9-second safety timeout prevents a broken video/network from trapping visitors.
- Intro is shown once per tab session. Reloading after it has been dismissed will not replay it in that tab.
- For large videos, compress the file first so mobile visitors do not have to download a giant cinematic masterpiece just to reach a ZIP catalog.

For a local video, create `public/intro.mp4` and keep `NEXT_PUBLIC_INTRO_VIDEO_URL=/intro.mp4`. For a hosted video, set the environment variable to its direct video URL in Vercel, then redeploy.
