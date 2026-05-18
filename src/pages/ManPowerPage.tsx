import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "wouter";
import { AlertCircle, CheckCircle, ChevronRight, FileText } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useCmsContent } from "@/hooks/useCmsContent";
import { manpowerCommonSchema } from "@/lib/validators";
import { RoleSpecificFields, StepNumber } from "./manpower/RoleSpecificFields";
import { CvUpload, PersonalDetails, type ManpowerFormState } from "./manpower/CommonSections";
import { defaultRoles, parseRoles, toPayloadLists, validateRoleFields, type RoleFields } from "./manpower/config";

const emptyForm: ManpowerFormState = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  dob: "",
  totalExp: "",
  availFrom: "",
  availTo: "",
  prevExhibition: "no",
  notes: "",
};

export default function ManPowerPage() {
  const cms = useCmsContent({ "manpower.roles": JSON.stringify(defaultRoles) });
  const roles = parseRoles(cms("manpower.roles"));
  const fileRef = useRef<HTMLInputElement>(null);
  const [role, setRole] = useState("");
  const [roleFields, setRoleFields] = useState<RoleFields>({});
  const [form, setForm] = useState<ManpowerFormState>(emptyForm);
  const [cv, setCv] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const selectedRole = roles.find((item) => item.id === role);

  const update = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleRoleChange = (nextRole: string) => {
    setRole(nextRole);
    setRoleFields({});
    setStatus("idle");
    setMessage("");
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type) || file.size > 5 * 1024 * 1024) {
      setStatus("error");
      setMessage("Upload a PDF, DOC, or DOCX file under 5 MB.");
      return;
    }
    setMessage("");
    setCv(file);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFieldErrors({});
    setMessage("");

    const roleError = role ? validateRoleFields(role, roleFields) : "Please select a role.";
    if (roleError || !cv) {
      setStatus("error");
      setMessage(roleError || "Please attach your CV / Resume.");
      return;
    }

    const result = manpowerCommonSchema.safeParse(form);
    if (!result.success) {
      setFieldErrors(Object.fromEntries(result.error.errors.map((error) => [error.path[0] as string, error.message])));
      setStatus("error");
      setMessage("Please correct the highlighted fields.");
      return;
    }

    const payload = toPayloadLists(roleFields);
    const formData = new FormData();
    formData.append("role", selectedRole?.label || role);
    formData.append("name", result.data.fullName);
    formData.append("email", result.data.email);
    formData.append("phone", result.data.phone);
    formData.append("city", result.data.city);
    formData.append("experience", result.data.totalExp || "");
    formData.append("availability", [result.data.availFrom, result.data.availTo].filter(Boolean).join(" to "));
    formData.append("previousExhibition", result.data.prevExhibition || "no");
    formData.append("languages", JSON.stringify(payload.languages));
    formData.append("industries", JSON.stringify(payload.industries));
    formData.append("tasks", JSON.stringify([
      ...payload.tasks,
      `City / Location: ${result.data.city}`,
      result.data.dob ? `Date of Birth: ${result.data.dob}` : "",
      `Previous Exhibition Work: ${form.prevExhibition === "yes" ? "Yes" : "No"}`,
      form.notes ? `Notes: ${form.notes}` : "",
    ].filter(Boolean)));
    formData.append("documents", cv);

    setStatus("submitting");
    try {
      await apiClient.submitManpowerRequest(formData);
      setStatus("success");
      setMessage("Application submitted successfully. Our team will contact you shortly.");
      setForm(emptyForm);
      setRole("");
      setRoleFields({});
      setCv(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Unable to submit your application.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6 px-4 py-10 lg:px-8">
        <section className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-gray-900"><StepNumber value={1} /> Select the Role You Are Applying For <span className="text-red-500">*</span></h2>
          <p className="mb-5 ml-9 text-sm text-gray-400">Choose one role. The next section will show fields for that role.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {roles.map((item) => (
              <button key={item.id} type="button" onClick={() => handleRoleChange(item.id)} className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition-all ${role === item.id ? "border-[#1a3a8f] bg-blue-50 text-[#1a3a8f]" : "border-gray-200 text-gray-600 hover:border-[#1a3a8f]"}`}>
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {role && (
          <RoleSpecificFields
            role={role}
            roleLabel={selectedRole?.label || role}
            values={roleFields}
            onChange={(key, value) => setRoleFields((prev) => ({ ...prev, [key]: value }))}
            onToggle={(key, value) => setRoleFields((prev) => {
              const current = Array.isArray(prev[key]) ? prev[key] as string[] : [];
              return { ...prev, [key]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value] };
            })}
          />
        )}

        {role && <PersonalDetails form={form} errors={fieldErrors} onChange={update} />}
        {role && <CvUpload fileRef={fileRef} cv={cv} onChange={handleFile} />}

        {message && <div className={`flex gap-3 rounded-xl border p-4 text-sm ${status === "success" ? "border-green-100 bg-green-50 text-green-700" : "border-red-100 bg-red-50 text-red-600"}`}>{status === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}{message}</div>}
        {role && (
          <button disabled={status === "submitting"} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1a3a8f] py-4 font-bold text-white transition-colors hover:bg-[#152e75] disabled:opacity-60">
            <FileText size={18} /> {status === "submitting" ? "Submitting Application..." : "Submit Application"}
          </button>
        )}
      </form>
    </div>
  );
}

function Hero() {
  return (
    <div className="bg-gradient-to-r from-[#0f2460] to-[#1a3a8f] px-8 py-16 text-white">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-4 flex items-center gap-2 text-sm text-blue-200">
          <Link href="/" className="hover:text-white">Home</Link>
          <ChevronRight size={14} />
          <span className="text-white">Apply for Man Power Service</span>
        </div>
        <h1 className="mb-3 text-4xl font-bold">Apply for Man Power Service</h1>
        <p className="max-w-2xl text-blue-200">Select your role, add the role-specific details, and upload your CV. All submissions are stored for admin review.</p>
      </div>
    </div>
  );
}
