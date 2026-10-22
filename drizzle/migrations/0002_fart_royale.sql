CREATE TABLE public.royale_farts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 30),
  audio text NOT NULL CHECK (char_length(audio) BETWEEN 1 AND 300),
  device_id text NOT NULL CHECK (char_length(device_id) BETWEEN 4 AND 64),
  butt_style text NOT NULL DEFAULT 'peach' CHECK (butt_style IN ('peach','comic','hologram','gold','alien')),
  elo integer NOT NULL DEFAULT 1200,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.royale_farts TO anon, authenticated;
GRANT ALL ON public.royale_farts TO service_role;
ALTER TABLE public.royale_farts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads royale farts" ON public.royale_farts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anyone enters royale" ON public.royale_farts FOR INSERT TO anon, authenticated
  WITH CHECK (elo = 1200 AND wins = 0 AND losses = 0 AND audio LIKE 'uploads/%');
CREATE INDEX royale_farts_elo_idx ON public.royale_farts (elo DESC);

CREATE TABLE public.royale_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voter text NOT NULL,
  winner_id uuid NOT NULL REFERENCES public.royale_farts(id) ON DELETE CASCADE,
  loser_id uuid NOT NULL REFERENCES public.royale_farts(id) ON DELETE CASCADE,
  pair_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (voter, pair_key)
);
GRANT ALL ON public.royale_votes TO service_role;
ALTER TABLE public.royale_votes ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.royale_vote(_winner uuid, _loser uuid, _voter text)
RETURNS TABLE (winner_elo integer, loser_elo integer, delta integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE w integer; l integer; d integer; k text;
BEGIN
  IF _winner = _loser OR char_length(_voter) NOT BETWEEN 4 AND 64 THEN RAISE EXCEPTION 'invalid vote'; END IF;
  k := least(_winner::text, _loser::text) || ':' || greatest(_winner::text, _loser::text);
  INSERT INTO royale_votes (voter, winner_id, loser_id, pair_key) VALUES (_voter, _winner, _loser, k)
    ON CONFLICT (voter, pair_key) DO NOTHING;
  IF NOT FOUND THEN RAISE EXCEPTION 'already voted on this pair'; END IF;
  SELECT elo INTO w FROM royale_farts WHERE id = _winner FOR UPDATE;
  SELECT elo INTO l FROM royale_farts WHERE id = _loser FOR UPDATE;
  IF w IS NULL OR l IS NULL THEN RAISE EXCEPTION 'unknown fart'; END IF;
  d := greatest(1, round(32 * (1 - 1 / (1 + power(10, (l - w) / 400.0)))))::integer;
  UPDATE royale_farts SET elo = elo + d, wins = wins + 1 WHERE id = _winner;
  UPDATE royale_farts SET elo = elo - d, losses = losses + 1 WHERE id = _loser;
  RETURN QUERY SELECT w + d, l - d, d;
END $$;
GRANT EXECUTE ON FUNCTION public.royale_vote(uuid, uuid, text) TO anon, authenticated;

CREATE POLICY "anyone reads royale audio" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'royale-audio');
CREATE POLICY "anyone uploads royale audio" ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'royale-audio' AND (storage.foldername(name))[1] = 'uploads');

INSERT INTO public.royale_farts (name, audio, butt_style, device_id) VALUES
('Crisp Toot','https://cdn.freesound.org/previews/253/253840_4062622-hq.mp3','peach','seed'),
('The Classic Brap','https://cdn.freesound.org/previews/777/777433_13558226-hq.mp3','comic','seed'),
('Snare Whoopee Rumble','https://cdn.freesound.org/previews/650/650649_13558226-hq.mp3','hologram','seed'),
('Motorcycle Honk','https://cdn.freesound.org/previews/732/732064_15881540-hq.mp3','gold','seed'),
('Balloon Snort','https://cdn.freesound.org/previews/521/521092_2628301-hq.mp3','alien','seed'),
('Motorcycle Tuba Croak','https://cdn.freesound.org/previews/253/253814_4062622-hq.mp3','peach','seed'),
('Soggy Crackle','https://cdn.freesound.org/previews/253/253813_4062622-hq.mp3','comic','seed'),
('Whistling Whisper','https://cdn.freesound.org/previews/338/338896_6029415-hq.mp3','hologram','seed'),
('Crisp Screech','https://cdn.freesound.org/previews/389/389650_4103633-hq.mp3','gold','seed'),
('Sputtering Submarine Burst','https://cdn.freesound.org/previews/346/346144_3853968-hq.mp3','alien','seed'),
('Gurgling Ripper','https://cdn.freesound.org/previews/237/237664_180659-hq.mp3','peach','seed'),
('Frothy Kazoo Toot','https://cdn.freesound.org/previews/558/558740_5487341-hq.mp3','comic','seed');