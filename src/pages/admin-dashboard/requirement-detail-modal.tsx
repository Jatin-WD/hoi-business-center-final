import { useEffect, type ReactNode } from "react";
import { CalendarDays, Mail, MapPin, PackageCheck, Phone, User, X } from "lucide-react";
import { type Row } from "./shared";

const HIDDEN_KEYS = ["password"];
const SUMMARY_KEYS = ["name", "email", "phone", "company", "service", "role", "package_id", "location", "status", "created_at"];

export function RequirementDetailModal({ row, title, onClose }: { row: Row | null; title: string; onClose: () => void }) {
  useEffect(() => {
    if (!row) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [row, onClose]);

  if (!row) return null;

  const summary = getSummary(row);
  const detailEntries = Object.entries(row).filter(([key]) => !HIDDEN_KEYS.includes(key));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/55 px-4 py-6" onMouseDown={onClose}>
      <div className="flex max-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-[#0f2460] to-[#1a3a8f] p-5 text-white">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-100">{title}</p>
            <h3 className="mt-1 text-2xl font-bold">{summary.heading}</h3>
            <p className="mt-1 text-sm text-blue-100">{summary.subheading}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-white p-2 text-[#1a3a8f] shadow-sm hover:bg-blue-50" aria-label="Close details">
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard icon={<User size={16} />} label="Customer" value={row.name || row.email || `Booking #${row.id}`} />
            <SummaryCard icon={<PackageCheck size={16} />} label="Requirement" value={row.service || row.role || row.package_id || "General request"} />
            <SummaryCard icon={<MapPin size={16} />} label="Location" value={row.location || row.city || row.venue || "-"} />
            <SummaryCard icon={<CalendarDays size={16} />} label="Status" value={row.status || "pending"} />
          </div>

          {(row.message || row.notes) && (
            <section className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#1a3a8f]">Submitted Message</p>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{row.message || row.notes}</p>
            </section>
          )}

          <section className="mt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="text-base font-bold text-slate-900">All Submitted Fields</h4>
              <p className="text-xs text-slate-500">{detailEntries.length} fields</p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {detailEntries.map(([key, value]) => (
                <FieldCard key={key} label={toLabel(key)} value={formatDetail(value)} muted={SUMMARY_KEYS.includes(key)} />
              ))}
            </div>
          </section>

          <section className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            <ContactLine icon={<Mail size={15} />} label="Email" value={row.email} />
            <ContactLine icon={<Phone size={15} />} label="Phone" value={row.phone} />
          </section>
        </div>
        <div className="flex justify-end border-t border-slate-200 bg-white p-4">
          <button type="button" onClick={onClose} className="rounded-lg bg-[#1a3a8f] px-5 py-2 text-sm font-bold text-white hover:bg-[#0f2460]">Close Details</button>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: ReactNode; label: string; value: unknown }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#1a3a8f] shadow-sm">{icon}</div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-slate-900">{formatDetail(value)}</p>
    </div>
  );
}

function FieldCard({ label, value, muted }: { label: string; value: string; muted: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${muted ? "border-slate-100 bg-slate-50" : "border-slate-200 bg-white"}`}>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}

function ContactLine({ icon, label, value }: { icon: ReactNode; label: string; value: unknown }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
      <span className="text-[#1a3a8f]">{icon}</span>
      <span className="font-bold">{label}</span>
      <span className="break-all">{formatDetail(value)}</span>
    </div>
  );
}

function getSummary(row: Row) {
  const heading = row.name || row.email || `Booking #${row.id}`;
  const requirement = row.service || row.role || row.package_id || "General request";
  const date = row.created_at ? `Submitted on ${row.created_at}` : "Submission details";
  return { heading, subheading: `${requirement} - ${date}` };
}

function toLabel(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDetail(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}
