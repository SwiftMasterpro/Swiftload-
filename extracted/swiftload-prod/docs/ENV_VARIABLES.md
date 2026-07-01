# Environment Variables Reference

## Required (app will not start without these)

| Variable                          | Description                          |
|-----------------------------------|--------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`        | Your Supabase project URL            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Public anon key (safe for browser)   |
| `SUPABASE_SERVICE_ROLE_KEY`       | Admin key (server-only, never expose)|
| `STRIPE_SECRET_KEY`               | Stripe secret key (server-only)      |
| `STRIPE_WEBHOOK_SECRET`           | Stripe webhook signing secret        |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (browser) |

## Feature-Gated (app works without, features degrade)

| Variable                          | Feature gated                        |
|-----------------------------------|--------------------------------------|
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY`     | Live maps, route, geolocation        |
| `OPENAI_API_KEY`                  | SwiftAI assistant, price prediction  |
| `NEXT_PUBLIC_ONESIGNAL_APP_ID`    | Push notifications                   |
| `ONESIGNAL_API_KEY`               | Server-side push                     |

## Configuration

| Variable                          | Default                              |
|-----------------------------------|--------------------------------------|
| `NEXT_PUBLIC_APP_URL`             | `https://swiftload.co.bw`            |
| `NEXTAUTH_SECRET`                 | Must generate: `openssl rand -base64 32` |
| `NODE_ENV`                        | `production`                         |

## Current Supabase Values (project: pyiduregtpbynsjrnhua)

```
NEXT_PUBLIC_SUPABASE_URL=https://pyiduregtpbynsjrnhua.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_XLuZMcJTC7U6whFUtpHnvA_R_3DsYWG
```
