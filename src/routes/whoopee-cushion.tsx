import { createFileRoute } from "@tanstack/react-router";
import { FartBomb } from "@/components/FartBomb";
import { WhoopeeCushionArt } from "@/components/WhoopeeCushionArt";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/whoopee-cushion")({
  head: () => pageHead("Whoopee Cushion — Timed Fart Prank | ButtSounds.com", "Pick a real fart sound, set a timer, hide your phone near a friend and walk away. Disguise screens keep the prank secret.", "/whoopee-cushion"),
  component: CushionPage,
});

function CushionPage() {
  return (
    <main className="page-shell">
      <header className="bomb-hero">
        <WhoopeeCushionArt className="bomb-hero-cloud" />
        <h1 className="ensemble-title bomb-hero-title">Whoopee Cushion</h1>
      </header>
      <FartBomb />
    </main>
  );
}
