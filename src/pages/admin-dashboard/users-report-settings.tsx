import { type FormEvent, useState } from "react";
import { KeyRound, Search } from "lucide-react";
import { type DashboardData, type Row } from "./shared";
import { PaginationControls, Panel, usePagedRows } from "./common";


export function UsersPanel({ rows, onAction }: { rows: Row[]; onAction: (id: string | number, action: "suspend" | "activate" | "delete") => void }) {
  const [query, setQuery] = useState("");
  const userRows = rows.filter((row) => !["admin", "sub-admin", "editor"].includes(String(row.role || "user").toLowerCase()));
  const filteredRows = userRows.filter((row) => JSON.stringify(row).toLowerCase().includes(query.toLowerCase()));
  const { page, totalPages, shownRows, setPage } = usePagedRows(filteredRows, 12);
  return (
    <Panel title="Users" hint="Registered website users only. Admin, sub-admin, and editor accounts are listed in the Admins tab.">
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-bold">Registered Users</h3>
            <p className="text-xs text-slate-500">{filteredRows.length} users found</p>
          </div>
          <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm md:w-80">
            <Search size={15} className="text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users" className="w-full outline-none" />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Phone / Company</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shownRows.map((user) => {
                const suspended = String(user.status || "active") === "suspended";
                return (
                  <tr key={user.id} className="bg-white">
                    <td className="px-4 py-3"><p className="font-bold">{user.name || "Unnamed user"}</p><p className="text-slate-500">{user.email}</p></td>
                    <td className="px-4 py-3 text-slate-600">{user.phone || "No phone"}{user.company ? <p className="text-xs text-slate-400">{user.company}</p> : null}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-bold capitalize ${suspended ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{user.status || "active"}</span></td>
                    <td className="px-4 py-3 text-slate-500">{user.created_at || "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => onAction(user.id, suspended ? "activate" : "suspend")} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-bold text-[#1a3a8f]">{suspended ? "Activate" : "Suspend"}</button>
                        <button type="button" onClick={() => onAction(user.id, "delete")} className="rounded-md border border-red-100 px-3 py-1.5 text-xs font-bold text-red-600">Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!filteredRows.length && <p className="p-8 text-center text-sm text-slate-400">No users found</p>}
        </div>
        <PaginationControls page={page} totalPages={totalPages} setPage={setPage} />
      </div>
    </Panel>
  );
}

export function SettingsPanel({ data, passwordDraft, setPasswordDraft, onChangePassword, saving }: {
  data: DashboardData | null;
  passwordDraft: Row;
  setPasswordDraft: (draft: Row) => void;
  onChangePassword: (event: FormEvent) => void;
  saving: boolean;
}) {
  return (
    <Panel title="Admin Settings" hint="Current admin session and password settings. Admin access management is now in the Admins tab.">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_420px]">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="font-bold">Current Admin</h3>
          <div className="mt-4 rounded-lg bg-slate-50 p-4">
            <p className="font-bold">{data?.admin?.email || "Admin"}</p>
            <p className="mt-1 text-sm capitalize text-slate-500">{data?.admin?.role || "admin"}</p>
          </div>
        </div>

        <form onSubmit={onChangePassword} className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="font-bold">Change My Password</h3>
          <p className="mt-2 text-sm text-slate-500">Firebase Auth updates the password for the current signed-in admin session.</p>
          <div className="mt-4 space-y-3">
            <TextInput label="New password" value={passwordDraft.newPassword || ""} onChange={(value) => setPasswordDraft({ ...passwordDraft, newPassword: value })} type="password" />
            <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-3 text-sm font-bold"><KeyRound size={16} /> Change Password</button>
          </div>
        </form>
      </div>
    </Panel>
  );
}

export function TextInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase text-slate-500">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
    </label>
  );
}
