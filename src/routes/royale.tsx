import { createFileRoute } from "@tanstack/react-router";
import { FartRoyale } from "@/components/FartRoyale";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/royale")({
  head: () => pageHead("Fart Royale — Head-to-Head Fart Battles | ButtSounds.com", "Record or upload your own fart, name it, and battle other farts head-to-head. Vote for the best and claim the Golden Royale Crown.", "/royale"),
  component: RoyalePage,
});

function RoyalePage() {
  return (
    <main className="page-shell">
      <h1 className="ensemble-title">Fart Royale</h1>
      <FartRoyale />
    </main>
  );
}
