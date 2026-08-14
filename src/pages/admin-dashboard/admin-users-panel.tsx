import { useState, type FormEvent } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { type DashboardData, type Row } from "./shared";
import { PaginationControls, Panel, usePagedRows } from "./common";
import { TextInput } from "./users-report-settings";

export function AdminUsersPanel({ data, adminDraft, setAdminDraft, onSaveAdmin, onDeleteAdmin, saving }: {
  data: DashboardData | null;
  adminDraft: Row;
  setAdminDraft: (draft: Row) => void;
  onSaveAdmin: (event: FormEvent) => void;
  onDeleteAdmin: (row: Row) => void;
  saving: boolean;
}) {
  const [query, setQuery] = useState("");
  const filteredRows = (data?.adminUsers ?? []).filter((row) => JSON.stringify(row).toLowerCase().includes(query.toLowerCase()));
  const { page, totalPages, shownRows, setPage } = usePagedRows(filteredRows, 12);

  return (
    <Panel title="Admins" hint="Admin, sub-admin, and editor accounts are kept separate from normal website users.">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_420px]">
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-bold">Admin Access List</h3>
              <p className="text-xs text-slate-500">{filteredRows.length} admin accounts found</p>
            </div>
            <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm md:w-80">
              <Search size={15} className="text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search admins" className="w-full outline-none" />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
            {shownRows.map((admin) => (
              <AdminCard key={admin.id} admin={admin} onEdit={() => setAdminDraft({ ...admin, password: "" })} onDelete={() => onDeleteAdmin(admin)} />
            ))}
            {!filteredRows.length && <p className="p-8 text-center text-sm text-slate-400 md:col-span-2">No admin accounts found</p>}
          </div>
          <PaginationControls page={page} totalPages={totalPages} setPage={setPage} />
        </div>
        <AdminAccessForm adminDraft={adminDraft} setAdminDraft={setAdminDraft} onSaveAdmin={onSaveAdmin} saving={saving} />
      </div>
    </Panel>
  );
}

function AdminCard({ admin, onEdit, onDelete }: { admin: Row; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="font-bold">{admin.name || "Unnamed admin"}</p>
      <p className="text-sm text-slate-500">{admin.email}</p>
      <p className="mt-1 text-xs text-slate-500">{admin.phone || "No phone"}{admin.company ? ` - ${admin.company}` : ""}</p>
      <p className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-1 text-xs font-bold capitalize text-slate-600">{admin.role}</p>
      <p className="mt-3 text-xs text-slate-400">Created {admin.created_at || "-"}</p>
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={onEdit} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-bold text-[#1a3a8f]">Edit</button>
        <button type="button" onClick={onDelete} className="rounded-md border border-red-100 px-3 py-1.5 text-xs font-bold text-red-600">Remove</button>
      </div>
    </div>
  );
}

function AdminAccessForm({ adminDraft, setAdminDraft, onSaveAdmin, saving }: {
  adminDraft: Row;
  setAdminDraft: (draft: Row) => void;
  onSaveAdmin: (event: FormEvent) => void;
  saving: boolean;
}) {
  return (
    <form onSubmit={onSaveAdmin} className="h-fit rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="font-bold">{adminDraft.id ? "Edit Admin Access" : "Add Admin / Sub-admin"}</h3>
      <div className="mt-4 space-y-3">
        {["name", "email", "phone", "company"].map((field) => <TextInput key={field} label={field} value={adminDraft[field] || ""} onChange={(value) => setAdminDraft({ ...adminDraft, [field]: value })} />)}
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase text-slate-500">Role</span>
          <select value={adminDraft.role || "editor"} onChange={(event) => setAdminDraft({ ...adminDraft, role: event.target.value })} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm">
            <option value="admin">Admin</option>
            <option value="sub-admin">Sub-admin</option>
            <option value="editor">Editor</option>
          </select>
        </label>
        <TextInput label={adminDraft.id ? "New password (optional)" : "Password"} value={adminDraft.password || ""} onChange={(value) => setAdminDraft({ ...adminDraft, password: value })} type="password" />
      </div>
      <button disabled={saving} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#1a3a8f] px-4 py-3 text-sm font-bold text-white"><ShieldCheck size={16} /> Save Access</button>
    </form>
  );
}
