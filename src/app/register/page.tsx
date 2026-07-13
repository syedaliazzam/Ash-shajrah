import type { Metadata } from "next";
import { RegistrationPageContent } from "@/components/pages/RegistrationPageContent";

export const metadata: Metadata = {
  title: "Register | Ash-Shajrah Learning Hub (ALH)",
  description:
    "Register your child for Ash-Shajrah Learning Hub (ALH) online early years programs including Play Group, Prep-I and Prep-II with parent partnership and values-based learning.",
  alternates: {
    canonical: "/register",
  },
};

export default function RegisterPage() {
  return <RegistrationPageContent />;
}
