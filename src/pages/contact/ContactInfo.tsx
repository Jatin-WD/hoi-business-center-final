import { Mail, MapPin, Phone } from "lucide-react";

export function ContactInfo() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 text-lg mb-5">Get in Touch</h2>
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
    <a href={href} className="text-[#1a3a8f] text-sm mt-0.5 hover:underline">{text}</a>
  ) : (
    <p className="text-gray-500 text-sm mt-0.5">{text}</p>
  );

  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
        <Icon size={18} className="text-[#1a3a8f]" />
      </div>
      <div>
        <p className="font-semibold text-gray-800 text-sm">{label}</p>
        {content}
      </div>
    </div>
  );
}

function BusinessHours() {
  return (
    <div className="bg-[#1a3a8f] rounded-2xl p-6 text-white">
      <h3 className="font-bold text-lg mb-3">Business Hours</h3>
      <div className="space-y-2 text-sm text-blue-100">
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
      <span className="text-white font-medium">{time}</span>
    </div>
  );
}
