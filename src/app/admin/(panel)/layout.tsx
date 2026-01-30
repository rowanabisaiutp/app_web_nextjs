import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken, getCookieName } from "@/lib/auth";
import { AdminSidebar } from "./AdminSidebar";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value;

  if (!token) {
    redirect("/admin/login?redirect=/admin");
  }

  const payload = await verifyToken(token);
  if (!payload) {
    redirect("/admin/login?redirect=/admin");
  }

  return (
    <div className="h-screen flex overflow-hidden bg-neutral-50 dark:bg-neutral-900">
      <AdminSidebar user={{ email: payload.email }} />
      <main className="flex-1 min-h-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
