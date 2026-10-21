import { createFileRoute } from "@tanstack/react-router";
import { FlappyCheeks } from "@/components/FlappyCheeks";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/flappy-cheeks")({
  head: () => pageHead("Flappy Cheeks — Fart-Powered Arcade Game | ButtSounds.com", "Toot your way through a tiled bathroom, dodging ceiling plungers and stacked toilet paper rolls. How far can your cheeks fly?", "/flappy-cheeks"),
  component: FlappyPage,
});

function FlappyPage() {
  return (
    <main className="page-shell">
      <h1 className="ensemble-title">Flappy Cheeks</h1>
      <FlappyCheeks />
    </main>
  );
}
