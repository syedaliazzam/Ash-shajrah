import { Metadata } from "next";
import { HomePageContent } from "@/components/pages/HomePageContent";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";

export const metadata: Metadata = {
  title: "Ash-Shajrah Learning Hub | Online Learning, Character & Leadership",
  description:
    "A values-based online early years learning hub for Play Group, Prep-I and Prep-II, combining guided online sessions, parent-supported home learning, Islamic values, creativity, and character development.",
};

export default function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <HomePageContent />
    </>
  );
}
