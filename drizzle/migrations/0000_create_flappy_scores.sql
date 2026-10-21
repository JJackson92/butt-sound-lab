CREATE TABLE public.flappy_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  score integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.flappy_scores TO anon;
GRANT SELECT, INSERT ON public.flappy_scores TO authenticated;
GRANT ALL ON public.flappy_scores TO service_role;

ALTER TABLE public.flappy_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can read scores"
  ON public.flappy_scores FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "anyone can submit a score"
  ON public.flappy_scores FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    score >= 0 AND score <= 10000
    AND char_length(btrim(name)) BETWEEN 1 AND 24
    AND char_length(country) = 2
  );