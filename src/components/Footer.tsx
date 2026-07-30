import { Link } from "wouter";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useSiteLanguage } from "@/hooks/useSiteLanguage";
import { translateServiceLabel, translateSiteText } from "@/lib/site-translations";

const hoiLogo = "/assets/hoi.png";

export default function Footer() {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);
  const cms = useCmsContent({
    "footer.about": "HOI Business Center provides end-to-end exhibition services including booth reservation, booth design, booth install & demolition, logistics services, marketing services, and interpretation & protocol.",
  });

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#0a0f18] text-zinc-200">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.04),transparent_20%)]" />
      <div className="relative mx-auto max-w-[1600px] px-6 py-14 sm:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 inline-flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
              <img src={hoiLogo} alt="HOI Business Center Logo" className="h-14 w-auto logo" />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-white">{t("footer.brand", "HOI Business Center")}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">{t("footer.partner", "Official partner • Yashobhoomi")}</p>
              </div>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
              {cms("footer.about")}
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">{t("footer.services", "Services")}</h4>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li><Link href="/services" className="transition-colors hover:text-[#f97316]">{t("footer.allServices", "All Services")}</Link></li>
              <li><Link href="/services/booth-reservation" className="transition-colors hover:text-[#f97316]">{translateServiceLabel("booth-reservation", language)}</Link></li>
              <li><Link href="/services/booth-design" className="transition-colors hover:text-[#f97316]">{translateServiceLabel("booth-design", language)}</Link></li>
              <li><Link href="/services/booth-install-demolition" className="transition-colors hover:text-[#f97316]">{translateServiceLabel("booth-install-demolition", language)}</Link></li>
              <li><Link href="/services/logistics" className="transition-colors hover:text-[#f97316]">{translateServiceLabel("logistics", language)}</Link></li>
              <li><Link href="/services/marketing" className="transition-colors hover:text-[#f97316]">{translateServiceLabel("marketing", language)}</Link></li>
              <li><Link href="/services/interpretation-protocol" className="transition-colors hover:text-[#f97316]">{translateServiceLabel("interpretation-protocol", language)}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">{t("footer.company", "Company")}</h4>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li><Link href="/about/hoi" className="transition-colors hover:text-[#f97316]">{t("footer.aboutHoi", "About HOI")}</Link></li>
              <li><Link href="/yashobhoomi" className="transition-colors hover:text-[#f97316]">{t("footer.roleAtYashobhoomi", "Role of HOI at Yashobhoomi")}</Link></li>
              <li><Link href="/event-calendar" className="transition-colors hover:text-[#f97316]">{t("nav.eventCalendar", "Event Calendar")}</Link></li>
              <li><Link href="/apply-manpower" className="transition-colors hover:text-[#f97316]">{t("nav.applyForManpower", "Apply for Manpower")}</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-[#f97316]">{t("nav.contactUs", "Contact Us")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">{t("footer.getInTouch", "Get in Touch")}</h4>
            <div className="space-y-3 text-sm text-zinc-400">
              <p>
                <span className="mb-0.5 block font-medium text-white">{t("common.officeAddress", "Address")}</span>
                {t("footer.address", "Yashobhoomi, Dwarka, New Delhi, India")}
              </p>
              <p>
                <span className="mb-0.5 block font-medium text-white">{t("footer.phone", "Phone")}</span>
                +91 98100 97323
              </p>
              <p>
                <span className="mb-0.5 block font-medium text-white">{t("common.emailAddress", "Email")}</span>
                thlim@kilindia.in
              </p>
            </div>
            <Link
              href="/contact"
              className="mt-5 inline-block rounded-lg bg-[#f97316] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#ea580c]"
              data-testid="footer-cta"
            >
              {t("footer.bookService", "Book a Service")}
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-zinc-500 md:flex-row">
          <p>{t("footer.copyright", "Copyright 2026 HOI Business Center. All rights reserved.")}</p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="transition-colors hover:text-[#f97316]">{t("common.privacyPolicy", "Privacy Policy")}</Link>
            <Link href="/terms-of-service" className="transition-colors hover:text-[#f97316]">{t("common.termsOfService", "Terms of Service")}</Link>
            <Link href="/support" className="transition-colors hover:text-[#f97316]">{t("common.support", "Support")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
