import { useState, type ReactNode } from "react";
import { Link } from "wouter";
import { ChevronDown, Globe } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SUPPORTED_LANGUAGES, translateSiteText, type SiteLanguage } from "@/lib/site-translations";

type Props = {
  onClose: () => void;
  user: ReturnType<typeof useAuth>["user"];
  logout: ReturnType<typeof useAuth>["logout"];
  language: SiteLanguage;
  onLanguageChange: (language: SiteLanguage) => void;
};

export default function HeaderMobileMenu({ onClose, user, logout, language, onLanguageChange }: Props) {
  const [serviceOpen, setServiceOpen] = useState(false);
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);

  return (
    <div className="lg:hidden bg-white border-t border-gray-200 overflow-y-auto max-h-[80vh]">
      <div className="px-4 py-3 space-y-1">
        <NavLink href="/" onClose={onClose}>{t("nav.home", "Home")}</NavLink>
        <div className="border-b border-gray-100">
          <button className="w-full flex justify-between items-center py-2.5 text-gray-700 font-medium" onClick={() => setServiceOpen((v) => !v)}>
            {t("nav.booking", "Booking")} <ChevronDown size={16} className={`transition-transform ${serviceOpen ? "rotate-180" : ""}`} />
          </button>
          {serviceOpen && (
            <div className="pl-4 pb-2 text-sm text-gray-500 space-y-1">
              <Link href="/service/yashobhoomi" onClick={onClose} className="block py-1.5 font-semibold text-[#f97316] hover:text-[#ea580c]">
                {t("nav.yashobhoomi", "Yashobhoomi")}
              </Link>
            </div>
          )}
        </div>
        <NavLink href="/services" onClose={onClose}>{t("nav.services", "Services")}</NavLink>
        <NavLink href="/yashobhoomi" onClose={onClose}>{t("nav.yashobhoomi", "Yashobhoomi")}</NavLink>
        <NavLink href="/event-calendar" onClose={onClose}>{t("nav.eventCalendar", "Event Calendar")}</NavLink>
        <NavLink href="/apply-manpower" onClose={onClose}>{t("nav.applyForManpower", "Apply for Manpower")}</NavLink>
        <NavLink href="/about" onClose={onClose}>{t("nav.aboutUs", "About Us")}</NavLink>
        <NavLink href="/contact" onClose={onClose}>{t("nav.contactUs", "Contact Us")}</NavLink>
        <div className="pt-2">
          <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700">
            <Globe size={14} className="text-[#f97316]" />
            <span className="text-xs uppercase tracking-wide">{t("nav.language", "Language")}</span>
            <select
              value={language}
              onChange={(event) => onLanguageChange(event.target.value as SiteLanguage)}
              className="ml-auto bg-transparent outline-none"
              aria-label={t("nav.selectLanguage", "Select language")}
            >
              {SUPPORTED_LANGUAGES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.nativeLabel}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="pt-3 flex gap-2">
          {user ? <button type="button" onClick={() => { logout(); onClose(); }} className="flex-1 text-center border border-[#f97316] text-[#f97316] px-4 py-2.5 rounded-md text-sm font-semibold">{t("auth.logout", "Logout")}</button> : <AuthLinks onClose={onClose} language={language} />}
        </div>
      </div>
    </div>
  );
}

function NavLink({ href, onClose, children }: { href: string; onClose: () => void; children: ReactNode }) {
  const isYashobhoomi = href === "/yashobhoomi";
  return <Link href={href} onClick={onClose} className={`block py-2.5 border-b border-gray-100 ${isYashobhoomi ? "text-gray-900 font-semibold" : "text-gray-700 font-medium"}`}>{children}</Link>;
}

function AuthLinks({ onClose, language }: { onClose: () => void; language: SiteLanguage }) {
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);

  return (
    <>
      <Link href="/login" onClick={onClose} className="flex-1 text-center border border-[#f97316] text-[#f97316] px-4 py-2.5 rounded-md text-sm font-semibold">{t("auth.login", "Login")}</Link>
      <Link href="/signup" onClick={onClose} className="flex-1 text-center bg-[#f97316] text-white px-4 py-2.5 rounded-md text-sm font-semibold">{t("auth.signup", "Sign Up")}</Link>
    </>
  );
}
