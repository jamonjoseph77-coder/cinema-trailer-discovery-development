<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Pages live in `src/pages` and are mounted by thin TanStack route files in `src/routes`; `src/lib/router.ts` derives the app's `Route` union from the TanStack location for nav highlighting — keep both in sync when adding a page.
- Plain `<a href="/...">` links are intercepted in `__root.tsx` and routed client-side; `navigateTo()` uses the registered router. Why: the code came from a hash-router app and relies on plain anchors.
- TMDB calls go through `callTmdbServer` (`src/lib/tmdb.functions.ts`) so the API token stays server-side.
- Admin access uses the separate `admin_users` table and `is_cinema_admin()`; only the verified project owner may assign membership through privileged project management, never through a visitor-facing endpoint. The deprecated `claim_first_admin()` is inert and not executable by API roles to prevent self-promotion.
