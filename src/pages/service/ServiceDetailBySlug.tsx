import { Link } from "wouter";
import { ArrowRight, ChevronRight, MapPin } from "lucide-react";
import { type CatalogService, type CatalogVenue } from "@/lib/catalog";

export default function ServiceDetailBySlug({ service, venues }: { service: CatalogService; venues: CatalogVenue[] }) {
  const selectedLocation = new URLSearchParams(window.location.search).get("location") ?? "";
  const locationParam = selectedLocation ? `?location=${encodeURIComponent(selectedLocation)}` : "";
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#0f2460] to-[#1a3a8f] text-white py-14 px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center gap-2 text-blue-200 text-sm mb-4 flex-wrap">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight size={14} />
            <Link href="/service" className="hover:text-white">Service</Link>
            <ChevronRight size={14} />
            <span className="text-white">{service.label}</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">{service.label}</h1>
          <p className="text-blue-200 max-w-2xl">Explore package options and choose a venue where this service can be arranged.</p>
          {selectedLocation ? <p className="mt-4 inline-flex rounded-lg bg-yellow-400 px-3 py-1.5 text-sm font-bold text-gray-900">Selected location: {selectedLocation}</p> : null}
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 py-12 space-y-10">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-5">Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {service.packages.map((pkg) => (
              <Link key={pkg.href} href={`${pkg.href}${locationParam}`} className="group rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-[#1a3a8f] hover:shadow-lg">
                <p className="font-semibold text-gray-900 group-hover:text-[#1a3a8f]">{pkg.label}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#1a3a8f]">
                  View package <ArrowRight size={14} />
                </span>
              </Link>
            ))}
            {!service.packages.length && <EmptyCard message="No packages are available for this service yet." />}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-5">Available Venues</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {venues.map((venue) => (
              <Link key={venue.id} href={`/venue/${venue.locationId}/${venue.subVenueId}`} className="rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-[#1a3a8f] hover:shadow-lg">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1a3a8f]">
                  <MapPin size={18} />
                </div>
                <p className="font-semibold text-gray-900">{venue.name}</p>
                <p className="mt-1 text-sm text-gray-500">{venue.city}, {venue.state}</p>
              </Link>
            ))}
            {!venues.length && <EmptyCard message="No venues are available yet." />}
          </div>
        </section>

        <div className="rounded-2xl bg-[#1a3a8f] p-7 text-white">
          <h2 className="text-xl font-bold">Need this service for your exhibition?</h2>
          <p className="mt-2 text-blue-100">Send a requirement and the team will respond with pricing, availability, and next steps.</p>
          <Link href={`/contact?type=Service%20Requirement&service=${encodeURIComponent(service.label)}${selectedLocation ? `&location=${encodeURIComponent(selectedLocation)}` : ""}`} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-gray-900 hover:bg-yellow-300">
            Get Quote <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmptyCard({ message }: { message: string }) {
  return <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-500">{message}</div>;
}
