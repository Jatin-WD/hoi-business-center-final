import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, LogIn, Menu, UserPlus, X } from "lucide-react";
import HeaderMobileMenu from "./HeaderMobileMenu";
import ServiceMegaMenu from "./ServiceMegaMenu";
import { useAuth } from "@/hooks/useAuth";

const hoiLogo = "/assets/hoi.png";

const NAV_LINKS = [
  { href: "/event-calendar", label: "Event Calendar" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

export default function Header() {
  const [serviceOpen, setServiceOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      location === href ? "text-[#f97316] bg-[#fff7ed]" : "text-gray-700 hover:text-[#f97316] hover:bg-[#fff7ed]"
    }`;

  const yashobhoomiClass = () =>
    `px-3 py-2 rounded-md text-sm font-semibold transition-colors whitespace-nowrap ${
      location === "/yashobhoomi" ? "text-gray-900 bg-gray-100" : "text-gray-900 hover:text-gray-900 hover:bg-gray-50"
    }`;

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="bg-[#f97316] text-white text-xs py-1 px-4 flex justify-end gap-4">
        <span>HOI Business Center</span>
        <span>|</span>
        <a href="tel:+919810097323" className="hover:text-[#fff7ed] transition-colors">+91 98100 97323</a>
        <span>|</span>
        <a href="mailto:thlim@kilindia.in" className="hover:text-[#fff7ed] transition-colors">thlim@kilindia.in</a>
      </div>

      <nav className="relative flex items-center justify-between px-4 lg:px-8 h-16 max-w-[1600px] mx-auto">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <img src={hoiLogo} alt="HOI Business Center Logo" className="h-12 w-auto logo" data-testid="logo" />
        </Link>

        <div className="hidden lg:flex items-center gap-0 text-sm font-medium">
          <Link href="/" className={linkClass("/")}>Home</Link>
          <div className="relative" onMouseEnter={handleServiceEnter} onMouseLeave={handleServiceLeave}>
            <button className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors whitespace-nowrap ${serviceOpen ? "text-[#f97316] bg-[#fff7ed]" : "text-gray-700 hover:text-[#f97316] hover:bg-[#fff7ed]"}`} data-testid="nav-service" onClick={() => setServiceOpen((value) => !value)}>
              Service <ChevronDown size={14} className={`transition-transform ${serviceOpen ? "rotate-180" : ""}`} />
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
            Yashobhoomi
          </Link>
          {NAV_LINKS.map((item) => <Link key={item.href} href={item.href} className={linkClass(item.href)}>{item.label}</Link>)}
        </div>

        <div className="hidden lg:flex items-center gap-2">
          {user ? <UserActions name={user.name} logout={logout} /> : <AuthActions />}
        </div>

        <button className="lg:hidden p-2 text-gray-700" onClick={() => setMobileOpen(!mobileOpen)} data-testid="btn-mobile-menu">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {mobileOpen && <HeaderMobileMenu onClose={() => setMobileOpen(false)} user={user} logout={logout} />}
    </header>
  );
}

function UserActions({ name, logout }: { name: string; logout: () => void }) {
  return (
    <>
      <span className="text-sm text-gray-700">Hi, {name}</span>
      <button type="button" onClick={logout} className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold text-[#f97316] border border-[#f97316] hover:bg-[#fff7ed] transition-colors whitespace-nowrap">
        Logout
      </button>
    </>
  );
}

function AuthActions() {
  return (
    <>
      <Link href="/login" className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold text-[#f97316] border border-[#f97316] hover:bg-[#fff7ed] transition-colors whitespace-nowrap" data-testid="btn-login">
        <LogIn size={15} /> Login
      </Link>
      <Link href="/signup" className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold bg-[#f97316] text-white hover:bg-[#ea580c] transition-colors whitespace-nowrap" data-testid="btn-signup">
        <UserPlus size={15} /> Sign Up
      </Link>
    </>
  );
}
