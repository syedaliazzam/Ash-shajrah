import { LmsShell } from "@/components/lms/LmsShell";

export default function LmsLayout({ children }: { children: React.ReactNode }) {
  return <LmsShell>{children}</LmsShell>;
}
