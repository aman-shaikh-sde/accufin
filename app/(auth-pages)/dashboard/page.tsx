// app/dashboard/page.tsx

"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import AdminDashboard from "./_components/admin/AdminDashboard";
import UserDashboard from "./_components/user/UserDashboard";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="min-h-screen bg-cyan-50" />;
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-cyan-50" />}>
      {session?.user?.isAdmin ? <AdminDashboard /> : <UserDashboard />}
    </Suspense>
  );
}