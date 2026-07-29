import { useState, type ReactNode } from "react";
import { Link } from "wouter";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  onClose: () => void;
  user: ReturnType<typeof useAuth>["user"];
  logout: ReturnType<typeof useAuth>["logout"];
};

export default function HeaderMobileMenu({ onClose, user, logout }: Props) {
  const [serviceOpen, setServiceOpen] = useState(false);

  return (
    <div className="lg:hidden bg-white border-t border-gray-200 overflow-y-auto max-h-[80vh]">
      <div className="px-4 py-3 space-y-1">
        <NavLink href="/" onClose={onClose}>Home</NavLink>
        <div className="border-b border-gray-100">
          <button className="w-full flex justify-between items-center py-2.5 text-gray-700 font-medium" onClick={() => setServiceOpen((v) => !v)}>
            Booking <ChevronDown size={16} className={`transition-transform ${serviceOpen ? "rotate-180" : ""}`} />
          </button>
          {serviceOpen && (
            <div className="pl-4 pb-2 text-sm text-gray-500 space-y-1">
              <Link href="/service/yashobhoomi" onClick={onClose} className="block py-1.5 font-semibold text-[#f97316] hover:text-[#ea580c]">
                Yashobhoomi
              </Link>
            </div>
          )}
        </div>
        <NavLink href="/services" onClose={onClose}>Services</NavLink>
        <NavLink href="/yashobhoomi" onClose={onClose}>Yashobhoomi</NavLink>
        <NavLink href="/event-calendar" onClose={onClose}>Event Calendar</NavLink>
        <NavLink href="/apply-manpower" onClose={onClose}>Apply for Manpower</NavLink>
        <NavLink href="/about" onClose={onClose}>About Us</NavLink>
        <NavLink href="/contact" onClose={onClose}>Contact Us</NavLink>
        <div className="pt-3 flex gap-2">
          {user ? <button type="button" onClick={() => { logout(); onClose(); }} className="flex-1 text-center border border-[#f97316] text-[#f97316] px-4 py-2.5 rounded-md text-sm font-semibold">Logout</button> : <AuthLinks onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}

function NavLink({ href, onClose, children }: { href: string; onClose: () => void; children: ReactNode }) {
  const isYashobhoomi = href === "/yashobhoomi";
  return <Link href={href} onClick={onClose} className={`block py-2.5 border-b border-gray-100 ${isYashobhoomi ? "text-gray-900 font-semibold" : "text-gray-700 font-medium"}`}>{children}</Link>;
}

function AuthLinks({ onClose }: { onClose: () => void }) {
  return (
    <>
      <Link href="/login" onClick={onClose} className="flex-1 text-center border border-[#f97316] text-[#f97316] px-4 py-2.5 rounded-md text-sm font-semibold">Login</Link>
      <Link href="/signup" onClick={onClose} className="flex-1 text-center bg-[#f97316] text-white px-4 py-2.5 rounded-md text-sm font-semibold">Sign Up</Link>
    </>
  );
}
