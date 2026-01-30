"use client";

import { AuthProvider } from "@/contexts/AuthContext";

export function AdminAuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
