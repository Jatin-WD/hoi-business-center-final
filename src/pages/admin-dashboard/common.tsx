import { useEffect, useState, type ReactNode } from "react";
import { X, type LucideIcon } from "lucide-react";

export function NavButton({ icon: Icon, label, active, onClick }: { icon: LucideIcon; label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`mb-1 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold ${active ? "bg-[#1a3a8f] text-white" : "text-slate-600 hover:bg-slate-50"}`}>
      <Icon size={16} /> {label}
    </button>
  );
}

export function Panel({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm text-slate-500">{hint}</p>
      </div>
      {children}
    </section>
  );
}

export function LoadingState({ title = "Loading", message = "Please wait while we fetch the latest data." }: { title?: string; message?: string }) {
  return (
    <div className="min-h-screen bg-slate-50 px-8 py-16 text-slate-600">
      <div className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-4 h-2 w-32 overflow-hidden rounded-full bg-slate-100">
          <span className="block h-full w-1/2 animate-pulse rounded-full bg-[#1a3a8f]" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">{message}</p>
      </div>
    </div>
  );
}

export function ErrorState({ title, message, primaryLabel, onPrimary, secondaryHref }: { title: string; message: string; primaryLabel: string; onPrimary: () => void; secondaryHref?: string }) {
  return (
    <div className="min-h-screen bg-slate-50 px-8 py-16">
      <div className="mx-auto max-w-xl rounded-lg border border-red-100 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">{message}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={onPrimary} className="rounded-md bg-[#1a3a8f] px-5 py-3 text-sm font-semibold text-white">{primaryLabel}</button>
          {secondaryHref ? <a href={secondaryHref} className="rounded-md border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">Go to Login</a> : null}
        </div>
      </div>
    </div>
  );
}

export function InlineFeedback({ message, type, onClose }: { message: string; type: "error" | "success"; onClose?: () => void }) {
  useEffect(() => {
    if (!onClose) return;
    const timer = window.setTimeout(onClose, type === "success" ? 3500 : 7000);
    return () => window.clearTimeout(timer);
  }, [message, onClose, type]);

  return (
    <div className={`mb-5 flex items-center justify-between gap-3 rounded-md border px-4 py-3 text-sm ${type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
      <span>{message}</span>
      {onClose ? <button type="button" onClick={onClose} className="rounded p-1 opacity-70 hover:opacity-100" aria-label="Dismiss message"><X size={16} /></button> : null}
    </div>
  );
}

export function usePagedRows<T>(rows: T[], pageSize = 12) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(safeRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  useEffect(() => setPage(1), [safeRows.length, pageSize]);
  return {
    page: safePage,
    totalPages,
    shownRows: safeRows.slice((safePage - 1) * pageSize, safePage * pageSize),
    setPage,
  };
}

export function PaginationControls({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (page: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm">
      <button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-md border border-slate-200 px-3 py-1.5 font-semibold disabled:opacity-40">Previous</button>
      <span className="text-slate-500">Page {page} of {totalPages}</span>
      <button type="button" disabled={page === totalPages} onClick={() => setPage(page + 1)} className="rounded-md border border-slate-200 px-3 py-1.5 font-semibold disabled:opacity-40">Next</button>
    </div>
  );
}

export function safeJson(value: string | undefined, fallback: any[]) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}
