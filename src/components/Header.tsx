import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, Globe, LogIn, Menu, UserPlus, X } from "lucide-react";
import HeaderMobileMenu from "./HeaderMobileMenu";
import ServiceMegaMenu from "./ServiceMegaMenu";
import { useAuth } from "@/hooks/useAuth";
import { useSiteLanguage } from "@/hooks/useSiteLanguage";
import { SUPPORTED_LANGUAGES, translateSiteText, type SiteLanguage } from "@/lib/site-translations";

const hoiLogo = "/assets/hoi.png";

export default function Header() {
  const [serviceOpen, setServiceOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { language, setLanguage } = useSiteLanguage();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);

  useEffect(() => {
    setServiceOpen(false);
    setMobileOpen(false);
  }, [location]);

  const handleServiceEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setServiceOpen(true);
  };

  const handleServiceLeave = () => {
    closeTimer.current = setTimeout(() => setServiceOpen(false), 150);
  };

  const linkClass = (href: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
      location === href ? "text-[#f97316] bg-gray-100" : "text-gray-700 hover:text-[#f97316] hover:bg-gray-50"
    }`;

  const yashobhoomiClass = () =>
    `px-3 py-2 rounded-md text-sm font-semibold transition-colors whitespace-nowrap ${
      location === "/yashobhoomi" ? "text-gray-900 bg-gray-100" : "text-gray-900 hover:text-gray-900 hover:bg-gray-50"
    }`;

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="bg-[#111111] text-white text-xs py-1 px-4 flex justify-end gap-4">
        <span>{t("header.topline", "HOI Business Center")}</span>
        <span>|</span>
        <a href="tel:+919810097323" className="hover:text-[#f97316] transition-colors">+91 98100 97323</a>
        <span>|</span>
        <a href="mailto:thlim@kilindia.in" className="hover:text-[#f97316] transition-colors">thlim@kilindia.in</a>
      </div>

      <nav className="relative flex items-center justify-between px-4 lg:px-8 h-16 max-w-[1600px] mx-auto">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <img src={hoiLogo} alt="HOI Business Center Logo" className="h-12 w-auto logo" data-testid="logo" />
        </Link>

        <div className="hidden lg:flex items-center gap-0 text-sm font-medium">
          <Link href="/" className={linkClass("/")}>{t("nav.home", "Home")}</Link>
          <div className="relative" onMouseEnter={handleServiceEnter} onMouseLeave={handleServiceLeave}>
            <button className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors whitespace-nowrap ${serviceOpen ? "text-[#f97316] bg-gray-100" : "text-gray-700 hover:text-[#f97316] hover:bg-gray-50"}`} data-testid="nav-booking" onClick={() => setServiceOpen((value) => !value)}>
              {t("nav.booking", "Booking")} <ChevronDown size={14} className={`transition-transform ${serviceOpen ? "rotate-180" : ""}`} />
            </button>
            {serviceOpen && (
              <div className="fixed left-0 right-0 top-[calc(64px+28px)] z-50" onMouseEnter={handleServiceEnter} onMouseLeave={handleServiceLeave}>
                <ServiceMegaMenu onClose={() => setServiceOpen(false)} />
              </div>
            )}
          </div>
          <Link
            href="/yashobhoomi"
            className={yashobhoomiClass()}
          >
            {t("nav.yashobhoomi", "Yashobhoomi")}
          </Link>
          <Link href="/services" className={linkClass("/services")}>{t("nav.services", "Services")}</Link>
          <Link href="/event-calendar" className={linkClass("/event-calendar")}>{t("nav.eventCalendar", "Event Calendar")}</Link>
          <Link href="/about" className={linkClass("/about")}>{t("nav.aboutUs", "About Us")}</Link>
          <Link href="/apply-manpower" className={linkClass("/apply-manpower")}>{t("nav.applyForManpower", "Apply for Manpower")}</Link>
          <Link href="/contact" className={linkClass("/contact")}>{t("nav.contactUs", "Contact Us")}</Link>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <LanguageSwitcher language={language} onChange={setLanguage} />
          {user ? <UserActions name={user.name} logout={logout} /> : <AuthActions />}
        </div>

        <button className="lg:hidden p-2 text-gray-700" onClick={() => setMobileOpen(!mobileOpen)} data-testid="btn-mobile-menu">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {mobileOpen && <HeaderMobileMenu onClose={() => setMobileOpen(false)} user={user} logout={logout} language={language} onLanguageChange={setLanguage} />}
    </header>
  );
}

function UserActions({ name, logout }: { name: string; logout: () => void }) {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);

  return (
    <>
      <span className="text-sm text-gray-700">{t("auth.hi", "Hi")}, {name}</span>
      <button type="button" onClick={logout} className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold text-[#f97316] border border-[#f97316] hover:bg-gray-50 transition-colors whitespace-nowrap">
        {t("auth.logout", "Logout")}
      </button>
    </>
  );
}

function AuthActions() {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);

  return (
    <>
      <Link href="/login" className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold text-[#f97316] border border-[#f97316] hover:bg-gray-50 transition-colors whitespace-nowrap" data-testid="btn-login">
        <LogIn size={15} /> {t("auth.login", "Login")}
      </Link>
      <Link href="/signup" className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold bg-[#f97316] text-white hover:bg-[#ea580c] transition-colors whitespace-nowrap" data-testid="btn-signup">
        <UserPlus size={15} /> {t("auth.signup", "Sign Up")}
      </Link>
    </>
  );
}

function LanguageSwitcher({ language, onChange }: { language: SiteLanguage; onChange: (language: SiteLanguage) => void }) {
  return (
    <label className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700">
      <Globe size={14} className="text-[#f97316]" />
      <span className="sr-only">Language</span>
        <select
          value={language}
        onChange={(event) => onChange(event.target.value as SiteLanguage)}
          className="bg-transparent text-sm outline-none"
          aria-label="Language"
        >
        {SUPPORTED_LANGUAGES.map((item) => (
          <option key={item.code} value={item.code}>
            {item.nativeLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
