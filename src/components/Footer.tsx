import { Link } from "wouter";

const hoiLogo = "/assets/hoi.png";

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-zinc-200 border-t border-white/10">
      <div className="mx-auto max-w-[1600px] px-8 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <img src={hoiLogo} alt="HOI Business Center Logo" className="mb-4 h-14 w-auto logo" />
            <p className="text-sm leading-relaxed text-zinc-400">
              HOI Business Center provides end-to-end exhibition and event services including booth reservation, design,
              installation, logistics, marketing, interpretation, and manpower services.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Services</h4>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li><Link href="/service/booth-reservation" className="transition-colors hover:text-[#f97316]">Booth Reservation</Link></li>
              <li><Link href="/service/booth-design" className="transition-colors hover:text-[#f97316]">Booth Design</Link></li>
              <li><Link href="/service/booth-install-demolition" className="transition-colors hover:text-[#f97316]">Booth Install & Demolition</Link></li>
              <li><Link href="/service/logistics" className="transition-colors hover:text-[#f97316]">Logistics Services</Link></li>
              <li><Link href="/service/marketing" className="transition-colors hover:text-[#f97316]">Marketing Services</Link></li>
              <li><Link href="/service/interpretation-protocol" className="transition-colors hover:text-[#f97316]">Interpretation & Protocol</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Company</h4>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li><Link href="/about/hoi" className="transition-colors hover:text-[#f97316]">About HOI</Link></li>
              <li><Link href="/yashobhoomi" className="transition-colors hover:text-[#f97316]">Role of HOI at Yashobhoomi</Link></li>
              <li><Link href="/event-calendar" className="transition-colors hover:text-[#f97316]">Event Calendar</Link></li>
              <li><Link href="/apply-manpower" className="transition-colors hover:text-[#f97316]">Apply for Man Power</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-[#f97316]">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Get in Touch</h4>
            <div className="space-y-3 text-sm text-zinc-400">
              <p>
                <span className="mb-0.5 block font-medium text-white">Address</span>
                Yashobhoomi, Dwarka, New Delhi, India
              </p>
              <p>
                <span className="mb-0.5 block font-medium text-white">Phone</span>
                +91 98100 97323
              </p>
              <p>
                <span className="mb-0.5 block font-medium text-white">Email</span>
                thlim@kilindia.in
              </p>
            </div>
            <Link
              href="/contact"
              className="mt-5 inline-block rounded-lg bg-[#f97316] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#ea580c]"
              data-testid="footer-cta"
            >
              Book a Service
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-zinc-500 md:flex-row">
          <p>Copyright 2026 HOI Business Center. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="transition-colors hover:text-[#f97316]">Privacy Policy</Link>
            <Link href="/terms-of-service" className="transition-colors hover:text-[#f97316]">Terms of Service</Link>
            <Link href="/support" className="transition-colors hover:text-[#f97316]">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
