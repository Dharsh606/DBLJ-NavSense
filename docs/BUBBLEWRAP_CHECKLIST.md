# Bubblewrap Release Checklist

## Pre-deploy
- Ensure `npm run build` passes with strict TypeScript and ESLint.
- Confirm `vercel.json` points to root Next.js build.
- Verify `manifest.json` has valid name, icons, start URL, theme/background.

## PWA readiness
- Service worker registered and offline shell works.
- App opens from home screen in standalone mode.
- HTTPS domain is live and stable.

## Android package inputs
- Package ID finalized.
- Keystore generated and stored safely.
- App icon, splash assets, and notification icon exported.

## Bubblewrap steps
- `bubblewrap init --manifest https://<domain>/manifest.json`
- `bubblewrap build`
- `bubblewrap install`
- Test deep links, back button, share intents, emergency call/SMS intents.

## Final QA
- Real navigation route generation works.
- Emergency flow opens call/SMS with location payload.
- GPS tracking exports valid JSON.
- Obstacle detection starts/stops without camera leaks.

