import { useEffect, useState, type FormEvent } from "react";
import { Edit2, Image as ImageIcon, Plus, Save, Search, Trash2, Upload } from "lucide-react";
import { RESOURCE_FIELDS, RESOURCE_LABELS, blankResource, type ResourceKey, type Row } from "./shared";
import { PaginationControls, Panel, safeJson, usePagedRows } from "./common";

export function ResourceManager({
  resource,
  rows,
  query,
  setQuery,
  draft,
  setDraft,
  selected,
  setSelected,
  onSubmit,
  onDelete,
  onImageUpload,
  saving,
}: {
  resource: ResourceKey;
  rows: Row[];
  query: string;
  setQuery: (query: string) => void;
  draft: Row;
  setDraft: (draft: Row) => void;
  selected: Row | null;
  setSelected: (row: Row | null) => void;
  onSubmit: (event: FormEvent) => void;
  onDelete: (row: Row) => void;
  onImageUpload?: (file: File) => Promise<string>;
  saving: boolean;
}) {
  const meta = RESOURCE_LABELS[resource];
  const Icon = meta.icon;
  const { page, totalPages, shownRows, setPage } = usePagedRows(rows, 10);

  useEffect(() => {
    if (selected && !rows.some((row) => String(row.id) === String(selected.id))) {
      setSelected(null);
    }
  }, [rows, selected, setSelected]);

  return (
    <Panel title={meta.title} hint={meta.hint}>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="min-w-0 rounded-lg border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-blue-50 p-2 text-[#1a3a8f]"><Icon size={18} /></span>
              <div>
                <h3 className="font-bold">{meta.title} List</h3>
                <p className="text-xs text-slate-500">{rows.length} records shown</p>
              </div>
            </div>
            <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm md:w-72">
              <Search size={15} className="text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search records" className="w-full outline-none" />
            </label>
          </div>
          <div className="divide-y divide-slate-100">
            {shownRows.map((row) => (
              <ResourceRow key={row.id} resource={resource} row={row} active={selected?.id === row.id} onEdit={() => { setSelected(row); setDraft({ ...row }); }} onDelete={() => onDelete(row)} />
            ))}
            {!rows.length && <div className="p-8 text-center text-sm text-slate-400">No records found</div>}
          </div>
          <PaginationControls page={page} totalPages={totalPages} setPage={setPage} />
        </div>
        <ResourceForm resource={resource} draft={draft} setDraft={setDraft} onSubmit={onSubmit} onImageUpload={onImageUpload} saving={saving} />
      </div>
    </Panel>
  );
}

function ResourceRow({ resource, row, active, onEdit, onDelete }: { resource: ResourceKey; row: Row; active: boolean; onEdit: () => void; onDelete: () => void }) {
  const title = row.title || row.label || row.name || `${row.category || ""} ${row.subcategory || ""}` || "Untitled";
  const subtitle = resource === "services" ? row.service_id : resource === "events" ? row.date : resource === "venues" ? `${row.city || "-"}, ${row.state || "-"}` : `${row.category || "-"} / ${row.subcategory || "-"}`;
  const detail = resource === "services" ? `${safeJson(row.packages, []).length} packages` : resource === "events" ? row.venue : resource === "venues" ? row.address : row.price;

  return (
    <div className={`grid grid-cols-1 gap-3 px-4 py-4 lg:grid-cols-[minmax(180px,1.1fr)_minmax(180px,1fr)_130px_150px] lg:items-center ${active ? "bg-blue-50" : "bg-white"}`}>
      <div><p className="font-bold text-slate-900">{title}</p><p className="mt-1 text-xs text-slate-500">{subtitle}</p></div>
      <div className="text-sm text-slate-600"><p className="line-clamp-2">{detail || row.description || "-"}</p></div>
      <div className="text-xs text-slate-500">{row.updated_at || row.created_at || "-"}</div>
      <div className="flex gap-2 lg:justify-end">
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-bold text-[#1a3a8f]"><Edit2 size={12} /> Edit</button>
        <button type="button" onClick={onDelete} className="inline-flex items-center gap-1 rounded-md border border-red-100 px-3 py-1.5 text-xs font-bold text-red-600"><Trash2 size={12} /> Delete</button>
      </div>
    </div>
  );
}

function ResourceForm({
  resource,
  draft,
  setDraft,
  onSubmit,
  onImageUpload,
  saving,
}: {
  resource: ResourceKey;
  draft: Row;
  setDraft: (draft: Row) => void;
  onSubmit: (event: FormEvent) => void;
  onImageUpload?: (file: File) => Promise<string>;
  saving: boolean;
}) {
  const fields = RESOURCE_FIELDS[resource];
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");

  const handleImageUpload = async (file: File | undefined) => {
    if (!file || !onImageUpload) return;
    setUploadingImage(true);
    setImageError("");
    try {
      const url = await onImageUpload(file);
      setDraft({ ...draft, image: url });
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="h-fit rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold">{draft.id ? "Edit Selected" : "Add New"}</h3>
          <p className="text-xs text-slate-500">These fields control the matching website data.</p>
        </div>
        <button type="button" onClick={() => setDraft(blankResource(resource))} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600"><Plus size={13} className="inline" /> New</button>
      </div>
      <div className="space-y-3">
        {fields.map((field) => {
          const isLong = ["packages", "description", "about", "includes", "not_includes", "specialities", "address"].includes(field);
          if (resource === "venues" && field === "image") {
            return (
              <div key={field} className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">image</span>
                {draft.image ? (
                  <div className="mb-2 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                    <img src={String(draft.image)} alt="Venue preview" className="h-32 w-full object-cover" />
                  </div>
                ) : null}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm focus-within:border-[#1a3a8f]">
                    <ImageIcon size={15} className="text-slate-400" />
                    <input value={draft[field] ?? ""} onChange={(event) => setDraft({ ...draft, [field]: event.target.value })} placeholder="Paste image URL" className="w-full outline-none" />
                  </label>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm font-bold text-[#1a3a8f] hover:bg-blue-50">
                    <Upload size={15} />
                    {uploadingImage ? "Uploading..." : "Upload image file"}
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" disabled={uploadingImage || !onImageUpload} onChange={(event) => handleImageUpload(event.target.files?.[0])} />
                  </label>
                </div>
                <p className="mt-1 text-xs text-slate-400">Paste an external URL or upload JPG, PNG, WEBP, or GIF up to 5 MB.</p>
                {imageError ? <p className="mt-1 text-xs font-semibold text-red-600">{imageError}</p> : null}
              </div>
            );
          }

          return (
            <label key={field} className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">{field.replace(/_/g, " ")}</span>
              {isLong ? (
                <textarea value={draft[field] ?? ""} onChange={(event) => setDraft({ ...draft, [field]: event.target.value })} rows={field === "packages" ? 5 : 3} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-[#1a3a8f] focus:outline-none" />
              ) : (
                <input value={draft[field] ?? ""} onChange={(event) => setDraft({ ...draft, [field]: event.target.value })} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-[#1a3a8f] focus:outline-none" />
              )}
              {field === "packages" && <p className="mt-1 text-xs text-slate-400">Example: [{"{"}"label":"Standard","href":"/packages/service/standard"{"}"}]</p>}
            </label>
          );
        })}
      </div>
      <button disabled={saving} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#1a3a8f] px-4 py-3 text-sm font-bold text-white">
        <Save size={16} /> Save {RESOURCE_LABELS[resource].title}
      </button>
    </form>
  );
}
