import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { ChevronDown } from "lucide-react";
import { loadCatalog, type CatalogVenue } from "@/lib/catalog";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  onClose: () => void;
  user: ReturnType<typeof useAuth>["user"];
  logout: ReturnType<typeof useAuth>["logout"];
};

export default function HeaderMobileMenu({ onClose, user, logout }: Props) {
  const [serviceOpen, setServiceOpen] = useState(false);
  const [venues, setVenues] = useState<CatalogVenue[]>([]);

  useEffect(() => {
    let mounted = true;
    loadCatalog().then((data) => mounted && setVenues(data.venues)).catch(() => mounted && setVenues([]));
    return () => {
      mounted = false;
    };
  }, []);

  const locations = useMemo(() => {
    const map = new Map<string, string>();
    venues.forEach((venue) => map.set(venue.locationId, venue.city || venue.state || venue.locationId));
    return [...map.entries()].map(([id, label]) => ({ href: `/service/${id}`, label }));
  }, [venues]);

  return (
    <div className="lg:hidden bg-white border-t border-gray-200 overflow-y-auto max-h-[80vh]">
      <div className="px-4 py-3 space-y-1">
        <NavLink href="/" onClose={onClose}>Home</NavLink>
        <div className="border-b border-gray-100">
          <button className="w-full flex justify-between items-center py-2.5 text-gray-700 font-medium" onClick={() => setServiceOpen((v) => !v)}>
            Service <ChevronDown size={16} className={`transition-transform ${serviceOpen ? "rotate-180" : ""}`} />
          </button>
          {serviceOpen && (
            <div className="pl-4 pb-2 text-sm text-gray-500 space-y-1">
              <p className="text-xs text-gray-400 uppercase tracking-wide pt-1 pb-0.5">Select a location from the menu</p>
              <Link href="/service/yashobhoomi" onClick={onClose} className="block py-1.5 font-semibold text-[#f97316] hover:text-[#ea580c]">
                Yashobhoomi
              </Link>
              {locations.map((item) => <Link key={item.href} href={item.href} onClick={onClose} className="block py-1.5 text-gray-600 hover:text-[#f97316]">{item.label}</Link>)}
              {!locations.length && <p className="py-1.5 text-gray-400">No venues added yet.</p>}
            </div>
          )}
        </div>
        <NavLink href="/yashobhoomi" onClose={onClose}>Yashobhoomi</NavLink>
        <NavLink href="/exhibition-staff" onClose={onClose}>Apply for Man Power Service</NavLink>
        <NavLink href="/event-calendar" onClose={onClose}>Event Calendar</NavLink>
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
  return <Link href={href} onClick={onClose} className="block py-2.5 text-gray-700 font-medium border-b border-gray-100">{children}</Link>;
}

function AuthLinks({ onClose }: { onClose: () => void }) {
  return (
    <>
      <Link href="/login" onClick={onClose} className="flex-1 text-center border border-[#f97316] text-[#f97316] px-4 py-2.5 rounded-md text-sm font-semibold">Login</Link>
      <Link href="/signup" onClick={onClose} className="flex-1 text-center bg-[#f97316] text-white px-4 py-2.5 rounded-md text-sm font-semibold">Sign Up</Link>
    </>
  );
}
