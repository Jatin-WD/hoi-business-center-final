import { useEffect, useState } from "react";
import { Palette, Plus, Save } from "lucide-react";
import { DEFAULT_THEME, THEME_PRESETS, type Row } from "./shared";
import { PaginationControls, Panel, usePagedRows } from "./common";


export function ManpowerPanel({ rows, onSave }: { rows: Row[]; onSave: (roles: Row[]) => void }) {
  const [roles, setRoles] = useState<Row[]>(rows.length ? rows : [{ id: "", label: "", enabled: true }]);
  useEffect(() => setRoles(rows.length ? rows : [{ id: "", label: "", enabled: true }]), [JSON.stringify(rows)]);
  const update = (index: number, patch: Row) => setRoles((prev) => prev.map((role, roleIndex) => roleIndex === index ? { ...role, ...patch } : role));
  const pagedRoles = roles.map((role, index) => ({ ...role, index })) as Array<Row & { index: number }>;
  const { page, totalPages, shownRows, setPage } = usePagedRows<Row & { index: number }>(pagedRoles, 8);
  return (
    <Panel title="Apply for Manpower Service" hint="Control which roles are visible on the public application form. Disabled roles are hidden.">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="space-y-3">
          {shownRows.map((role) => (
            <div key={role.index} className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 p-3 md:grid-cols-[1fr_1.4fr_110px_80px]">
              <input value={role.id || ""} onChange={(event) => update(role.index, { id: event.target.value })} placeholder="role-id" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
              <input value={role.label || ""} onChange={(event) => update(role.index, { label: event.target.value })} placeholder="Display label" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={role.enabled !== false} onChange={(event) => update(role.index, { enabled: event.target.checked })} /> Visible</label>
              <button type="button" onClick={() => setRoles((prev) => prev.filter((_, roleIndex) => roleIndex !== role.index))} className="rounded-md border border-red-100 text-sm font-bold text-red-600">Delete</button>
            </div>
          ))}
        </div>
        <PaginationControls page={page} totalPages={totalPages} setPage={setPage} />
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={() => setRoles((prev) => [...prev, { id: "", label: "", enabled: true }])} className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2.5 text-sm font-bold"><Plus size={16} /> Add Role</button>
          <button type="button" onClick={() => onSave(roles)} className="inline-flex items-center gap-2 rounded-md bg-[#1a3a8f] px-4 py-2.5 text-sm font-bold text-white"><Save size={16} /> Save Form</button>
        </div>
      </div>
    </Panel>
  );
}

export function ThemePanel({ contentMap, onSave, saving }: { contentMap: Row; onSave: (theme: Row) => void; saving: boolean }) {
  const current = {
    primary: contentMap["theme.primary"]?.value || DEFAULT_THEME.primary,
    primaryDark: contentMap["theme.primaryDark"]?.value || DEFAULT_THEME.primaryDark,
    accent: contentMap["theme.accent"]?.value || DEFAULT_THEME.accent,
    accentText: contentMap["theme.accentText"]?.value || DEFAULT_THEME.accentText,
  };
  const [draft, setDraft] = useState(current);
  useEffect(() => setDraft(current), [current.primary, current.primaryDark, current.accent, current.accentText]);
  return (
    <Panel title="Theme" hint="Choose a preset or set exact colors. Each field explains where the color is used.">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="font-bold">Presets</h3>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            {THEME_PRESETS.map((preset) => (
              <button key={preset.name} type="button" onClick={() => setDraft(preset)} className="rounded-lg border border-slate-200 p-4 text-left hover:border-[#1a3a8f]">
                <div className="mb-3 flex gap-2">
                  <span className="h-7 w-7 rounded-full" style={{ background: preset.primary }} />
                  <span className="h-7 w-7 rounded-full" style={{ background: preset.primaryDark }} />
                  <span className="h-7 w-7 rounded-full" style={{ background: preset.accent }} />
                </div>
                <p className="font-bold">{preset.name}</p>
              </button>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <ColorInput label="Primary" hint="Buttons, active menu, main highlights" value={draft.primary} onChange={(value) => setDraft({ ...draft, primary: value })} />
            <ColorInput label="Dark Primary" hint="Hero gradients and dark bands" value={draft.primaryDark} onChange={(value) => setDraft({ ...draft, primaryDark: value })} />
            <ColorInput label="Accent" hint="Yellow CTA buttons and small dots" value={draft.accent} onChange={(value) => setDraft({ ...draft, accent: value })} />
            <ColorInput label="Accent Text" hint="Text over accent buttons" value={draft.accentText} onChange={(value) => setDraft({ ...draft, accentText: value })} />
          </div>
          <button disabled={saving} onClick={() => onSave(draft)} className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#1a3a8f] px-5 py-3 text-sm font-bold text-white"><Palette size={16} /> Save Theme</button>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="font-bold">Preview</h3>
          <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
            <div className="p-5 text-white" style={{ background: `linear-gradient(135deg, ${draft.primaryDark}, ${draft.primary})` }}>
              <p className="text-xs opacity-80">Hero area</p>
              <p className="mt-2 text-xl font-bold">Website Heading</p>
            </div>
            <div className="space-y-3 p-5">
              <button className="rounded-md px-4 py-2 text-sm font-bold" style={{ background: draft.primary, color: "#fff" }}>Primary Button</button>
              <button className="ml-2 rounded-md px-4 py-2 text-sm font-bold" style={{ background: draft.accent, color: draft.accentText }}>Accent Button</button>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function ColorInput({ label, hint, value, onChange }: { label: string; hint: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="rounded-lg border border-slate-200 p-4">
      <span className="font-bold">{label}</span>
      <span className="mt-1 block text-xs text-slate-500">{hint}</span>
      <div className="mt-3 flex items-center gap-3">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-14 rounded border border-slate-200" />
        <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
      </div>
    </label>
  );
}
