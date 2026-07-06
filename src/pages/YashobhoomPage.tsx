import { Link } from "wouter";
import { ChevronRight, Building2, Users, Globe, Award } from "lucide-react";

export default function YashobhoomiPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0f2460] to-[#1a3a8f] text-white py-16 px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center gap-2 text-blue-200 text-sm mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">Yashobhoomi</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">Yashobhoomi</h1>
          <p className="text-xl text-yellow-300 font-semibold mb-3">
            India International Convention &amp; Expo Centre
          </p>
          <p className="text-blue-200 max-w-2xl">
            India's largest and most modern MICE destination located in Dwarka, New Delhi — and HOI Business Center is its official service partner.
          </p>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 py-14">

        {/* Role of HOI */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Role of HOI at Yashobhoomi</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                HOI Business Center serves as the <strong>official service partner at Yashobhoomi</strong> — India's premiere convention and exhibition facility. Our role encompasses every aspect of exhibitor support within the venue.
              </p>
              <p>
                As the designated HOI partner, we have exclusive access and established processes that allow us to serve exhibitors more efficiently than any other vendor. We bring pre-approved layouts, recognized vendor credentials, and deep-rooted venue relationships built over years of collaboration.
              </p>
              <p>
                From the moment an exhibitor reserves their booth space to the final demolition and clearance, HOI is present — coordinating, problem-solving, and ensuring everything runs according to schedule. We are the single point of contact for all exhibition support needs.
              </p>
            </div>
            <div className="mt-8 flex gap-3 flex-wrap">
              <Link
                href="/service/yashobhoomi"
                className="inline-block bg-[#1a3a8f] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#152e75] transition-colors"
              >
                View Services at Yashobhoomi
              </Link>
              <Link
                href="/contact"
                className="inline-block border border-[#1a3a8f] text-[#1a3a8f] px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>

          <div className="space-y-5">
            <img
              src="/assets/yashobhoomi.png"
              alt="Yashobhoomi Convention Centre"
              className="w-full h-60 object-cover rounded-2xl shadow-md"
            />
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Total Area", value: "89,000 sq m" },
                { label: "Exhibition Halls", value: "12 Halls" },
                { label: "Capacity", value: "11,000+ delegates" },
                { label: "Location", value: "Dwarka, New Delhi" },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-[#1a3a8f] transition-colors">
                  <p className="text-2xl font-bold text-[#1a3a8f]">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What HOI provides */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">What HOI Provides at Yashobhoomi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Building2,
                title: "Booth Services",
                desc: "Reservation, design, fabrication, installation and demolition — end-to-end booth management from a single partner.",
              },
              {
                icon: Globe,
                title: "Logistics & Freight",
                desc: "Inward and outward cargo handling, customs clearance assistance, bonded warehousing, and on-site freight movement.",
              },
              {
                icon: Users,
                title: "Exhibition Staff",
                desc: "Trained interpreters, protocol officers, information desk executives, and guide staff fluent in multiple languages.",
              },
              {
                icon: Award,
                title: "Marketing & Hotels",
                desc: "Pre-event digital promotions, signage, branded materials, hotel room blocks, and transportation arrangements.",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-[#1a3a8f] transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  <item.icon size={22} className="text-[#1a3a8f]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#0f2460] to-[#1a3a8f] rounded-3xl p-10 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to exhibit at Yashobhoomi?</h2>
          <p className="text-blue-200 mb-6 max-w-xl mx-auto">
            Let HOI Business Center handle every detail of your exhibition — from booth booking to teardown.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/service/yashobhoomi"
              className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-yellow-300 transition-colors"
            >
              Explore Services
            </Link>
            <Link
              href="/contact"
              className="border border-white/40 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
