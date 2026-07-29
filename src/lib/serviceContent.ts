import type { CatalogService } from "./catalog";

export type ServiceDetailContent = {
  title: string;
  description: string;
  overview: string;
  highlights: string[];
  process: string[];
  bestFor: string[];
};

export const SERVICE_DETAIL_CONTENT: Record<string, ServiceDetailContent> = {
  "booth-reservation": {
    title: "Booth Reservation",
    description: "Reserve exhibition space at Yashobhoomi with HOI managing availability, coordination, and booking support.",
    overview: "Booth Reservation is the starting point for every exhibition journey. HOI helps clients secure the right space at Yashobhoomi, align the booking with event objectives, and keep the reservation process clear and coordinated.",
    highlights: [
      "Space selection and booking support",
      "Venue coordination for Yashobhoomi",
      "Reservation guidance for exhibitors",
      "Booking aligned to event timelines",
    ],
    process: [
      "Review your exhibition requirement and target area.",
      "Select the best booth size and layout alignment.",
      "Confirm the reservation and hand over the booking details.",
      "Move into design, logistics, and execution planning.",
    ],
    bestFor: [
      "First-time exhibitors",
      "Teams booking Yashobhoomi space",
      "Brands needing end-to-end assistance",
    ],
  },
  "booth-design": {
    title: "Booth Design",
    description: "Create a strong exhibition identity with booth layouts tailored for visibility, flow, and brand impact.",
    overview: "Booth Design turns exhibition space into a branded experience. HOI plans the layout, visitor movement, display zones, and finishing details so the booth feels cohesive and practical on the show floor.",
    highlights: [
      "Concept and space planning",
      "Brand-led visual styling",
      "Visitor flow and engagement layout",
      "Design support for compact and large booths",
    ],
    process: [
      "Share your brand and exhibition objectives.",
      "Review the layout direction and design elements.",
      "Approve the final booth concept.",
      "Prepare the design for production and installation.",
    ],
    bestFor: [
      "Product launches",
      "Custom exhibition booths",
      "Brands seeking stronger visual presence",
    ],
  },
  "booth-install-demolition": {
    title: "Booth Install & Demolition",
    description: "Manage installation, supervision, and teardown with disciplined execution around the event schedule.",
    overview: "Booth Install & Demolition covers the physical build and dismantling of the booth. HOI coordinates the on-ground team so installation happens on time, safely, and without unnecessary disruption.",
    highlights: [
      "On-site installation supervision",
      "Safe teardown and clearance",
      "Execution aligned to venue rules",
      "Schedule-aware deployment",
    ],
    process: [
      "Finalize design and installation requirements.",
      "Coordinate materials, manpower, and access windows.",
      "Install the booth at the venue on schedule.",
      "Demolish and clear the site after the event.",
    ],
    bestFor: [
      "Complex booths",
      "Short setup windows",
      "Teams wanting one execution partner",
    ],
  },
  logistics: {
    title: "Logistics Services",
    description: "Coordinate movement, handling, and material support for smooth exhibition delivery.",
    overview: "Logistics Services ensure that the right materials arrive at the right time. HOI coordinates transport, handling, and movement so booths and supporting assets reach the venue without stress.",
    highlights: [
      "Transport and movement planning",
      "Material handling coordination",
      "Venue delivery support",
      "Setup and return logistics",
    ],
    process: [
      "List the materials and shipment needs.",
      "Plan the delivery schedule and access points.",
      "Coordinate arrival, handling, and transfer.",
      "Manage return movement after the exhibition.",
    ],
    bestFor: [
      "Exhibitors with physical assets",
      "Teams shipping booth materials",
      "Events with time-sensitive logistics",
    ],
  },
  marketing: {
    title: "Marketing Services",
    description: "Promote the exhibition presence before the event with brand-focused marketing support.",
    overview: "Marketing Services help a booth attract the right attention before the event even begins. HOI supports visibility, promotional touchpoints, and exhibition marketing work that complements on-ground activity.",
    highlights: [
      "Pre-event promotion support",
      "Brand visibility planning",
      "Exhibition campaign coordination",
      "Audience engagement support",
    ],
    process: [
      "Define campaign goals and audience.",
      "Set the message and promotion plan.",
      "Launch the campaign and track response.",
      "Refine visibility around the event schedule.",
    ],
    bestFor: [
      "Brands launching at exhibitions",
      "Teams needing awareness before the show",
      "Exhibitors wanting stronger lead generation",
    ],
  },
  "interpretation-protocol": {
    title: "Interpretation & Protocol",
    description: "Support visitors, delegates, and executives with language and protocol coordination.",
    overview: "Interpretation & Protocol keeps communication smooth and professional. HOI arranges language support, guest handling, and protocol assistance so exhibitors can focus on conversations, not coordination gaps.",
    highlights: [
      "Language support for meetings",
      "Visitor and delegate assistance",
      "Protocol coordination",
      "Professional on-ground support",
    ],
    process: [
      "Share the event language and protocol needs.",
      "Match the right support team to the event.",
      "Coordinate delegate handling and communication.",
      "Maintain smooth assistance during the event.",
    ],
    bestFor: [
      "International exhibitors",
      "VIP visitor handling",
      "Delegations and formal meetings",
    ],
  },
};

export const SERVICE_SLUGS = Object.keys(SERVICE_DETAIL_CONTENT);

export function getServiceDetailContent(service: CatalogService | undefined) {
  if (!service) return undefined;
  return SERVICE_DETAIL_CONTENT[service.id];
}
