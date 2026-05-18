import type { FieldConfig, RoleFields } from "./config";
import { roleFieldConfig } from "./config";

type Props = {
  role: string;
  roleLabel: string;
  values: RoleFields;
  onChange: (key: string, value: string) => void;
  onToggle: (key: string, value: string) => void;
};

export function RoleSpecificFields({ role, roleLabel, values, onChange, onToggle }: Props) {
  const fields = roleFieldConfig[role] || [];
  if (!fields.length) return null;

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
      <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900">
        <StepNumber value={2} />
        {roleLabel} - Specific Details
      </h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {fields.map((field) => (
          <RoleField key={field.key} field={field} values={values} onChange={onChange} onToggle={onToggle} />
        ))}
      </div>
    </section>
  );
}

function RoleField({ field, values, onChange, onToggle }: { field: FieldConfig } & Omit<Props, "role" | "roleLabel">) {
  const value = values[field.key];

  if (field.type === "multi") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <label className="block sm:col-span-2">
        <FieldLabel field={field} />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {(field.options || []).map((option) => {
            const active = selected.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => onToggle(field.key, option)}
                className={`rounded-lg border px-3 py-2.5 text-left text-sm transition-all ${active ? "border-[#1a3a8f] bg-blue-50 text-[#1a3a8f]" : "border-gray-200 text-gray-600 hover:border-blue-300"}`}
              >
                <span className={`mr-2 inline-flex h-4 w-4 items-center justify-center rounded border text-[10px] ${active ? "border-[#1a3a8f] bg-[#1a3a8f] text-white" : "border-gray-300"}`}>
                  {active ? "✓" : ""}
                </span>
                {option}
              </button>
            );
          })}
        </div>
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <label className="block sm:col-span-2">
        <FieldLabel field={field} />
        <textarea
          rows={3}
          required={field.required}
          placeholder={field.placeholder}
          value={(value as string) || ""}
          onChange={(event) => onChange(field.key, event.target.value)}
          className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#1a3a8f] focus:outline-none"
        />
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label className="block">
        <FieldLabel field={field} />
        <select
          required={field.required}
          value={(value as string) || ""}
          onChange={(event) => onChange(field.key, event.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#1a3a8f] focus:outline-none"
        >
          <option value="">Select</option>
          {(field.options || []).map((option) => <option key={option}>{option}</option>)}
        </select>
      </label>
    );
  }

  return (
    <label className="block">
      <FieldLabel field={field} />
      <input
        required={field.required}
        placeholder={field.placeholder}
        value={(value as string) || ""}
        onChange={(event) => onChange(field.key, event.target.value)}
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#1a3a8f] focus:outline-none"
      />
    </label>
  );
}

function FieldLabel({ field }: { field: FieldConfig }) {
  return (
    <span className="mb-1.5 block text-sm font-semibold text-gray-700">
      {field.label} {field.required ? <span className="text-red-500">*</span> : null}
    </span>
  );
}

export function StepNumber({ value }: { value: number }) {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a3a8f] text-sm font-bold text-white">
      {value}
    </span>
  );
}
