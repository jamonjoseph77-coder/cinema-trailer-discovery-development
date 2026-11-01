CREATE TABLE IF NOT EXISTS admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON admin_users TO authenticated;
DROP POLICY IF EXISTS "select_own_admin_row" ON admin_users;
CREATE POLICY "select_own_admin_row" ON admin_users FOR SELECT
  TO authenticated USING (user_id = auth.uid());
CREATE OR REPLACE FUNCTION is_cinema_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()); $$;
REVOKE EXECUTE ON FUNCTION is_cinema_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION is_cinema_admin() TO authenticated;
CREATE OR REPLACE FUNCTION claim_first_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  LOCK TABLE admin_users IN EXCLUSIVE MODE;
  IF EXISTS (SELECT 1 FROM admin_users) THEN RETURN false; END IF;
  INSERT INTO admin_users (user_id) VALUES (auth.uid());
  RETURN true;
END;
$$;
REVOKE EXECUTE ON FUNCTION claim_first_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION claim_first_admin() TO authenticated;

CREATE TABLE IF NOT EXISTS titles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('movie', 'series', 'sport', 'news', 'live')),
  title text NOT NULL,
  synopsis text NOT NULL DEFAULT '',
  genre text NOT NULL DEFAULT '',
  release_year integer,
  release_date date,
  duration_minutes integer,
  publisher text NOT NULL DEFAULT '',
  poster_url text NOT NULL DEFAULT '',
  backdrop_url text NOT NULL DEFAULT '',
  trailer_url text NOT NULL DEFAULT '',
  playback_url text NOT NULL DEFAULT '',
  subtitle_url text NOT NULL DEFAULT '',
  availability text NOT NULL DEFAULT '',
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS titles_published_type_idx ON titles (is_published, type);
ALTER TABLE titles ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON titles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON titles TO authenticated;
CREATE POLICY "public_select_published_titles" ON titles FOR SELECT TO anon USING (is_published);
CREATE POLICY "member_select_titles" ON titles FOR SELECT TO authenticated USING (is_published OR is_cinema_admin());
CREATE POLICY "admin_insert_titles" ON titles FOR INSERT TO authenticated WITH CHECK (is_cinema_admin());
CREATE POLICY "admin_update_titles" ON titles FOR UPDATE TO authenticated USING (is_cinema_admin()) WITH CHECK (is_cinema_admin());
CREATE POLICY "admin_delete_titles" ON titles FOR DELETE TO authenticated USING (is_cinema_admin());

CREATE TABLE IF NOT EXISTS seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_id uuid NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  number integer NOT NULL CHECK (number > 0),
  name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (title_id, number)
);
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON seasons TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON seasons TO authenticated;
CREATE POLICY "select_visible_seasons" ON seasons FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM titles t WHERE t.id = seasons.title_id));
CREATE POLICY "admin_insert_seasons" ON seasons FOR INSERT TO authenticated WITH CHECK (is_cinema_admin());
CREATE POLICY "admin_update_seasons" ON seasons FOR UPDATE TO authenticated USING (is_cinema_admin()) WITH CHECK (is_cinema_admin());
CREATE POLICY "admin_delete_seasons" ON seasons FOR DELETE TO authenticated USING (is_cinema_admin());

CREATE TABLE IF NOT EXISTS episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  number integer NOT NULL CHECK (number > 0),
  title text NOT NULL DEFAULT '',
  synopsis text NOT NULL DEFAULT '',
  duration_minutes integer,
  playback_url text NOT NULL DEFAULT '',
  thumbnail_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (season_id, number)
);
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON episodes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON episodes TO authenticated;
CREATE POLICY "select_visible_episodes" ON episodes FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM seasons s WHERE s.id = episodes.season_id));
CREATE POLICY "admin_insert_episodes" ON episodes FOR INSERT TO authenticated WITH CHECK (is_cinema_admin());
CREATE POLICY "admin_update_episodes" ON episodes FOR UPDATE TO authenticated USING (is_cinema_admin()) WITH CHECK (is_cinema_admin());
CREATE POLICY "admin_delete_episodes" ON episodes FOR DELETE TO authenticated USING (is_cinema_admin());

CREATE TABLE IF NOT EXISTS watchlist_items (
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title_id uuid NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, title_id)
);
ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON watchlist_items TO authenticated;
CREATE POLICY "select_own_watchlist" ON watchlist_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_watchlist" ON watchlist_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_watchlist" ON watchlist_items FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_watchlist" ON watchlist_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS favourites (
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title_id uuid NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, title_id)
);
ALTER TABLE favourites ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON favourites TO authenticated;
CREATE POLICY "select_own_favourites" ON favourites FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_favourites" ON favourites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_favourites" ON favourites FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_favourites" ON favourites FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS watch_progress (
  user_id uuid NOT NULL DEFAULT auth.uid(),
  content_id uuid NOT NULL,
  title_id uuid NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  position_seconds double precision NOT NULL DEFAULT 0 CHECK (position_seconds >= 0),
  duration_seconds double precision NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  completed boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, content_id)
);
CREATE INDEX IF NOT EXISTS watch_progress_user_updated_idx ON watch_progress (user_id, updated_at DESC);
ALTER TABLE watch_progress ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON watch_progress TO authenticated;
CREATE POLICY "select_own_progress" ON watch_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_progress" ON watch_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_progress" ON watch_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_progress" ON watch_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS profiles (
  user_id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE CHECK (username ~ '^[a-z0-9_]{3,24}$'),
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 60),
  bio text NOT NULL DEFAULT '' CHECK (char_length(bio) <= 280),
  is_discoverable boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL DEFAULT auth.uid(),
  addressee_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (requester_id <> addressee_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS friendships_pair_key
  ON friendships (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));
CREATE INDEX IF NOT EXISTS friendships_addressee_idx ON friendships (addressee_id);
CREATE TABLE IF NOT EXISTS watch_parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL DEFAULT auth.uid(),
  title_id uuid NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  visibility text NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
  invite_code text NOT NULL UNIQUE DEFAULT upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  scheduled_at timestamptz,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS watch_parties_host_idx ON watch_parties (host_id);
CREATE INDEX IF NOT EXISTS watch_parties_title_idx ON watch_parties (title_id);
CREATE TABLE IF NOT EXISTS watch_party_members (
  party_id uuid NOT NULL REFERENCES watch_parties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  role text NOT NULL DEFAULT 'guest' CHECK (role IN ('host', 'guest')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (party_id, user_id)
);
CREATE INDEX IF NOT EXISTS watch_party_members_user_idx ON watch_party_members (user_id);
CREATE TABLE IF NOT EXISTS watch_party_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id uuid NOT NULL REFERENCES watch_parties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS watch_party_messages_party_idx ON watch_party_messages (party_id, created_at);
CREATE TABLE IF NOT EXISTS publisher_follows (
  user_id uuid NOT NULL DEFAULT auth.uid(),
  publisher_name text NOT NULL CHECK (char_length(publisher_name) BETWEEN 1 AND 120),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, publisher_name)
);
CREATE OR REPLACE FUNCTION is_party_member(p_party_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM watch_party_members m WHERE m.party_id = p_party_id AND m.user_id = auth.uid()); $$;
CREATE OR REPLACE FUNCTION is_party_host(p_party_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM watch_parties p WHERE p.id = p_party_id AND p.host_id = auth.uid()); $$;
REVOKE EXECUTE ON FUNCTION is_party_member(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION is_party_host(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION is_party_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_party_host(uuid) TO authenticated;
CREATE OR REPLACE FUNCTION add_watch_party_host()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO watch_party_members (party_id, user_id, role)
  VALUES (NEW.id, NEW.host_id, 'host')
  ON CONFLICT (party_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION add_watch_party_host() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER watch_party_add_host AFTER INSERT ON watch_parties
FOR EACH ROW EXECUTE FUNCTION add_watch_party_host();
CREATE OR REPLACE FUNCTION join_watch_party(p_invite_code text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_party watch_parties%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'You need to be signed in to join a watch party.';
  END IF;
  SELECT * INTO v_party FROM watch_parties WHERE invite_code = upper(trim(p_invite_code));
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No watch party matches that invite code.';
  END IF;
  IF v_party.status = 'ended' THEN
    RAISE EXCEPTION 'This watch party has already ended.';
  END IF;
  INSERT INTO watch_party_members (party_id, user_id, role)
  VALUES (v_party.id, auth.uid(), CASE WHEN v_party.host_id = auth.uid() THEN 'host' ELSE 'guest' END)
  ON CONFLICT (party_id, user_id) DO NOTHING;
  RETURN v_party.id;
END;
$$;
REVOKE EXECUTE ON FUNCTION join_watch_party(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION join_watch_party(text) TO authenticated;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON profiles TO authenticated;
GRANT INSERT (user_id, username, display_name, bio, is_discoverable) ON profiles TO authenticated;
GRANT UPDATE (username, display_name, bio, is_discoverable, updated_at) ON profiles TO authenticated;
CREATE POLICY "select_visible_profiles" ON profiles FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR is_discoverable
  OR EXISTS (
    SELECT 1 FROM friendships f
    WHERE (f.requester_id = auth.uid() AND f.addressee_id = profiles.user_id)
       OR (f.addressee_id = auth.uid() AND f.requester_id = profiles.user_id)
  )
);
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
GRANT SELECT, DELETE ON friendships TO authenticated;
GRANT INSERT (requester_id, addressee_id, status) ON friendships TO authenticated;
GRANT UPDATE (status, updated_at) ON friendships TO authenticated;
CREATE POLICY "select_own_friendships" ON friendships FOR SELECT TO authenticated USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "insert_friend_request" ON friendships FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id AND status = 'pending');
CREATE POLICY "accept_friend_request" ON friendships FOR UPDATE TO authenticated USING (auth.uid() = addressee_id) WITH CHECK (auth.uid() = addressee_id AND status = 'accepted');
CREATE POLICY "delete_own_friendship" ON friendships FOR DELETE TO authenticated USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

ALTER TABLE watch_parties ENABLE ROW LEVEL SECURITY;
GRANT SELECT, DELETE ON watch_parties TO authenticated;
GRANT INSERT (host_id, title_id, name, visibility, scheduled_at) ON watch_parties TO authenticated;
GRANT UPDATE (name, visibility, scheduled_at, status, updated_at) ON watch_parties TO authenticated;
CREATE POLICY "select_visible_parties" ON watch_parties FOR SELECT TO authenticated
USING (host_id = auth.uid() OR visibility = 'public' OR is_party_member(id));
CREATE POLICY "insert_own_party" ON watch_parties FOR INSERT TO authenticated WITH CHECK (host_id = auth.uid());
CREATE POLICY "update_own_party" ON watch_parties FOR UPDATE TO authenticated USING (host_id = auth.uid()) WITH CHECK (host_id = auth.uid());
CREATE POLICY "delete_own_party" ON watch_parties FOR DELETE TO authenticated USING (host_id = auth.uid());

ALTER TABLE watch_party_members ENABLE ROW LEVEL SECURITY;
GRANT SELECT, DELETE ON watch_party_members TO authenticated;
GRANT INSERT (party_id, user_id, role) ON watch_party_members TO authenticated;
CREATE POLICY "select_party_members" ON watch_party_members FOR SELECT TO authenticated
USING (
  is_party_member(party_id)
  OR EXISTS (SELECT 1 FROM watch_parties p WHERE p.id = watch_party_members.party_id AND p.visibility = 'public')
);
CREATE POLICY "join_public_party" ON watch_party_members FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND role = 'guest'
  AND EXISTS (
    SELECT 1 FROM watch_parties p
    WHERE p.id = watch_party_members.party_id AND p.visibility = 'public' AND p.status <> 'ended'
  )
);
CREATE POLICY "leave_or_remove_guest" ON watch_party_members FOR DELETE TO authenticated
USING ((user_id = auth.uid() AND role = 'guest') OR is_party_host(party_id));

ALTER TABLE watch_party_messages ENABLE ROW LEVEL SECURITY;
GRANT SELECT, DELETE ON watch_party_messages TO authenticated;
GRANT INSERT (party_id, user_id, body) ON watch_party_messages TO authenticated;
CREATE POLICY "select_party_messages" ON watch_party_messages FOR SELECT TO authenticated USING (is_party_member(party_id));
CREATE POLICY "insert_party_message" ON watch_party_messages FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND is_party_member(party_id));
CREATE POLICY "delete_party_message" ON watch_party_messages FOR DELETE TO authenticated USING (user_id = auth.uid() OR is_party_host(party_id));

ALTER TABLE publisher_follows ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON publisher_follows TO authenticated;
CREATE POLICY "select_own_follows" ON publisher_follows FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "insert_own_follow" ON publisher_follows FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "delete_own_follow" ON publisher_follows FOR DELETE TO authenticated USING (user_id = auth.uid());

ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_party_messages, public.watch_party_members, public.watch_parties;
ALTER TABLE watch_party_members REPLICA IDENTITY FULL;

CREATE TABLE IF NOT EXISTS discover_clips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('trailer', 'short', 'clip', 'featured')),
  headline text NOT NULL CHECK (char_length(headline) BETWEEN 1 AND 160),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 1000),
  video_url text NOT NULL CHECK (char_length(video_url) BETWEEN 1 AND 2000),
  poster_url text NOT NULL DEFAULT '',
  publisher_name text NOT NULL DEFAULT '',
  title_id uuid REFERENCES titles(id) ON DELETE SET NULL,
  duration_seconds integer CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS discover_clips_published_idx ON discover_clips (is_published, kind, sort_order);
CREATE INDEX IF NOT EXISTS discover_clips_title_idx ON discover_clips (title_id);
ALTER TABLE discover_clips ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON discover_clips TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON discover_clips TO authenticated;
CREATE POLICY "public_select_published_clips" ON discover_clips FOR SELECT TO anon USING (is_published = true);
CREATE POLICY "authenticated_select_clips" ON discover_clips FOR SELECT TO authenticated USING (is_published = true OR is_cinema_admin());
CREATE POLICY "admin_insert_clips" ON discover_clips FOR INSERT TO authenticated WITH CHECK (is_cinema_admin());
CREATE POLICY "admin_update_clips" ON discover_clips FOR UPDATE TO authenticated USING (is_cinema_admin()) WITH CHECK (is_cinema_admin());
CREATE POLICY "admin_delete_clips" ON discover_clips FOR DELETE TO authenticated USING (is_cinema_admin());

REVOKE TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;