import { Bell, CalendarDays, ClipboardList, FileText, LayoutDashboard, LogOut, Palette, Settings, ShieldCheck, Users } from "lucide-react";
import { type DashboardData } from "./shared";
import { NavButton } from "./common";


export function AdminHeader({ data, onLogout }: { data: DashboardData | null; onLogout: () => void }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-6 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#1a3a8f]">HOI Admin Panel</p>
          <h1 className="text-2xl font-bold">Website Manager</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 md:flex">
            <Bell size={15} />
            {data?.unreadNotifications ?? 0} new updates
          </div>
          <div className="hidden rounded-lg border border-slate-200 px-4 py-2 text-right text-sm sm:block">
            <p className="font-semibold">{data?.admin?.email}</p>
            <p className="text-xs capitalize text-slate-500">{data?.admin?.role || "admin"}</p>
          </div>
          <button type="button" onClick={onLogout} className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export function AdminSidebar({ active, setActive }: { active: string; setActive: (active: string) => void }) {
  return (
    <aside className="h-fit rounded-lg border border-slate-200 bg-white p-2">
      <NavButton icon={LayoutDashboard} label="Overview" active={active === "overview"} onClick={() => setActive("overview")} />
      <NavButton icon={Bell} label="Notifications" active={active === "notifications"} onClick={() => setActive("notifications")} />
      <NavButton icon={ClipboardList} label="Requirements" active={active === "requirements"} onClick={() => setActive("requirements")} />
      <NavButton icon={Users} label="Users" active={active === "users"} onClick={() => setActive("users")} />
      <NavButton icon={FileText} label="Page Content" active={active === "pages"} onClick={() => setActive("pages")} />
      <NavButton icon={Settings} label="Services" active={active === "services"} onClick={() => setActive("services")} />
      <NavButton icon={FileText} label="Packages" active={active === "packages"} onClick={() => setActive("packages")} />
      <NavButton icon={LayoutDashboard} label="Venues / Yashobhoomi" active={active === "venues"} onClick={() => setActive("venues")} />
      <NavButton icon={CalendarDays} label="Event Calendar" active={active === "events"} onClick={() => setActive("events")} />
      <NavButton icon={Users} label="Manpower Form" active={active === "manpower"} onClick={() => setActive("manpower")} />
      <NavButton icon={Palette} label="Theme" active={active === "theme"} onClick={() => setActive("theme")} />
      <NavButton icon={ShieldCheck} label="Admins" active={active === "admins"} onClick={() => setActive("admins")} />
      <NavButton icon={ShieldCheck} label="Admin Settings" active={active === "settings"} onClick={() => setActive("settings")} />
    </aside>
  );
}

