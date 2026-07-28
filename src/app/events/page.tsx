import type { Metadata } from "next";
import { PublicEventsPageContent } from "@/components/pages/PublicEventsPageContent";

export const metadata: Metadata = {
  title: "Public Events",
  description:
    "Explore Ash-Shajrah public events, upcoming workshops, and community learning sessions. Register online for open events.",
  alternates: {
    canonical: "/events",
  },
};

export default function EventsPage() {
  return <PublicEventsPageContent />;
}
