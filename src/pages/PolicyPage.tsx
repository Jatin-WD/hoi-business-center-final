import { Link } from "wouter";
import HeroSection from "@/components/common/HeroSection";
import CTABanner from "@/components/common/CTABanner";

type PolicyType = "privacy" | "terms" | "support";

const content = {
  privacy: {
    title: "Privacy Policy",
    description: "How HOI Business Center collects, stores, and uses website and requirement data.",
    sections: [
      ["Information We Collect", "We collect account details, contact information, company details, service requirements, booking details, manpower application details, and uploaded documents submitted through this website."],
      ["How We Use Data", "Your information is used to respond to inquiries, manage bookings, review manpower applications, send service notifications, and improve exhibition support operations."],
      ["Data Storage", "Website data is stored in the configured PostgreSQL project database."],
      ["Contact", "For privacy questions, contact thlim@kilindia.in or call +91 98100 97323."],
    ],
  },
  terms: {
    title: "Terms of Service",
    description: "Terms for using HOI Business Center website, services, booking inquiries, and manpower applications.",
    sections: [
      ["Service Requests", "Website submissions are treated as inquiries until the HOI team confirms pricing, scope, availability, and commercial terms in writing."],
      ["User Accounts", "Users must provide accurate contact information and keep login credentials secure. HOI may contact users for verification or service coordination."],
      ["Bookings and Applications", "Booking and manpower application decisions depend on venue availability, event schedules, role requirements, and internal review."],
      ["Support", "For help with services, login, submissions, or account access, use the support page or contact the team directly."],
    ],
  },
  support: {
    title: "Support",
    description: "Get help with accounts, service inquiries, bookings, manpower applications, and website data.",
    sections: [
      ["Phone", "+91 98100 97323"],
      ["Email", "thlim@kilindia.in"],
      ["Primary Location", "Yashobhoomi, Dwarka, New Delhi, India"],
      ["Support Hours", "Our team responds to website inquiries and application requests during working days."],
    ],
  },
} satisfies Record<PolicyType, { title: string; description: string; sections: string[][] }>;

export default function PolicyPage({ type }: { type: PolicyType }) {
  const page = content[type];
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection breadcrumbs={[{ label: "Home", href: "/" }, { label: page.title }]} title={page.title} description={page.description} />
      <main className="mx-auto max-w-4xl px-6 py-12 sm:px-8">
        <div className="space-y-5 rounded-lg border border-gray-100 bg-white p-8 shadow-sm">
          {page.sections.map(([title, body]) => (
            <section key={title}>
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
              <p className="mt-2 leading-relaxed text-gray-600">{body}</p>
            </section>
          ))}
          <Link href="/contact" className="inline-flex rounded-lg bg-[#f97316] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#ea580c]">Contact Support</Link>
        </div>
      </main>
      <div className="mx-auto max-w-[1600px] px-8 pb-10">
        <CTABanner title="Need direct help?" description="Share your requirement with the HOI team and we will respond with next steps." primaryLabel="Contact Us" primaryHref="/contact" secondaryLabel="Browse Services" secondaryHref="/service" />
      </div>
    </div>
  );
}
