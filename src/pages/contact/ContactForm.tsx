import { CheckCircle } from "lucide-react";
import { type FormEvent } from "react";
import { type ContactValues } from "@/lib/validators";
import { useSiteLanguage } from "@/hooks/useSiteLanguage";
import { translateSiteText } from "@/lib/site-translations";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm({ form, setForm, fieldErrors, serviceOptions, locationOptions, status, submitMessage, onSubmit, onReset }: {
  form: ContactValues;
  setForm: (form: ContactValues) => void;
  fieldErrors: Record<string, string>;
  serviceOptions: string[];
  locationOptions: string[];
  status: Status;
  submitMessage: string;
  onSubmit: (event: FormEvent) => void;
  onReset: () => void;
}) {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);

  return (
    <div className="rounded-[1.75rem] border border-black/5 bg-white p-8 shadow-sm">
      {status === "success" ? (
        <SuccessMessage message={submitMessage} onReset={onReset} />
      ) : (
        <>
          <h2 className="mb-2 text-xl font-black text-slate-900">{t("common.sendInquiry", "Send Us an Inquiry")}</h2>
          <p className="mb-6 text-sm text-slate-500">{t("contact.form.description", "Use the current HOI service catalog and share your requirement details.")}</p>
          <form onSubmit={onSubmit} className="space-y-5" data-testid="contact-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input label={t("common.fullName", "Full Name *")} value={form.name} onChange={(value) => setForm({ ...form, name: value })} error={fieldErrors.name} testId="input-name" placeholder={t("contact.placeholder.name", "Your full name")} required />
              <Input label={t("common.companyName", "Company Name")} value={form.company || ""} onChange={(value) => setForm({ ...form, company: value })} testId="input-company" placeholder={t("contact.placeholder.company", "Your company")} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input label={t("common.emailAddress", "Email Address *")} type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} error={fieldErrors.email} testId="input-email" placeholder={t("contact.placeholder.email", "email@company.com")} required />
              <Input label={t("common.phoneNumber", "Phone Number *")} type="tel" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} error={fieldErrors.phone} testId="input-phone" placeholder={t("contact.placeholder.phone", "+91 98100 97323")} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <ServiceSelect form={form} setForm={setForm} fieldErrors={fieldErrors} serviceOptions={serviceOptions} />
              <LocationSelect form={form} setForm={setForm} locationOptions={locationOptions} />
            </div>
            <MessageField form={form} setForm={setForm} error={fieldErrors.message} />
            {status === "error" && submitMessage ? <p className="text-sm text-red-600">{submitMessage}</p> : null}
            <button type="submit" className="w-full rounded-xl bg-[color:var(--hoi-primary)] py-3 font-bold text-white transition-colors hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60" data-testid="btn-submit" disabled={status === "submitting"}>
              {status === "submitting" ? t("common.submitting", "Sending...") : t("common.submitInquiry", "Submit Inquiry")}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

function SuccessMessage({ message, onReset }: { message: string; onReset: () => void }) {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);

  return (
    <div className="text-center py-12">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
        <CheckCircle size={32} className="text-amber-600" />
      </div>
      <h2 className="mb-2 text-2xl font-black text-slate-900">{t("common.thankYou", "Thank You!")}</h2>
      <p className="mb-6 text-slate-500">{message}</p>
      <button type="button" onClick={onReset} className="rounded-lg bg-[color:var(--hoi-primary)] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:opacity-95">
        {t("common.submitAnotherInquiry", "Submit Another Inquiry")}
      </button>
    </div>
  );
}

function Input({ label, value, onChange, error, testId, placeholder, type = "text", required = false }: {
  label: string; value: string; onChange: (value: string) => void; error?: string; testId: string; placeholder: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[color:var(--hoi-primary)]/25" placeholder={placeholder} data-testid={testId} />
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function ServiceSelect({ form, setForm, fieldErrors, serviceOptions }: { form: ContactValues; setForm: (form: ContactValues) => void; fieldErrors: Record<string, string>; serviceOptions: string[] }) {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("common.serviceRequired", "Service Required")}</label>
      <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[color:var(--hoi-primary)]/25" data-testid="select-service">
        <option value="">{t("common.selectService", "Select a service")}</option>
        {serviceOptions.map((service, index) => <option key={index} value={service}>{service}</option>)}
      </select>
      {fieldErrors.service ? <p className="mt-2 text-sm text-red-600">{fieldErrors.service}</p> : null}
    </div>
  );
}

function LocationSelect({ form, setForm, locationOptions }: { form: ContactValues; setForm: (form: ContactValues) => void; locationOptions: string[] }) {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("common.preferredLocation", "Preferred Location")}</label>
      <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[color:var(--hoi-primary)]/25" data-testid="select-location">
        <option value="">{t("common.selectLocation", "Select a location")}</option>
        {locationOptions.map((location) => <option key={location} value={location}>{location}</option>)}
        <option value={t("common.otherCity", "Other City")}>{t("common.otherCity", "Other City")}</option>
      </select>
    </div>
  );
}

function MessageField({ form, setForm, error }: { form: ContactValues; setForm: (form: ContactValues) => void; error?: string }) {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("common.messageRequirements", "Message / Requirements")}</label>
      <textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full resize-none rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[color:var(--hoi-primary)]/25" placeholder={t("contact.placeholder.message", "Tell us about your exhibition requirements, booth size, preferred dates, etc.")} data-testid="textarea-message" />
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
