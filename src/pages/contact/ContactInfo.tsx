import { Mail, MapPin, Phone } from "lucide-react";

export function ContactInfo() {
  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-black text-slate-900">Get in Touch</h2>
        <div className="space-y-5">
          <ContactItem icon={MapPin} label="Office Address" text="Yashobhoomi, Dwarka, New Delhi, India" />
          <ContactItem icon={Phone} label="Phone" text="+91 98100 97323" href="tel:+919810097323" />
          <ContactItem icon={Mail} label="Email" text="thlim@kilindia.in" href="mailto:thlim@kilindia.in" />
        </div>
      </div>
      <BusinessHours />
    </div>
  );
}

function ContactItem({ icon: Icon, label, text, href }: { icon: typeof Mail; label: string; text: string; href?: string }) {
  const content = href ? (
    <a href={href} className="mt-0.5 text-sm font-medium text-[color:var(--hoi-primary)] hover:underline">{text}</a>
  ) : (
    <p className="mt-0.5 text-sm text-slate-500">{text}</p>
  );

  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--hoi-primary)]/10 text-[color:var(--hoi-primary)] ring-1 ring-[color:var(--hoi-primary)]/10">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {content}
      </div>
    </div>
  );
}

function BusinessHours() {
  return (
    <div className="rounded-[1.75rem] bg-[#111111] p-6 text-white shadow-sm">
      <h3 className="mb-3 text-lg font-black">Business Hours</h3>
      <div className="space-y-2 text-sm text-white/80">
        <HourRow day="Monday - Friday" time="9:00 AM - 6:00 PM" />
        <HourRow day="Saturday" time="10:00 AM - 4:00 PM" />
        <HourRow day="Sunday" time="Closed" />
      </div>
    </div>
  );
}

function HourRow({ day, time }: { day: string; time: string }) {
  return (
    <div className="flex justify-between">
      <span>{day}</span>
      <span className="font-medium text-white">{time}</span>
    </div>
  );
}
