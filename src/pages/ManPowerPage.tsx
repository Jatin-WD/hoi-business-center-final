import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "wouter";
import { AlertCircle, CheckCircle, ChevronRight, FileText, Sparkles } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useSiteLanguage } from "@/hooks/useSiteLanguage";
import { translateSiteText } from "@/lib/site-translations";
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
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);
  const cms = useCmsContent({
    "manpower.hero.title": "Apply for Manpower",
    "manpower.hero.description": "Select your role, add the role-specific details, and upload your CV. All submissions are stored in the project database.",
  });
  const roles = parseRoles(JSON.stringify(defaultRoles));
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
      setMessage(t("manpower.fileError", "Upload a PDF, DOC, or DOCX file under 5 MB."));
      return;
    }
    setMessage("");
    setCv(file);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFieldErrors({});
    setMessage("");

    const roleError = role ? validateRoleFields(role, roleFields) : t("manpower.selectRole", "Please select a role.");
    if (roleError || !cv) {
      setStatus("error");
      setMessage(roleError || t("manpower.attachCv", "Please attach your CV / Resume."));
      return;
    }

    const result = manpowerCommonSchema.safeParse(form);
    if (!result.success) {
      setFieldErrors(Object.fromEntries(result.error.errors.map((error) => [error.path[0] as string, error.message])));
      setStatus("error");
      setMessage(t("manpower.correctFields", "Please correct the highlighted fields."));
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
      setMessage(t("manpower.success", "Application submitted successfully. Our team will contact you shortly."));
      setForm(emptyForm);
      setRole("");
      setRoleFields({});
      setCv(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : t("manpower.submitFailed", "Unable to submit your application."));
    }
  };

  return (
    <div className="min-h-screen bg-[#f5efe4]">
      <Hero title={cms("manpower.hero.title")} description={cms("manpower.hero.description")} />
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6 px-4 py-10 lg:px-8">
        <section className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-gray-900"><StepNumber value={1} /> {t("manpower.selectRoleTitle", "Select the Role You Are Applying For")} <span className="text-red-500">*</span></h2>
          <p className="mb-5 ml-9 text-sm text-gray-400">{t("manpower.selectRoleBody", "Choose one role. The next section will show fields for that role.")}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {roles.map((item) => (
                <button key={item.id} type="button" onClick={() => handleRoleChange(item.id)} className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition-all ${role === item.id ? "border-[#f97316] bg-orange-50 text-[#f97316]" : "border-gray-200 text-gray-600 hover:border-[#f97316]"}`}>
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
          <button disabled={status === "submitting"} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f97316] py-4 font-bold text-white transition-colors hover:bg-[#ea580c] disabled:opacity-60">
            <FileText size={18} /> {status === "submitting" ? t("manpower.submitting", "Submitting Application...") : t("manpower.submit", "Submit Application")}
          </button>
        )}
      </form>
    </div>
  );
}

function Hero({ title, description }: { title: string; description: string }) {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);
  return (
    <section className="relative overflow-hidden border-b border-black/5 text-white">
      <img
        src="/assets/yashobhoomi.png"
        alt="Yashobhoomi exhibition venue"
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading="eager"
        decoding="async"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,15,24,0.96)_0%,rgba(10,15,24,0.92)_36%,rgba(10,15,24,0.74)_60%,rgba(10,15,24,0.52)_74%,rgba(249,115,22,0.26)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_80%_24%,rgba(249,115,22,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_22%)]" />

      <div className="relative mx-auto grid max-w-[1600px] gap-10 px-6 py-14 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-20">
        <div className="max-w-3xl">
          <div className="mb-4 flex items-center gap-2 text-sm text-zinc-200">
            <Link href="/" className="hover:text-white">{t("nav.home", "Home")}</Link>
            <ChevronRight size={14} />
            <span className="text-white">{t("nav.applyForManpower", "Apply for Manpower")}</span>
          </div>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/78 backdrop-blur">
            <Sparkles size={14} />
            {t("common.publicInformationPortal", "Public information portal")}
          </p>
          <h1 className="mt-5 max-w-2xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
            {description}
          </p>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_24px_70px_rgba(17,17,17,0.18)]">
          <div className="relative min-h-[330px]">
            <img
              src="/assets/hoi-about-team.jpg"
              alt="HOI team at Yashobhoomi"
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              decoding="async"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,15,24,0.08)_0%,rgba(10,15,24,0.38)_42%,rgba(10,15,24,0.88)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(10,15,24,0.02)_0%,rgba(10,15,24,0.00)_42%,rgba(249,115,22,0.22)_100%)]" />
            <div className="absolute inset-0 flex items-end p-6">
              <div className="max-w-md rounded-[1.5rem] border border-white/12 bg-[linear-gradient(135deg,rgba(17,17,17,0.84),rgba(17,17,17,0.58),rgba(249,115,22,0.26))] p-5 text-white backdrop-blur-xl">
                <div className="mb-3 h-1.5 w-24 rounded-full bg-[linear-gradient(90deg,#f97316,rgba(255,255,255,0.12))]" />
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/72">
                  {t("common.publicInformationPortal", "Public information portal")}
                </p>
                <h2 className="mt-2 text-2xl font-black leading-tight">
                  {t("home.hero.focusTitle", "Official exhibition venue for every public service flow")}
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/82">
                  {t("home.hero.focusDesc", "The homepage stays centered on one venue so users do not have to decode multiple locations or mixed service models.")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
