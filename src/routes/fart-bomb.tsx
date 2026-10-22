import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/fart-bomb")({
  beforeLoad: () => { throw redirect({ to: "/whoopee-cushion" }); },
});
