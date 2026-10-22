import { Metadata } from "next";
import { HomePageContent } from "@/components/pages/HomePageContent";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import { listPublicEventsFromDb } from "@/lib/public-events-db";
import { listMonthlyPlansFromDb } from "@/lib/monthly-plans";

export const revalidate = 60;

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
  const [events, monthlyPlans] = await Promise.all([
    withTimeout(
      listPublicEventsFromDb().catch(() => ({
        currentUpcoming: [],
        past: [],
      })),
      3000,
      { currentUpcoming: [], past: [] }
    ),
    withTimeout(
      listMonthlyPlansFromDb().catch((err) => {
        console.error("Monthly plans fetch error:", err);
        return null;
      }),
      3500,
      null
    ),
  ]);

  const nearestUpcoming =
    events.currentUpcoming.find((item) => item.lifecycle === "upcoming") || null;

  return (
    <>
      <OrganizationJsonLd />
      <HomePageContent
        initialUpcomingEvent={nearestUpcoming}
        initialMonthlyPlans={monthlyPlans}
      />
    </>
  );
}
