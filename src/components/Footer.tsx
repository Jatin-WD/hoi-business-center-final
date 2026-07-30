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
    <footer className="bg-[#111111] text-zinc-200 border-t border-white/10">
      <div className="mx-auto max-w-[1600px] px-8 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <img src={hoiLogo} alt="HOI Business Center Logo" className="mb-4 h-14 w-auto logo" />
            <p className="text-sm leading-relaxed text-zinc-400">
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
