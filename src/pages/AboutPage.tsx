import { Link } from "wouter";
import { ChevronRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#0f2460] to-[#1a3a8f] text-white py-14 px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center gap-2 text-blue-200 text-sm mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">About Us</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">About HOI</h1>
          <p className="text-blue-200 max-w-xl">
            Learn about our mission, values, and our role at India's premier business and exhibition center.
          </p>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-14">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Who We Are</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                HOI Business Center is the premier exhibition and event services provider at Yashobhoomi — India's largest MICE (Meetings, Incentives, Conferences & Exhibitions) venue, located in Dwarka, New Delhi.
              </p>
              <p>
                Our team of seasoned professionals provides comprehensive end-to-end services for exhibitors, ensuring that every aspect of your exhibition journey — from initial booth reservation to final demolition — is handled with expertise and care.
              </p>
              <p>
                With operations extending to Dubai and other major cities, we bring global exhibition experience to every engagement.
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#1a3a8f] to-[#0f2460] rounded-2xl p-8 text-white">
            <h3 className="text-xl font-bold mb-6">Our Core Values</h3>
            <div className="space-y-4">
              {[
                { title: "Excellence", desc: "We deliver the highest standards in every service." },
                { title: "Reliability", desc: "Your timeline is our commitment. We never miss a deadline." },
                { title: "Innovation", desc: "Creative booth designs and marketing strategies that stand out." },
                { title: "Partnership", desc: "We treat every client as a long-term partner, not a transaction." },
              ].map((v, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">{v.title}</p>
                    <p className="text-blue-200 text-sm mt-0.5">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Services Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "Booth Reservation",
              "Booth Design",
              "Booth Install & Demolition",
              "Logistics Services",
              "Marketing Services",
              "Interpretation & Protocol",
              "Man Power Services",
              "Event Calendar Management",
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
                <div className="w-2 h-2 rounded-full bg-[#1a3a8f]" />
                <span className="text-sm text-gray-700 font-medium">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
