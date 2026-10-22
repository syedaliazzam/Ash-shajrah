import { Metadata } from "next";
import { HomePageContent } from "@/components/pages/HomePageContent";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import { listPublicEventsFromDb } from "@/lib/public-events-db";
import { listMonthlyPlansFromDb } from "@/lib/monthly-plans";
import { listCurriculumEventsFromDb } from "@/lib/curriculum-events";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Ash-Shajrah Learning Hub (ALH) | Online Learning, Character & Leadership",
  description:
    "Ash-Shajrah Learning Hub (ALH) is an online early years learning hub focused on Play Group, Prep-I, Prep-II, parent partnership, Islamic values, character building, and home-based learning support.",
};

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export default async function HomePage() {
  const [events, monthlyPlans, curriculumEvents] = await Promise.all([
    withTimeout(
      listPublicEventsFromDb().catch(() => ({
        currentUpcoming: [],
        past: [],
      })),
      10000,
      { currentUpcoming: [], past: [] }
    ),
    withTimeout(
      listMonthlyPlansFromDb().catch((err) => {
        console.error("Monthly plans fetch error:", err);
        return null;
      }),
      10000,
      null
    ),
    withTimeout(
      listCurriculumEventsFromDb().catch((err) => {
        console.error("Curriculum events fetch error:", err);
        return [];
      }),
      10000,
      []
    ),
  ]);

  const nearestUpcoming =
    events.currentUpcoming.find((item) => item.lifecycle === "upcoming") || null;

  return (
    <>
      <OrganizationJsonLd />
      <HomePageContent
        initialUpcomingEvent={nearestUpcoming}
        initialPastEvents={events.past}
        initialMonthlyPlans={monthlyPlans}
        initialCurriculumEvents={curriculumEvents}
      />
    </>
  );
}
