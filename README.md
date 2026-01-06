<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/12VRfG60WsVqJUsO4s5p3i4lYdlUWi-ls

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## Cloud setup (Supabase + Vercel)

Create table in Supabase:

```sql
create table if not exists app_state (
  id text primary key,
  students_json jsonb not null,
  updated_at timestamptz not null default now()
);
```

Set Vercel env vars (Production + Preview):
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- GEMINI_API_KEY
- APP_SECRET (random long string)

