import { useEffect, useState } from "react";
import { Eye, Mail, Trash2 } from "lucide-react";
import { type DashboardData, type Row } from "./shared";
import { PaginationControls, Panel, usePagedRows } from "./common";
import { RequirementDetailModal } from "./requirement-detail-modal";

const REQUIREMENT_TABS = [
  { id: "inquiries", title: "Service Requirements", source: "inquiries" },
  { id: "manpower", title: "Manpower Applications", source: "manpower" },
  { id: "bookings", title: "Bookings", source: "bookings" },
];

export function RequirementsPanel({ data, replyDraft, setReplyDraft, onAction }: { data: DashboardData | null; replyDraft: Row; setReplyDraft: (draft: any) => void; onAction: (source: string, id: string | number, action: "delete" | "status" | "reply", value?: string) => void }) {
  const [activeTab, setActiveTab] = useState(REQUIREMENT_TABS[0].id);
  const isValidTab = REQUIREMENT_TABS.some((tab) => tab.id === activeTab);
  const current = REQUIREMENT_TABS.find((tab) => tab.id === activeTab) ?? REQUIREMENT_TABS[0];
  const rows = (data?.[current.id as keyof DashboardData] as Row[]) ?? [];
  useEffect(() => {
    if (!isValidTab) {
      setActiveTab(REQUIREMENT_TABS[0].id);
    }
  }, [isValidTab]);

  return (
    <Panel title="Requirements" hint="Each category is separated into tabs with pagination at the bottom.">
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap gap-2 border-b border-slate-200 p-4">
          {REQUIREMENT_TABS.map((tab) => {
            const count = ((data?.[tab.id as keyof DashboardData] as Row[]) ?? []).length;
            return (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`rounded-md px-4 py-2 text-sm font-bold ${activeTab === tab.id ? "bg-[#1a3a8f] text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                {tab.title} <span className="ml-1 opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
        <SubmissionList title={current.title} source={current.source} rows={rows} replyDraft={replyDraft} setReplyDraft={setReplyDraft} onAction={onAction} />
      </div>
    </Panel>
  );
}

export function NotificationsPanel({ data, onAction, onClear }: { data: DashboardData | null; onAction: (source: string, id: string | number, action: "delete" | "status" | "reply", value?: string) => void; onClear: (ids?: string[]) => void }) {
  const rows = data?.notifications ?? [];
  const [expanded, setExpanded] = useState("");
  const { page, totalPages, shownRows, setPage } = usePagedRows(rows, 12);
  return (
    <Panel title="Notifications" hint="Latest user signups, inquiries, manpower applications, and bookings. Use actions to move work forward.">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <p className="text-sm font-bold text-slate-700">{rows.length} notifications</p>
          <button type="button" disabled={!rows.length} onClick={() => onClear()} className="rounded-md border border-red-100 px-3 py-2 text-xs font-bold text-red-600 disabled:cursor-not-allowed disabled:opacity-40">Delete All Notifications</button>
        </div>
        <div className="divide-y divide-slate-100">
            {shownRows.map((item) => {
              const parts = String(item.id).split("-");
              const source = item.type === "inquiry" ? "inquiries" : item.type === "booking" ? "bookings" : item.type;
              const recordId = parts[1] || item.record_id || item.related_id || item.notification_id || item.id;
              const actionable = ["inquiries", "manpower", "bookings"].includes(source) && Boolean(String(recordId || "").trim());
              const open = expanded === item.id;
              return (
                <div key={item.id} className={open ? "bg-blue-50/40" : ""}>
                  <div className="grid grid-cols-1 gap-3 px-4 py-4 lg:grid-cols-[minmax(220px,1.5fr)_100px_110px_150px_310px] lg:items-center">
                    <div><p className="font-bold">{item.title}</p><p className="line-clamp-1 text-slate-500">{item.message}</p></div>
                    <div className="capitalize text-slate-600">{item.type}</div>
                    <div><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold capitalize text-slate-600">{item.status}</span></div>
                    <div className="text-slate-500">{item.created_at || "-"}</div>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <button type="button" onClick={() => setExpanded(open ? "" : item.id)} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600"><Eye size={12} /> {open ? "Hide" : "View"}</button>
                      {actionable ? <button type="button" onClick={() => onAction(source, recordId, "status", "reviewing")} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-bold text-[#1a3a8f]">Review</button> : null}
                      {actionable ? <button type="button" onClick={() => onAction(source, recordId, "status", "closed")} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600">Close</button> : null}
                      <button type="button" onClick={() => onClear([item.id])} className="inline-flex items-center gap-1 rounded-md border border-red-100 px-3 py-1.5 text-xs font-bold text-red-600"><Trash2 size={12} /> Remove</button>
                    </div>
                  </div>
                  {open ? <NotificationDetails item={item} /> : null}
                </div>
              );
            })}
        </div>
        {!rows.length && <p className="p-8 text-center text-sm text-slate-400">No notifications yet</p>}
        <PaginationControls page={page} totalPages={totalPages} setPage={setPage} />
      </div>
    </Panel>
  );
}

function NotificationDetails({ item }: { item: Row }) {
  return (
    <div className="mx-4 mb-4 rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h4 className="font-bold text-slate-900">{item.title}</h4>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold capitalize text-[#1a3a8f]">{item.type}</span>
      </div>
      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{item.message}</p>
      <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
        <DetailPill label="Status" value={item.status} />
        <DetailPill label="Date" value={item.created_at || "-"} />
        <DetailPill label="Notification ID" value={item.id} />
      </div>
    </div>
  );
}

function DetailPill({ label, value }: { label: string; value: unknown }) {
  return <div className="rounded-md bg-slate-50 p-3"><p className="text-xs font-bold uppercase text-slate-500">{label}</p><p className="mt-1 break-words text-slate-700">{String(value || "-")}</p></div>;
}

function SubmissionList({ title, source, rows, replyDraft, setReplyDraft, onAction }: { title: string; source: string; rows: Row[]; replyDraft: Row; setReplyDraft: (draft: any) => void; onAction: (source: string, id: string | number, action: "delete" | "status" | "reply", value?: string) => void }) {
  const [selectedRow, setSelectedRow] = useState<Row | null>(null);
  const { page, totalPages, shownRows, setPage } = usePagedRows(rows, 8);
  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="font-bold">{title}</h3>
        <p className="text-xs text-slate-500">{rows.length} records</p>
      </div>
      <div className="hidden grid-cols-[1.1fr_1.5fr_130px_130px_170px] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-500 xl:grid">
        <span>Person</span>
        <span>Requirement</span>
        <span>Date</span>
        <span>Status</span>
        <span className="text-right">Actions</span>
      </div>
      <div className="divide-y divide-slate-100">
        {shownRows.map((row) => {
          const isReplying = replyDraft.source === source && String(replyDraft.id) === String(row.id);
          return (
            <div key={row.id} className="px-4 py-3 hover:bg-slate-50/70">
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.1fr_1.5fr_130px_130px_170px] xl:items-center">
                <div className="min-w-0">
                  <p className="font-bold">{row.name || row.email || `Booking #${row.id}`}</p>
                  <p className="break-words text-xs text-slate-500">{row.email || row.phone}</p>
                </div>
                <div className="min-w-0 rounded-md bg-slate-50 p-3 text-sm text-slate-600 xl:bg-transparent xl:p-0">
                  <p className="font-semibold text-slate-700">{row.service || row.role || row.package_id || "General request"}</p>
                  {row.message && <p className="mt-1 line-clamp-2">{row.message}</p>}
                  {row.notes && <p className="mt-1 line-clamp-2">{row.notes}</p>}
                </div>
                <p className="text-xs text-slate-500">{row.created_at || "-"}</p>
                <select value={row.status || "pending"} onChange={(event) => onAction(source, row.id, "status", event.target.value)} className="w-full rounded-md border border-slate-200 px-2 py-2 text-xs">
                  {["pending", "reviewing", "approved", "rejected", "replied", "closed"].map((status) => <option key={status}>{status}</option>)}
                </select>
                <div className="flex flex-wrap gap-2 xl:justify-end">
                  <button type="button" onClick={() => setSelectedRow(row)} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700"><Eye size={12} /> Details</button>
                  <button type="button" onClick={() => setReplyDraft({ source, id: row.id, subject: "Reply from HOI Business Center", message: "" })} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-bold text-[#1a3a8f]"><Mail size={12} /> Reply</button>
                  <button type="button" onClick={() => onAction(source, row.id, "delete")} className="rounded-md border border-red-100 px-3 py-1.5 text-xs font-bold text-red-600">Delete</button>
                </div>
              </div>
              {isReplying && (
                <div className="mt-3 space-y-2 rounded-md bg-slate-50 p-3">
                  <input value={replyDraft.subject} onChange={(event) => setReplyDraft((prev: Row) => ({ ...prev, subject: event.target.value }))} className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs" />
                  <textarea value={replyDraft.message} onChange={(event) => setReplyDraft((prev: Row) => ({ ...prev, message: event.target.value }))} rows={3} placeholder="Reply message" className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs" />
                  <button type="button" onClick={() => onAction(source, row.id, "reply")} className="rounded-md bg-[#1a3a8f] px-3 py-2 text-xs font-bold text-white">Save Reply</button>
                </div>
              )}
            </div>
          );
        })}
        {!rows.length && <p className="p-8 text-center text-sm text-slate-400">No records yet</p>}
      </div>
      <PaginationControls page={page} totalPages={totalPages} setPage={setPage} />
      <RequirementDetailModal row={selectedRow} title={title} onClose={() => setSelectedRow(null)} />
    </>
  );
}
