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
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);
  const cms = useCmsContent({
    "contact.title": "Contact Us",
    "contact.description": "Reach out to our team for inquiries, quotations, or to book any of our services.",
  });
  const { user } = useAuth();
  const [form, setForm] = useState<ContactValues>(blankForm);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitMessage, setSubmitMessage] = useState("");
  const [popup, setPopup] = useState({ open: false, type: "success" as "success" | "error", title: "", message: "" });
  const { data: catalog, isLoading: catalogLoading, error: catalogError, refetch } = useQuery({ queryKey: ["contact-catalog"], queryFn: loadCatalog });
  const serviceOptions = useMemo(() => (catalog?.services ?? []).map((service) => translateServiceLabel(service.id, language)), [catalog, language]);
  const locationOptions = useMemo(() => Array.from(new Set((catalog?.venues ?? []).map((venue) => venue.locationId === "yashobhoomi" ? t("nav.yashobhoomi", "Yashobhoomi") : venue.city).filter(Boolean))), [catalog, language]);

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
      await apiClient.submitInquiry({ ...result.data, packageName: params.get("package") ?? "", requirementType: params.get("type") ?? "Website requirement" });
      const message = t("contact.submitSuccess", "Your requirement has been submitted successfully. Our team will contact you shortly.");
      setStatus("success");
      setSubmitMessage(message);
      setPopup({ open: true, type: "success", title: t("contact.thankYou", "Thank You!"), message });
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : t("contact.submissionFailed", "Unable to send inquiry. Please try again later.");
      setStatus("error");
      setSubmitMessage(message);
      setPopup({ open: true, type: "error", title: t("contact.submissionFailedTitle", "Submission Failed"), message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection breadcrumbs={[{ label: t("nav.home", "Home"), href: "/" }, { label: t("nav.contactUs", "Contact Us") }]} title={cms("contact.title")} description={cms("contact.description")} />
      <div className="max-w-[1600px] mx-auto px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <ContactInfo />
          <div className="lg:col-span-2">
            {catalogError ? <button type="button" onClick={() => refetch()} className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">{t("contact.retryServices", "Service data failed to load. Retry")}</button> : null}
            <ContactForm form={form} setForm={setForm} fieldErrors={fieldErrors} serviceOptions={catalogLoading ? [] : serviceOptions} locationOptions={catalogLoading ? [] : locationOptions} status={status} submitMessage={submitMessage} onSubmit={handleSubmit} onReset={resetForm} />
          </div>
        </div>
      </div>
      <div className="max-w-[1600px] mx-auto px-8 pb-10">
        <CTABanner title={t("contact.needHelp", "Need help with a service package?")} description={t("contact.servicePackageCopy", "Our team is ready to guide you through the best HOI service package for your exhibition requirement.")} primaryLabel={t("contact.bookConsultation", "Book a Consultation")} primaryHref="/contact" secondaryLabel={t("contact.serviceCatalog", "Browse Services")} secondaryHref="/services" />
      </div>
      <SubmissionPopup open={popup.open} type={popup.type} title={popup.title} message={popup.message} onClose={() => setPopup((prev) => ({ ...prev, open: false }))} />
    </div>
  );
}

function buildPrefilledMessage(service: string, packageName: string, location: string, t: (key: string, fallback?: string) => string) {
  return [
    t("contact.prefilledHeading", "Requirement details:"),
    service ? `${t("contact.prefilledService", "Service")}: ${service}` : "",
    packageName ? `${t("contact.prefilledPackage", "Package")}: ${packageName}` : "",
    location ? `${t("contact.prefilledLocation", "Location")}: ${location}` : "",
    t("contact.prefilledClosing", "Please contact me with pricing, availability, and next steps."),
  ].filter(Boolean).join("\n");
}
