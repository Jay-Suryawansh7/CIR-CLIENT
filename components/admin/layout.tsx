import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { sessionClaims } = await auth();

  if (sessionClaims?.metadata?.role !== "admin") {
    redirect("/"); // failsafe in case middleware skipped
  }

  return <>{children}</>;
}
