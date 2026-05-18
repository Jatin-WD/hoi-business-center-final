import type { ChangeEvent, InputHTMLAttributes, RefObject, SelectHTMLAttributes } from "react";
import { CheckCircle, Upload } from "lucide-react";
import { StepNumber } from "./RoleSpecificFields";

export type ManpowerFormState = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  dob: string;
  totalExp: string;
  availFrom: string;
  availTo: string;
  prevExhibition: "yes" | "no";
  notes: string;
};

type ChangeHandler = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;

export function PersonalDetails({ form, errors, onChange }: { form: ManpowerFormState; errors: Record<string, string>; onChange: ChangeHandler }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
      <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900"><StepNumber value={3} /> Personal & Contact Details</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextField label="Full Name" name="fullName" value={form.fullName} onChange={onChange} error={errors.fullName} required />
        <TextField label="Email Address" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} required />
        <TextField label="Phone Number" name="phone" type="tel" value={form.phone} onChange={onChange} error={errors.phone} required />
        <TextField label="Current City / Location" name="city" value={form.city} onChange={onChange} error={errors.city} required />
        <TextField label="Date of Birth" name="dob" type="date" value={form.dob} onChange={onChange} />
        <SelectField label="Total Experience" name="totalExp" value={form.totalExp} onChange={onChange} options={["", "Less than 1 year", "1-2 years", "3-5 years", "6-10 years", "10+ years"]} />
        <TextField label="Available From" name="availFrom" type="date" value={form.availFrom} onChange={onChange} />
        <TextField label="Available Until" name="availTo" type="date" value={form.availTo} onChange={onChange} />
        <SelectField label="Previously worked at exhibitions or trade fairs?" name="prevExhibition" value={form.prevExhibition} onChange={onChange} options={["yes", "no"]} />
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-semibold text-gray-700">Additional skills / notes</span>
          <textarea name="notes" value={form.notes} onChange={onChange} rows={4} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#1a3a8f] focus:outline-none" />
        </label>
      </div>
    </section>
  );
}

export function CvUpload({ fileRef, cv, onChange }: { fileRef: RefObject<HTMLInputElement>; cv: File | null; onChange: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
      <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-gray-900"><StepNumber value={4} /> Attach Your CV / Resume <span className="text-red-500">*</span></h2>
      <button type="button" onClick={() => fileRef.current?.click()} className={`w-full rounded-2xl border-2 border-dashed p-8 text-center ${cv ? "border-green-400 bg-green-50 text-green-700" : "border-gray-300 text-gray-500 hover:border-[#1a3a8f]"}`}>
        {cv ? <CheckCircle className="mx-auto mb-2" /> : <Upload className="mx-auto mb-2" />}
        {cv ? cv.name : "Click to upload PDF, DOC, or DOCX under 5 MB"}
      </button>
      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={onChange} />
    </section>
  );
}

function TextField({ label, error, ...props }: { label: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return <label className="block"><span className="mb-1.5 block text-sm font-semibold text-gray-700">{label}{props.required ? " *" : ""}</span><input {...props} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#1a3a8f] focus:outline-none" />{error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}</label>;
}

function SelectField({ label, options, ...props }: { label: string; options: string[] } & SelectHTMLAttributes<HTMLSelectElement>) {
  return <label className="block"><span className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</span><select {...props} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#1a3a8f] focus:outline-none">{options.map((option) => <option key={option} value={option}>{option ? option === "yes" ? "Yes" : option === "no" ? "No" : option : "Select"}</option>)}</select></label>;
}
