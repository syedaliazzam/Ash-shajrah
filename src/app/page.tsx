import { Metadata } from "next";
import { HomePageContent } from "@/components/pages/HomePageContent";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";

export const metadata: Metadata = {
  title: "Ash-Shajrah Learning Hub (ALH) | Online Learning, Character & Leadership",
  description:
    "Ash-Shajrah Learning Hub (ALH) is an online early years learning hub focused on Play Group, Prep-I, Prep-II, parent partnership, Islamic values, character building, and home-based learning support.",
};

export default function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <HomePageContent />
    </>
  );
}
