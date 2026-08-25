import type { Metadata } from "next";
import { PublicEventsPageContent } from "@/components/pages/PublicEventsPageContent";
import { listPublicEventsFromDb } from "@/lib/public-events-db";

export const metadata: Metadata = {
  title: "Public Events",
  description:
    "Explore Ash-Shajrah public events, upcoming workshops, and community learning sessions. Register online for open events.",
  alternates: {
    canonical: "/events",
  },
};

export default async function EventsPage() {
  const events = await listPublicEventsFromDb();

  return (
    <PublicEventsPageContent
      initialCurrentUpcoming={events.currentUpcoming}
      initialPast={events.past}
    />
  );
}
