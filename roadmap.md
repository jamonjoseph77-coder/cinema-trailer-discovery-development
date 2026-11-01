# Cinema security and verification
- [x] Disable administrator self-assignment in the interface and database.
- [x] Verify database separation without modifying Bolt data.
- [x] Verify Home, Movies, Series, and Search with live TMDB data; Discover is local-only and empty.
- [x] Test authentication validation and rejected login/recovery requests; verify hosted email confirmation settings and redirects.
- [x] Inspect two-person watch-party prerequisites and missing playback synchronization.
- [x] Run security regression checks and summarize migration needs.
- [ ] Successful signup, email confirmation, login, logout, and reset completion — blocked on a real confirmed account and mailbox access; no auth users exist.
- [ ] Real two-person party — blocked on two confirmed accounts and a licensed playable Cinema title; playback synchronization is not implemented.
- [ ] Original data migration — blocked on owner-approved non-secret exports and account-ID mapping; original Bolt database remains untouched.