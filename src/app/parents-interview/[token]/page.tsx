import type { Metadata } from "next";
import { ParentsInterviewPageClient } from "@/components/parents-interview/ParentsInterviewPageClient";

export const metadata: Metadata = {
  title: "Parents Interview Form | Ash-Shajrah Learning Hub",
  robots: {
    index: false,
    follow: false,
  },
};

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function ParentsInterviewPage({ params }: PageProps) {
  const { token } = await params;
  return <ParentsInterviewPageClient token={token} />;
}
