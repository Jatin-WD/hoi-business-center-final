import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Check, ChevronRight, Mail, Phone } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface Props {
  params?: { serviceId?: string; packageId?: string };
}

type PackageDetail = {
  category: string;
  subcategory: string;
  title: string;
  subtitle: string;
  price: string;
  priceNote?: string;
  price_note?: string;
  description: string;
  includes: string[];
  notIncludes?: string[];
  duration: string;
};

export default function PackageDetailPage({ params }: Props) {
  const serviceId = params?.serviceId ?? "";
  const packageId = params?.packageId ?? "";
  const [detail, setDetail] = useState<PackageDetail | null>(null);
  const [allPackages, setAllPackages] = useState<PackageDetail[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    setStatus("loading");
    Promise.all([apiClient.getPackage(serviceId, packageId), apiClient.getPackagesByCategory(serviceId)])
      .then(([packageResponse, listResponse]) => {
        setDetail(packageResponse.data.package);
        setAllPackages(listResponse.data.packages ?? []);
        setStatus("success");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to load package");
        setStatus("error");
      });
  }, [serviceId, packageId]);

  const otherPackages = useMemo(() => allPackages.filter((pkg) => pkg.subcategory !== packageId), [allPackages, packageId]);

  if (status === "loading") {
    return <div className="min-h-screen bg-gray-50 px-8 py-16 text-center text-gray-500">Loading package...</div>;
  }

  if (status === "error" || !detail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Package Not Found</h1>
          <p className="mb-4 text-gray-500">{error || "This package doesn't exist or may have been moved."}</p>
          <Link href="/service" className="font-medium text-[#f97316] hover:underline">Back to Booking</Link>
        </div>
      </div>
    );
  }

  const serviceLabel = detail.subtitle || "Service";
  const priceNote = detail.priceNote || detail.price_note || "";
  const notIncludes = detail.notIncludes ?? [];
  const selectedLocation = new URLSearchParams(window.location.search).get("location") ?? "";
  const locationParam = selectedLocation ? `&location=${encodeURIComponent(selectedLocation)}` : "";
  const contactHref = `/contact?type=Service%20Requirement&service=${encodeURIComponent(serviceLabel)}&package=${encodeURIComponent(detail.title)}${locationParam}`;

  return (
    <div className="min-h-screen bg-[#f5efe4]">
      <div className="bg-[linear-gradient(135deg,#0a0f18_0%,#111827_56%,#f97316_112%)] px-8 py-14 text-white">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-zinc-200">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight size={14} />
            <Link href="/service" className="hover:text-white">Booking</Link>
            <ChevronRight size={14} />
            <span className="text-white">{serviceLabel}</span>
            <ChevronRight size={14} />
            <span className="text-white">{detail.title}</span>
          </div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-yellow-300">{serviceLabel}</p>
          <h1 className="mb-2 text-3xl font-bold">{detail.title}</h1>
          {selectedLocation ? <p className="mt-3 inline-flex rounded-lg bg-yellow-400 px-3 py-1.5 text-sm font-bold text-gray-900">Selected location: {selectedLocation}</p> : null}
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-2xl font-bold text-white">{detail.price}</span>
            <span className="text-sm text-zinc-200">{priceNote}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-8 py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <section className="rounded-2xl border border-gray-100 bg-white p-7">
              <h2 className="mb-3 text-xl font-bold text-gray-900">About This Package</h2>
              <p className="leading-relaxed text-gray-600">{detail.description}</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-1.5 text-sm text-[#f97316]">
                <span className="font-semibold">Duration:</span> {detail.duration}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-7">
              <h2 className="mb-5 text-xl font-bold text-gray-900">What's Included</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {detail.includes.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {notIncludes.length > 0 && (
              <section className="rounded-2xl border border-gray-100 bg-white p-7">
                <h2 className="mb-5 text-xl font-bold text-gray-900">Not Included</h2>
                <ul className="space-y-2">
                  {notIncludes.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-gray-500">
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {otherPackages.length > 0 && (
              <section className="rounded-2xl border border-gray-100 bg-white p-7">
                <h2 className="mb-5 text-xl font-bold text-gray-900">Other {serviceLabel} Packages</h2>
                <div className="space-y-2">
                  {otherPackages.map((pkg) => (
                    <Link key={`${pkg.category}-${pkg.subcategory}`} href={`/packages/${pkg.category}/${pkg.subcategory}${selectedLocation ? `?location=${encodeURIComponent(selectedLocation)}` : ""}`} className="group flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 transition-all hover:border-[#f97316] hover:bg-orange-50">
                      <span className="text-sm font-medium text-gray-700 group-hover:text-[#f97316]">{pkg.title}</span>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-[#f97316]" />
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-5">
            <div className="sticky top-28 rounded-2xl border border-gray-100 bg-white p-7">
              <h3 className="mb-2 text-lg font-bold text-gray-900">Book This Package</h3>
              <p className="mb-3 text-sm text-gray-500">Contact our team to confirm availability and finalise your booking.</p>
              {selectedLocation ? <p className="mb-5 rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-[#f97316]">Location: {selectedLocation}</p> : null}
              <Link href={contactHref} className="mb-3 block w-full rounded-xl bg-[#f97316] py-3 text-center font-semibold text-white transition-colors hover:bg-[#ea580c]">Book Now</Link>
              <Link href={contactHref} className="block w-full rounded-xl border border-[#f97316] py-3 text-center font-semibold text-[#f97316] transition-colors hover:bg-orange-50">Request Quote</Link>
              <div className="mt-6 space-y-3 border-t border-gray-100 pt-5">
                <a href="tel:+919810097323" className="flex items-center gap-3 text-sm text-gray-600 transition-colors hover:text-[#f97316]"><Phone size={16} className="text-[#f97316]" />+91 98100 97323</a>
                <a href="mailto:thlim@kilindia.in" className="flex items-center gap-3 text-sm text-gray-600 transition-colors hover:text-[#f97316]"><Mail size={16} className="text-[#f97316]" />thlim@kilindia.in</a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
