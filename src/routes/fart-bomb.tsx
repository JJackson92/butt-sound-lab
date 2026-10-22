import { createFileRoute } from "@tanstack/react-router";
import { FartBomb } from "@/components/FartBomb";
import { MushroomCloud } from "@/components/MushroomCloud";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/fart-bomb")({
  head: () => pageHead("Fart Bomb — Timed Fart Prank | ButtSounds.com", "Pick a real fart sound, set a timer, hide your phone near a friend and walk away. Disguise screens keep the prank secret.", "/fart-bomb"),
  component: BombPage,
});

function BombPage() {
  return (
    <main className="page-shell">
      <header className="bomb-hero">
        <MushroomCloud className="bomb-hero-cloud" />
        <h1 className="ensemble-title bomb-hero-title">Fart Bomb</h1>
      </header>
      <FartBomb />
    </main>
  );
}
