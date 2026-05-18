import { useEffect, useState } from "react";
import { Bell, CalendarDays, CheckCircle2, ClipboardList, Save, ShieldCheck, Users } from "lucide-react";
import { PAGE_GROUPS, type DashboardData, type Row } from "./shared";
import { Panel } from "./common";


export function Overview({ data, onNavigate }: { data: DashboardData | null; onNavigate?: (tab: string) => void }) {
  const metrics = [
    { label: "Service Requirements", value: data?.inquiries?.length ?? 0, icon: ClipboardList, tab: "requirements" },
    { label: "Manpower Applications", value: data?.manpower?.length ?? 0, icon: Users, tab: "requirements" },
    { label: "Registered Users", value: data?.users?.length ?? 0, icon: Users, tab: "users" },
    { label: "Events", value: data?.events?.length ?? 0, icon: CalendarDays, tab: "events" },
    { label: "Admin Users", value: data?.adminUsers?.length ?? 0, icon: ShieldCheck, tab: "admins" },
  ];
  return (
    <Panel title="Overview" hint="Important website controls are grouped here. Use the left menu to open a specific area.">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {metrics.map((metric) => (
          <button key={metric.label} type="button" onClick={() => onNavigate?.(metric.tab)} className="rounded-lg border border-slate-200 bg-white p-5 text-left transition hover:border-[#1a3a8f] hover:shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{metric.label}</p>
              <metric.icon size={18} className="text-[#1a3a8f]" />
            </div>
            <p className="mt-3 text-3xl font-bold">{metric.value}</p>
          </button>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <InfoCard title="Edit Website Text" text="Open Page Content, choose a page, edit the field, and save. No JSON is required." />
        <InfoCard title="Manage Services" text="Services and packages are separate sections. Select a card to edit details clearly." />
        <InfoCard title="Handle Leads" text="Requirements are shown as cards with status, reply, and delete actions. No horizontal table scrolling." />
      </div>
      <div className="mt-5 rounded-lg border border-amber-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 font-bold"><Bell size={17} className="text-amber-600" /> Notifications</h3>
            <p className="text-sm text-slate-500">Latest signups, enquiries, applications, and bookings.</p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">{data?.unreadNotifications ?? 0} new</span>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {(data?.notifications ?? []).slice(0, 6).map((item) => (
            <div key={item.id} className="rounded-md border border-slate-100 bg-slate-50 p-3">
              <p className="text-sm font-bold text-slate-800">{item.title}</p>
              <p className="mt-1 text-sm text-slate-600">{item.message}</p>
              <p className="mt-2 text-xs text-slate-400">{item.created_at || "Just now"}</p>
            </div>
          ))}
          {!data?.notifications?.length && <p className="text-sm text-slate-400">No new notifications yet.</p>}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={() => onNavigate?.("notifications")} className="rounded-md bg-[#1a3a8f] px-4 py-2 text-sm font-bold text-white">Open Notifications</button>
        <button type="button" onClick={() => onNavigate?.("users")} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">Manage Users</button>
        <button type="button" onClick={() => onNavigate?.("venues")} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">Manage Venues</button>
      </div>
    </Panel>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <CheckCircle2 size={18} className="text-emerald-600" />
      <h3 className="mt-3 font-bold">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
    </div>
  );
}

export function EditableField({ label, value, placeholder, onSave }: { label: string; value: string; placeholder: string; onSave: (value: string) => void }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-sm font-bold capitalize text-slate-700">{label}</label>
        <button type="button" onClick={() => onSave(draft)} className="inline-flex items-center gap-1 rounded-md bg-[#1a3a8f] px-3 py-1.5 text-xs font-bold text-white">
          <Save size={13} /> Save
        </button>
      </div>
      <textarea value={draft} placeholder={placeholder} onChange={(event) => setDraft(event.target.value)} rows={Math.max(2, Math.min(5, Math.ceil((draft || "").length / 90)))} className="w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-[#1a3a8f] focus:outline-none" />
      <p className="mt-2 text-xs text-slate-400">Current saved value is shown above. Empty field means it has not been added yet.</p>
    </div>
  );
}

export function PageContentPanel({ activePage, setActivePage, contentMap, onSaveField }: { activePage: string; setActivePage: (page: string) => void; contentMap: Row; onSaveField: (key: string, value: string) => void }) {
  const activePageGroup = PAGE_GROUPS.find((group) => group.id === activePage) ?? PAGE_GROUPS[0];
  return (
    <Panel title="Page Content" hint="Choose a page first, then edit only that page's fields. Content is grouped to stay easy to manage.">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          {PAGE_GROUPS.map((group) => (
            <button key={group.id} onClick={() => setActivePage(group.id)} className={`w-full rounded-lg border p-4 text-left ${activePage === group.id ? "border-[#1a3a8f] bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
              <p className="font-bold">{group.title}</p>
              <p className="mt-1 text-xs text-slate-500">{group.hint}</p>
            </button>
          ))}
        </div>
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="font-bold">{activePageGroup.title}</h3>
            <p className="text-sm text-slate-500">{activePageGroup.hint}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 p-5">
            {activePageGroup.keys.map((key) => (
              <EditableField key={key} label={key.split(".").slice(1).join(" / ")} value={contentMap[key]?.value || ""} placeholder="Not added yet" onSave={(value) => onSaveField(key, value)} />
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}
