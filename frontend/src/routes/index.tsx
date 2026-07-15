import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/Landing";

export const Route = createFileRoute("/")({
  component: LandingPage,
});
