import { Eye, EyeOff, UserPlus } from "lucide-react";
import type { SignUpValues } from "@/lib/validators";

type FieldErrors = Record<string, string>;

const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a8f] focus:border-transparent transition";

export function DetailsForm({
  form,
  fieldErrors,
  submitError,
  status,
  showPassword,
  onChange,
  onSubmit,
  onTogglePassword,
}: {
  form: SignUpValues;
  fieldErrors: FieldErrors;
  submitError: string;
  status: "idle" | "loading" | "error";
  showPassword: boolean;
  onChange: (key: keyof SignUpValues) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: React.FormEvent) => void;
  onTogglePassword: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <TextField label="Full Name" required value={form.name} onChange={onChange("name")} placeholder="Your full name" testId="input-name" error={fieldErrors.name} />
      <TextField label="Company / Organisation" value={form.company ?? ""} onChange={onChange("company")} placeholder="Company name (optional)" testId="input-company" />
      <TextField label="Email address" type="email" required value={form.email} onChange={onChange("email")} placeholder="you@company.com" testId="input-email" error={fieldErrors.email} />
      <TextField label="Phone Number" type="tel" required value={form.phone ?? ""} onChange={onChange("phone")} placeholder="+91 00000 00000" testId="input-phone" error={fieldErrors.phone} />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
        <div className="relative">
          <input type={showPassword ? "text" : "password"} required value={form.password} onChange={onChange("password")} className={`${inputClass} pr-11`} placeholder="Create a password" data-testid="input-password" />
          <button type="button" onClick={onTogglePassword} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {fieldErrors.password ? <p className="mt-2 text-sm text-red-600">{fieldErrors.password}</p> : null}
      </div>
      {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
      <SubmitButton loading={status === "loading"} label="Create Account" loadingLabel="Creating Account..." testId="btn-submit-signup" />
    </form>
  );
}

function TextField({ label, error, testId, ...inputProps }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; testId?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input {...inputProps} className={inputClass} data-testid={testId} />
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function SubmitButton({ loading, label, loadingLabel, testId }: { loading: boolean; label: string; loadingLabel: string; testId?: string }) {
  return (
    <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#1a3a8f] text-white py-3 rounded-xl font-semibold hover:bg-[#152e75] transition-colors mt-2 disabled:cursor-not-allowed disabled:opacity-60" data-testid={testId}>
      <UserPlus size={18} />
      {loading ? loadingLabel : label}
    </button>
  );
}
