# Cinema verification — 1 November 2026

## Completed
- Removed the visitor-facing first-admin claim and its application helper.
- Replaced the live claim function with an inert, non-privileged implementation and revoked execution from API roles. Ordinary accounts cannot insert or update admin membership; verified owner-directed privileged project management is the assignment path. No account was promoted.
- All six live admin permission checks passed. Three admin behavior tests and the existing routing test passed. Preview builds succeeded and browser verification recorded no runtime errors.
- Basic and deep security scans returned no findings. These results are not a guarantee; the deep scan targets the saved project snapshot, and the admin change was additionally checked directly against the live database.
- Compared original uploaded Bolt configuration against the active managed database: they are different projects. Current browser configuration points at Lovable Cloud. No original database writes, resets, deletions, or credential requests were made. The original database's present health/content was not queried.
- Home, Movies, Series and Search rendered actual TMDB data. Independently fetched live TMDB responses returned HTTP 200 and matched sampled displayed title IDs. Movies and Series showed 20 popular titles each; Inception search returned 12 movies and one series. Trending, Action filtering, search and Inception detail navigation worked.
- Inspected all leaf page metadata and supplied missing social-sharing type/card fields without redesigning pages.

## Authentication verification and limitations
- Hosted settings: email/password enabled; public registration enabled; email confirmation required; anonymous accounts disabled; social providers disabled.
- Published site and preview return URLs are allowed. Localhost is not on the hosted return list.
- Short-password registration was rejected; a reserved invalid email address did not create an account; nonexistent-account login showed the expected error. A nonexistent-account recovery request returned a non-enumerating notice. No passwords or tokens were logged or requested from the owner.
- No existing auth users were available to mint a test session. Successful registration, actual confirmation-email receipt, login/logout and password-reset completion therefore remain unverified. A real controlled mailbox/account is needed; no bypass or auto-confirm change was introduced.
- Password-reset page lacks an explicit expired/invalid-link state. This was identified, not redesigned.

## Watch parties
- Membership, messages and room-status subscriptions exist; all three tables are in the realtime publication.
- Shared play/pause/seek and playback-position synchronization are not implemented. Current rooms are not verified synchronized watch parties.
- Two-person testing needs two distinct confirmed accounts, separate sessions and a published Cinema title with a working licensed playback URL. TMDB metadata is not a streaming source.
- Test public joining and private invitation, host/guest membership, messages, start/end status, access denial, removal and leave behavior in both sessions. These have not been exercised end to end.
- Public room rows include their invitation code for authenticated readers; review its intended visibility before treating codes as private secrets.

## Data migration requirements
- Keep Bolt as the source of truth until an owner-approved migration is reconciled.
- Obtain non-secret exports of existing application records, retaining record IDs and relationship fields. Inventory catalogues, seasons/episodes, clips, profiles, lists, watch progress, friendships and parties, plus referenced media files.
- Plan account mapping before importing user-owned rows: recreated accounts can have different IDs. Credentials, passwords and session tokens must not be requested or transferred through chat.
- Import parents before dependent records, map owners, compare counts/relationships and verify access rules before any cutover. No original records were imported in this review and no original data was modified.

## Release note
The shared backend admin fix is live for preview and published clients, including old clients attempting to claim access. Frontend changes remain in the preview until explicitly published; this review did not publish or redesign the site.