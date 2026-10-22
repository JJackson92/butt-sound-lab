CREATE TABLE public.saved_sounds (
  user_id uuid NOT NULL,
  sound_key text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, sound_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_sounds TO authenticated;
GRANT ALL ON public.saved_sounds TO service_role;
ALTER TABLE public.saved_sounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sounds read" ON public.saved_sounds FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own sounds insert" ON public.saved_sounds FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND char_length(sound_key) <= 4000);
CREATE POLICY "own sounds update" ON public.saved_sounds FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own sounds delete" ON public.saved_sounds FOR DELETE TO authenticated USING (auth.uid() = user_id);