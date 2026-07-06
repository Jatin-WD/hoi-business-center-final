import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { apiClient } from "@/lib/api-client";

type Row = Record<string, any>;

export default function AdminRequirementsPage() {
  const [, setLocation] = useLocation();
  const [data, setData] = useState<{ inquiries: Row[]; manpower: Row[]; bookings: Row[]; counts: Row } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("hoi_admin_token");
    if (!token) return setLocation("/admin-login");
    apiClient.getAdminRequirements(token)
      .then((response) => setData(response.data))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load requirements"));
  }, [setLocation]);

  const logout = () => {
    localStorage.removeItem("hoi_admin_token");
    setLocation("/admin-login");
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-3xl font-bold text-gray-900">Requirements</h1><p className="text-sm text-gray-500">Inquiries, manpower applications, and bookings from the database.</p></div>
          <button onClick={logout} className="rounded-lg border border-[#1a3a8f] px-4 py-2 text-sm font-semibold text-[#1a3a8f]">Logout</button>
        </div>
        {error ? <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
        {!data && !error ? <div className="rounded-xl bg-white p-6 text-sm text-gray-500">Loading requirements...</div> : null}
        {data ? <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3"><Metric label="Inquiries" value={data.counts.inquiries} /><Metric label="Manpower" value={data.counts.manpower} /><Metric label="Bookings" value={data.counts.bookings} /></div>
          <Section title="Inquiries" rows={data.inquiries} fields={["name", "email", "phone", "service", "location", "message", "status", "created_at"]} />
          <Section title="Manpower Applications" rows={data.manpower} fields={["role", "name", "email", "phone", "company", "experience", "availability", "status", "created_at"]} />
          <Section title="Bookings" rows={data.bookings} fields={["user_id", "service_id", "package_id", "event_id", "notes", "status", "created_at"]} />
        </div> : null}
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border border-gray-100 bg-white p-5"><p className="text-sm text-gray-500">{label}</p><p className="mt-1 text-3xl font-bold text-[#1a3a8f]">{value}</p></div>;
}

function Section({ title, rows, fields }: { title: string; rows: Row[]; fields: string[] }) {
  return <section className="rounded-xl border border-gray-100 bg-white p-5"><h2 className="mb-4 text-xl font-bold text-gray-900">{title}</h2>{!rows.length ? <p className="text-sm text-gray-400">No records yet.</p> : null}<div className="space-y-3">{rows.map((row) => <article key={row.id} className="rounded-lg border border-gray-100 p-4 text-sm">{fields.map((field) => <p key={field} className="mb-1"><span className="font-semibold capitalize text-gray-700">{field.replace("_", " ")}:</span> <span className="text-gray-600">{format(row[field])}</span></p>)}</article>)}</div></section>;
}

function format(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  return value ? String(value) : "-";
}
