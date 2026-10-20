import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { WindEnsemble } from "@/components/WindEnsemble";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/ensemble")({
  validateSearch: z.object({ s: z.string().optional() }),
  head: () => pageHead("The Wind Ensemble — Fart Piano Roll | ButtSounds.com", "Drag your favorite farts onto a 16-step piano roll and play your own butt symphony. Share the song with a link.", "/ensemble"),
  component: EnsemblePage,
});

function EnsemblePage() {
  const { s } = Route.useSearch();
  return (
    <main className="page-shell">
      <h1 className="ensemble-title">The Wind Ensemble</h1>
      <WindEnsemble initial={s} />
    </main>
  );
}
