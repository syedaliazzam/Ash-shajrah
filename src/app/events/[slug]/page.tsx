import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicEventDetailPageContent } from "@/components/pages/PublicEventDetailPageContent";
import { getPublicEventBySlugFromDb } from "@/lib/public-events-db";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublicEventBySlugFromDb(slug);

  if (!event) {
    return {
      title: "Event Not Found",
      alternates: { canonical: `/events/${slug}` },
    };
  }

  return {
    title: `${event.title} | Public Events`,
    description: event.description || "Ash-Shajrah public event details and registration.",
    alternates: {
      canonical: `/events/${slug}`,
    },
  };
}

export default async function PublicEventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getPublicEventBySlugFromDb(slug);

  if (!event) {
    notFound();
  }

  return <PublicEventDetailPageContent event={event} />;
}
