import type { Metadata } from "next";
import { CareersPageContent } from "@/components/pages/CareersPageContent";

export const metadata: Metadata = {
  title: "Careers | Ash-Shajrah Learning Hub",
  description:
    "No open positions right now — submit your resume for future opportunities at Ash-Shajrah Learning Hub.",
};

export default function CareersPage() {
  return <CareersPageContent />;
}
