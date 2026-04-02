# QA Updates
During the QA and testing phase, the following issues were discovered and systematically resolved:

1. **Next.js Server/Client Build Error:**
   - **Bug:** `lib/supabase.ts` originally exported both Browser and Server clients, whilst importing `next/headers` which is strictly forbidden in Client Components (used by `/login` and `/signup`).
   - **Fix:** Split the client initialization logically into `lib/supabase/client.ts` and `lib/supabase/server.ts`. Updated path aliases throughout the application, resolving all React server component build crashes.

2. **Supabase UUID TypeError in API Routes:**
   - **Bug:** `app/api/analyse/route.ts` used the IP address placeholder (`::1`) for tracking usage in the `usage_limits` table. Since `user_id` inside Supabase was enforced as a true UUID, this threw `error code 22P02`.
   - **Fix:** Switched `getSupabase()` to `await createServerSideClient()` and properly extracted `user.id` so usage analytics are tracked accurately to the authenticated user.

3. **Mistral Pixtral 400 Invalid Model Error:**
   - **Bug:** Attempting analysis against Mistral with model `"mistral-pixtral-latest"` resulted in a `400 Invalid model: mistral-pixtral-latest` HTTP error originating from their chat endpoint.
   - **Fix:** Replaced with the valid and verified `pixtral-12b-2409` vision model inside `api/analyse/route.ts`. Successfully tested to return comprehensive GCSE analysis JSON formatting.

4. **Missing Navigational CTAs:**
   - **Bug:** The landing page (`/`) had no explicit way for new users to navigate to `/signup` or `/login`.
   - **Fix:** Inserted intuitive and styled login/signup routes at the top of the landing page UI for clearer user-flow conversion.
