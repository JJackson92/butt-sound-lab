ALTER TABLE public.flappy_scores ADD COLUMN toots integer NOT NULL DEFAULT 0;
ALTER TABLE public.flappy_scores ADD CONSTRAINT flappy_toots_range CHECK (toots >= 0 AND toots <= 100000) NOT VALID;
CREATE INDEX flappy_scores_score_idx ON public.flappy_scores (score DESC, toots DESC);
CREATE INDEX flappy_scores_toots_idx ON public.flappy_scores (toots DESC, score DESC);