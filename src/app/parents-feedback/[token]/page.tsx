import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ token: string }>;
};

/** Legacy alias — redirects to the Parents Interview Form path. */
export default async function ParentsFeedbackRedirectPage({
  params,
}: PageProps) {
  const { token } = await params;
  redirect(`/parents-interview/${token}`);
}
