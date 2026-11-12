import UserNavbar from "@/app/components/user/UserNavbar";
import UserFooter from "@/app/components/user/UserFooter";

export default function UserLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <UserNavbar />
      <main className="flex-1">{children}</main>
      <UserFooter />
    </div>
  );
}
