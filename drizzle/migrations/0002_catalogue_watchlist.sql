-- Additive only: lets signed-in viewers save catalogue titles (movies and series that are not Cinema-hosted titles) to their watchlist.
-- Existing tables and user data are untouched.
CREATE TABLE IF NOT EXISTS catalogue_watchlist (
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  media_type text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  catalogue_id integer NOT NULL CHECK (catalogue_id > 0),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 300),
  poster_path text CHECK (poster_path IS NULL OR poster_path ~ '^/[A-Za-z0-9_.-]+\.(jpg|jpeg|png|webp)$'),
  backdrop_path text CHECK (backdrop_path IS NULL OR backdrop_path ~ '^/[A-Za-z0-9_.-]+\.(jpg|jpeg|png|webp)$'),
  release_date text CHECK (release_date IS NULL OR release_date ~ '^\d{4}-\d{2}-\d{2}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, media_type, catalogue_id)
);
ALTER TABLE catalogue_watchlist ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON catalogue_watchlist FROM PUBLIC, anon;
GRANT SELECT, INSERT, DELETE ON catalogue_watchlist TO authenticated;
CREATE POLICY "select_own_catalogue_watchlist" ON catalogue_watchlist FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_catalogue_watchlist" ON catalogue_watchlist FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_catalogue_watchlist" ON catalogue_watchlist FOR DELETE TO authenticated USING (auth.uid() = user_id);
