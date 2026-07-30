import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import HeroSection from "@/components/common/HeroSection";
import CTABanner from "@/components/common/CTABanner";
import SubmissionPopup from "@/components/common/SubmissionPopup";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useSiteLanguage } from "@/hooks/useSiteLanguage";
import { translateServiceLabel, translateSiteText } from "@/lib/site-translations";
import { contactSchema, type ContactValues } from "@/lib/validators";
import { useAuth } from "@/hooks/useAuth";
import { ContactForm } from "./contact/ContactForm";
import { ContactInfo } from "./contact/ContactInfo";
import { loadCatalog } from "@/lib/catalog";

const blankForm: ContactValues = {
  name: "",
  email: "",
  phone: "",
  company: "",
  service: "",
  location: "",
  message: "",
};

export default function ContactPage() {
  const { language } = useSiteLanguage();
  const t = (key: string) => translateSiteText(language, key);
  const cms = useCmsContent({
    "contact.title": t("contact.title"),
    "contact.description": t("contact.description"),
  });
  const { user } = useAuth();
  const [form, setForm] = useState<ContactValues>(blankForm);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitMessage, setSubmitMessage] = useState("");
  const [popup, setPopup] = useState({ open: false, type: "success" as "success" | "error", title: "", message: "" });
  const { data: catalog, isLoading: catalogLoading, error: catalogError, refetch } = useQuery({ queryKey: ["contact-catalog"], queryFn: loadCatalog });
  const serviceOptions = useMemo(() => (catalog?.services ?? []).map((service) => translateServiceLabel(service.id, language)), [catalog, language]);
  const locationOptions = useMemo(() => Array.from(new Set((catalog?.venues ?? []).map((venue) => venue.locationId === "yashobhoomi" ? t("nav.yashobhoomi") : venue.city).filter(Boolean))), [catalog, language]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const service = params.get("service") ?? "";
    const packageName = params.get("package") ?? "";
    const location = params.get("location") ?? "";
    if (!service && !packageName && !location) return;

    setForm((prev) => ({
      ...prev,
      service: service || prev.service,
      location: location || prev.location,
      message: prev.message || buildPrefilledMessage(service, packageName, location, t),
    }));
  }, []);

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.name || "",
      email: prev.email || user.email || "",
      phone: prev.phone || user.phone || "",
      company: prev.company || user.company || "",
    }));
  }, [user]);

  const resetForm = () => {
    setForm(blankForm);
    setFieldErrors({});
    setSubmitMessage("");
    setStatus("idle");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFieldErrors({});
    setSubmitMessage("");

    const result = contactSchema.safeParse(form);
    if (!result.success) {
      setFieldErrors(Object.fromEntries(result.error.errors.map((error) => [error.path[0] as string, error.message])));
      setStatus("error");
      return;
    }

    setStatus("submitting");
    try {
      const params = new URLSearchParams(window.location.search);
      await apiClient.submitInquiry({ ...result.data, packageName: params.get("package") ?? "", requirementType: params.get("type") ?? t("contact.websiteRequirement") });
      const message = t("contact.submitSuccess");
      setStatus("success");
      setSubmitMessage(message);
      setPopup({ open: true, type: "success", title: t("contact.thankYou"), message });
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : t("contact.submissionFailed");
      setStatus("error");
      setSubmitMessage(message);
      setPopup({ open: true, type: "error", title: t("contact.submissionFailedTitle"), message });
    }
  };

  return (
    <div className="min-h-screen bg-[#f5efe4]">
      <HeroSection breadcrumbs={[{ label: t("nav.home"), href: "/" }, { label: t("nav.contactUs") }]} title={cms("contact.title")} description={cms("contact.description")} />
      <div className="max-w-[1600px] mx-auto px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <ContactInfo />
          <div className="lg:col-span-2">
            {catalogError ? <button type="button" onClick={() => refetch()} className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">{t("contact.retryServices")}</button> : null}
            <ContactForm form={form} setForm={setForm} fieldErrors={fieldErrors} serviceOptions={catalogLoading ? [] : serviceOptions} locationOptions={catalogLoading ? [] : locationOptions} status={status} submitMessage={submitMessage} onSubmit={handleSubmit} onReset={resetForm} />
          </div>
        </div>
      </div>
      <div className="max-w-[1600px] mx-auto px-8 pb-10">
        <CTABanner title={t("contact.needHelp")} description={t("contact.servicePackageCopy")} primaryLabel={t("contact.bookConsultation")} primaryHref="/contact" secondaryLabel={t("contact.serviceCatalog")} secondaryHref="/services" />
      </div>
      <SubmissionPopup open={popup.open} type={popup.type} title={popup.title} message={popup.message} onClose={() => setPopup((prev) => ({ ...prev, open: false }))} />
    </div>
  );
}

function buildPrefilledMessage(service: string, packageName: string, location: string, t: (key: string, fallback?: string) => string) {
  return [
    t("contact.prefilledHeading"),
    service ? `${t("contact.prefilledService")}: ${service}` : "",
    packageName ? `${t("contact.prefilledPackage")}: ${packageName}` : "",
    location ? `${t("contact.prefilledLocation")}: ${location}` : "",
    t("contact.prefilledClosing"),
  ].filter(Boolean).join("\n");
}
