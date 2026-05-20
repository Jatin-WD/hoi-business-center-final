import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ChevronRight, Calendar, MapPin } from "lucide-react";
import { apiClient } from "@/lib/api-client";

const LOCATIONS = [
  { id: "all", label: "All Locations" },
  { id: "yashobhoomi", label: "Yashobhoomi" },
  { id: "delhi", label: "Delhi" },
  { id: "mumbai", label: "Mumbai" },
  { id: "pune", label: "Pune" },
  { id: "chennai", label: "Chennai" },
  { id: "bangalore", label: "Bangalore" },
  { id: "hyderabad", label: "Hyderabad" },
  { id: "kolkata", label: "Kolkata" },
  { id: "ahmedabad", label: "Ahmedabad" },
  { id: "kochi", label: "Kochi" },
  { id: "chandigarh", label: "Chandigarh" },
  { id: "jaipur", label: "Jaipur" },
];

export default function EventCalendarPage() {
  const [activeLocation, setActiveLocation] = useState("all");
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    apiClient.getEvents().then((response) => {
      if (mounted && response.data.events?.length) {
        setEvents(response.data.events.map((event: any) => ({ ...event, locationId: event.locationId || event.location_id })));
      }
    }).catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  const filtered =
    activeLocation === "all"
      ? events
      : events.filter((e) => e.locationId === activeLocation);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0f2460] to-[#1a3a8f] text-white py-14 px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center gap-2 text-blue-200 text-sm mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">Event Calendar</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">Event Calendar</h1>
          <p className="text-blue-200 max-w-xl">
            Browse upcoming exhibitions and trade fairs across India where HOI Business Center provides services.
          </p>
        </div>
      </div>

      {/* Location Filter Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-[92px] z-40">
        <div className="max-w-[1600px] mx-auto px-8">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {LOCATIONS.map((loc) => (
              <button
                key={loc.id}
                onClick={() => setActiveLocation(loc.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  activeLocation === loc.id
                    ? "bg-[#1a3a8f] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-[#1a3a8f]"
                }`}
                data-testid={`filter-${loc.id}`}
              >
                {loc.id !== "all" && <MapPin size={11} />}
                {loc.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeLocation === loc.id ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  {loc.id === "all" ? events.length : events.filter((e) => e.locationId === loc.id).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="max-w-[1600px] mx-auto px-8 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Calendar size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No events found for this location</p>
            <button
              onClick={() => setActiveLocation("all")}
              className="mt-3 text-[#1a3a8f] text-sm hover:underline"
            >
              View all events
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">
              Showing <span className="font-semibold text-gray-800">{filtered.length}</span> event{filtered.length !== 1 ? "s" : ""}
              {activeLocation !== "all" && (
                <> at <span className="font-semibold text-[#1a3a8f]">{LOCATIONS.find((l) => l.id === activeLocation)?.label}</span></>
              )}
            </p>
            <div className="space-y-4">
              {filtered.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-[#1a3a8f] hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center gap-5"
                  data-testid={`event-card-${event.id}`}
                >
                  <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Calendar size={24} className="text-[#1a3a8f]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{event.name}</h3>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                          <span>{event.date}</span>
                          <span className="text-gray-300">Â·</span>
                          <MapPin size={12} className="text-gray-400" />
                          <span>{event.venue}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                        <span className="px-3 py-1 bg-blue-50 text-[#1a3a8f] text-xs font-semibold rounded-full">{event.category}</span>
                        <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">{event.status}</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/contact"
                    className="bg-[#1a3a8f] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#152e75] transition-colors flex-shrink-0"
                  >
                    Book Booth
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

