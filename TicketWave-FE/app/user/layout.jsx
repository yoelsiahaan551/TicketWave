"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import UserNavbar from "@/app/components/user/UserNavbar";
import UserFooter from "@/app/components/user/UserFooter";
import UserBottomNav from "@/app/components/user/UserBottomNav";
import { Loader2 } from "lucide-react";

export default function UserLayout({ children }) {
  const { user, isAuthenticated, loading, isOfficer } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    // Jika pengguna login sebagai Officer, arahkan ke portal Officer
    if (isAuthenticated && (isOfficer || user?.role === 'officer')) {
      router.replace("/officer");
    }
  }, [loading, isAuthenticated, isOfficer, user, router]);

  // Jika teridentifikasi sebagai Officer, sembunyikan tampilan User
  if (isAuthenticated && (isOfficer || user?.role === 'officer')) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center text-slate-100">
        <Loader2 className="h-7 w-7 animate-spin text-[#0080f2]" />
        <p className="mt-3 text-xs font-medium text-slate-400">
          Mengarahkan ke Portal Petugas (Officer)...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <UserNavbar />
      <main className="flex-1 w-full max-w-full min-w-0 pb-16 md:pb-0">{children}</main>
      <UserFooter />
      <UserBottomNav />
    </div>
  );
}
