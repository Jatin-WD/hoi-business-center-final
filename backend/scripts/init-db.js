import { initDatabase } from '../config/database.js';
import { pathToFileURL } from 'url';

async function upsertByKeys(db, table, keys, values) {
  const where = keys.map((key) => `${key} = ?`).join(' AND ');
  const existing = await db.get(`SELECT id FROM ${table} WHERE ${where}`, keys.map((key) => values[key]));
  const columns = Object.keys(values);
  if (existing) {
    const nonKeyColumns = columns.filter((column) => !keys.includes(column));
    const setClause = nonKeyColumns.map((column) => `${column} = ?`).join(', ');
    await db.run(
      `UPDATE ${table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE ${where}`,
      [...nonKeyColumns.map((column) => values[column]), ...keys.map((key) => values[key])]
    );
    return;
  }
  await db.run(
    `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
    columns.map((column) => values[column])
  );
}

// Import data from frontend
const SERVICE_PACKAGES = {
  "booth-reservation": {
    id: "booth-reservation",
    label: "Booth Reservation",
    packages: [
      { label: "Compact Size 6' x 6' ft (36 sq ft)", href: "/packages/booth-reservation/compact" },
      { label: "Standard Size 6' x 9' ft (54 sq ft)", href: "/packages/booth-reservation/standard" },
      { label: "Premium Size 10' x 10' ft (100 sq ft)", href: "/packages/booth-reservation/premium" },
      { label: "Executive 16' x 20' ft (380 sq ft)", href: "/packages/booth-reservation/executive" },
      { label: "Custom Size", href: "/packages/booth-reservation/custom" },
    ],
  },
  "booth-design": {
    id: "booth-design",
    label: "Booth Design",
    packages: [
      { label: "Essential Design", href: "/packages/booth-design/essential" },
      { label: "Professional Design", href: "/packages/booth-design/professional" },
      { label: "Premium Design", href: "/packages/booth-design/premium" },
      { label: "Luxury Design", href: "/packages/booth-design/luxury" },
      { label: "Custom Design", href: "/packages/booth-design/custom" },
    ],
  },
  "booth-install-demolition": {
    id: "booth-install-demolition",
    label: "Booth Install & Demolition",
    packages: [
      { label: "Basic Installation", href: "/packages/booth-install-demolition/basic" },
      { label: "Standard Installation", href: "/packages/booth-install-demolition/standard" },
      { label: "Premium Installation", href: "/packages/booth-install-demolition/premium" },
      { label: "Deluxe Installation", href: "/packages/booth-install-demolition/deluxe" },
    ],
  },
  "logistics": {
    id: "logistics",
    label: "Logistics Services",
    packages: [
      { label: "Basic Logistics Package", href: "/packages/logistics/basic" },
      { label: "Standard Logistics Package", href: "/packages/logistics/standard" },
      { label: "Premium Logistics Package", href: "/packages/logistics/premium" },
      { label: "Full Freight Management", href: "/packages/logistics/freight" },
    ],
  },
  "marketing": {
    id: "marketing",
    label: "Marketing Services",
    packages: [
      { label: "Basic Marketing Package", href: "/packages/marketing/basic" },
      { label: "Digital Marketing Package", href: "/packages/marketing/digital" },
      { label: "Premium Marketing Package", href: "/packages/marketing/premium" },
      { label: "Full Marketing Campaign", href: "/packages/marketing/campaign" },
    ],
  },
  "interpretation-protocol": {
    id: "interpretation-protocol",
    label: "Interpretation & Protocol Services",
    packages: [
      { label: "Basic Interpretation", href: "/packages/interpretation-protocol/basic" },
      { label: "Professional Interpretation", href: "/packages/interpretation-protocol/professional" },
      { label: "VIP Protocol Services", href: "/packages/interpretation-protocol/vip" },
      { label: "Full Protocol Management", href: "/packages/interpretation-protocol/management" },
    ],
  },
  "no-show-space": {
    id: "no-show-space",
    label: "No Show Space Booking",
    packages: [
      { label: "Basic No-Show Space", href: "/packages/no-show-space/basic" },
      { label: "Premium No-Show Space", href: "/packages/no-show-space/premium" },
    ],
  },
  "manpower": {
    id: "manpower",
    label: "Apply for Man Power Service",
    packages: [
      { label: "Individual Application", href: "/manpower" },
    ],
  },
  "other": {
    id: "other",
    label: "Other",
    packages: [
      { label: "Custom Service", href: "/contact" },
    ],
  },
};

const VENUE_DETAILS = [
  {
    locationId: "yashobhoomi",
    subVenueId: "iicc-dwarka",
    name: "Yashobhoomi, India International Convention and Expo Centre",
    address: "Sector 25, Dwarka, New Delhi - 110061",
    city: "New Delhi",
    state: "Delhi",
    description: "Yashobhoomi is the priority HOI service venue for exhibition support, booth services, logistics, marketing, interpretation, and manpower.",
    about: "Yashobhoomi, also known as India International Convention and Expo Centre, is the primary HOI service location in Dwarka, New Delhi. It supports large exhibitions, trade shows, conferences, and business events with modern halls and convention facilities.",
    totalArea: "India's largest MICE destination",
    halls: "Exhibition and convention halls",
    capacity: "Large-scale exhibitions and business events",
    established: "2023",
    website: "https://www.yashobhoomi.org/",
    specialities: ["Priority HOI Venue", "Exhibition Services", "Convention Centre", "Business Events"],
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80",
  },
  {
    locationId: "delhi",
    subVenueId: "pragati-maidan",
    name: "Pragati Maidan (ITPO)",
    address: "Bhairon Marg, Pragati Maidan, New Delhi – 110001",
    city: "New Delhi",
    state: "Delhi",
    description: "India's largest and most iconic exhibition ground, managed by the India Trade Promotion Organisation (ITPO).",
    about: "Pragati Maidan has been the heart of India's trade exhibition ecosystem since its establishment. Spanning 123 acres, it hosts hundreds of national and international exhibitions every year. The venue underwent a massive ₹2,700 crore redevelopment — now known as IITPC — featuring world-class convention facilities, underground parking, and modern infrastructure.",
    totalArea: "123 acres",
    halls: "14 Halls",
    capacity: "50,000+ visitors/day",
    established: "1972",
    specialities: ["International Trade Fairs", "Government Pavilions", "ITPO Managed Events", "Underground Connectivity to Delhi Metro"],
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
  },
  {
    locationId: "delhi",
    subVenueId: "nsic",
    name: "NSIC Exhibition Grounds, Okhla",
    address: "NSIC Complex, Okhla Industrial Estate, New Delhi – 110020",
    city: "New Delhi",
    state: "Delhi",
    description: "NSIC's exhibition grounds are a key venue for SME-focused trade fairs and government exhibitions in Delhi.",
    about: "The National Small Industries Corporation (NSIC) Exhibition Complex in Okhla is a dedicated space for SME development and trade promotion. It regularly hosts sector-specific exhibitions focused on manufacturing, technology, and engineering — providing a cost-effective platform for small and medium enterprises.",
    totalArea: "20 acres",
    halls: "5 Halls",
    capacity: "10,000+ visitors",
    established: "1980",
    specialities: ["SME Trade Fairs", "Government B2B Exhibitions", "Manufacturing Sector Expos"],
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80",
  },
  {
    locationId: "mumbai",
    subVenueId: "bombay-exhibition-centre",
    name: "Bombay Exhibition Centre",
    address: "Western Express Highway, Goregaon East, Mumbai – 400063",
    city: "Mumbai",
    state: "Maharashtra",
    description: "Mumbai's premier exhibition and convention center, known for hosting international trade shows and corporate events.",
    about: "The Bombay Exhibition Centre (BEC) is Mumbai's largest and most modern exhibition venue. With over 50,000 sq m of exhibition space across multiple halls, it serves as the gateway for international trade in Western India. The center features state-of-the-art facilities, advanced AV equipment, and comprehensive event management services.",
    totalArea: "50,000 sq m",
    halls: "8 Halls",
    capacity: "25,000+ visitors",
    established: "1978",
    specialities: ["International Trade Shows", "Corporate Events", "Product Launches", "Fashion Weeks"],
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80",
  },
  {
    locationId: "mumbai",
    subVenueId: "mmrda-grounds",
    name: "MMRDA Exhibition Grounds",
    address: "Bandra Kurla Complex, Bandra East, Mumbai – 400051",
    city: "Mumbai",
    state: "Maharashtra",
    description: "MMRDA's exhibition grounds in Bandra Kurla Complex, ideal for large-scale exhibitions and outdoor events.",
    about: "The Mumbai Metropolitan Region Development Authority (MMRDA) Exhibition Grounds in Bandra Kurla Complex offer extensive outdoor and indoor exhibition spaces. Located in Mumbai's business district, it provides excellent connectivity and modern infrastructure for large-scale exhibitions, cultural events, and trade fairs.",
    totalArea: "100 acres",
    halls: "6 Halls + Outdoor Space",
    capacity: "30,000+ visitors",
    established: "1995",
    specialities: ["Large-scale Exhibitions", "Cultural Events", "Outdoor Trade Fairs", "Automotive Shows"],
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80",
  },
  {
    locationId: "bangalore",
    subVenueId: "bengaluru-international-exhibition-centre",
    name: "Bengaluru International Exhibition Centre (BIEC)",
    address: "10th Mile, Tumkur Road, Madavara, Bengaluru – 562123",
    city: "Bengaluru",
    state: "Karnataka",
    description: "Karnataka's largest exhibition center, featuring modern facilities and extensive exhibition space.",
    about: "The Bengaluru International Exhibition Centre (BIEC) is Karnataka's premier exhibition venue, spanning 25 acres with over 20,000 sq m of indoor exhibition space. It serves as the hub for trade exhibitions, conferences, and business events in South India, offering world-class facilities and comprehensive event management services.",
    totalArea: "25 acres",
    halls: "6 Halls",
    capacity: "15,000+ visitors",
    established: "1997",
    specialities: ["Technology Exhibitions", "IT & Software Events", "Engineering Expos", "Medical & Healthcare Shows"],
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
  },
  {
    locationId: "chennai",
    subVenueId: "chennai-trade-centre",
    name: "Chennai Trade Centre",
    address: "Mount Poonamalle Road, Nandambakkam, Chennai – 600089",
    city: "Chennai",
    state: "Tamil Nadu",
    description: "Chennai's modern exhibition and convention center, equipped with advanced facilities for trade shows and corporate events.",
    about: "The Chennai Trade Centre is a state-of-the-art exhibition venue in South Chennai, featuring 15,000 sq m of exhibition space across multiple halls. It specializes in trade exhibitions, conferences, and corporate events, providing comprehensive event management and modern amenities.",
    totalArea: "15,000 sq m",
    halls: "4 Halls",
    capacity: "8,000+ visitors",
    established: "2001",
    specialities: ["Trade Exhibitions", "Corporate Conferences", "Automotive Shows", "Manufacturing Expos"],
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80",
  },
  {
    locationId: "hyderabad",
    subVenueId: "hitex-exhibition-centre",
    name: "HITEX Exhibition Centre",
    address: "Izzat Nagar, Kothaguda, Hyderabad – 500084",
    city: "Hyderabad",
    state: "Telangana",
    description: "Hyderabad's premier exhibition center, known for hosting international exhibitions and conferences.",
    about: "The Hyderabad International Trade Exposition Centre (HITEX) is Telangana's largest exhibition venue, offering 20,000 sq m of exhibition space. It serves as the primary venue for international trade shows, conferences, and business events in South Central India.",
    totalArea: "20,000 sq m",
    halls: "5 Halls",
    capacity: "10,000+ visitors",
    established: "2003",
    specialities: ["International Trade Shows", "IT & Technology Events", "Pharma Exhibitions", "Engineering Expos"],
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80",
  },
  {
    locationId: "pune",
    subVenueId: "pune-exhibition-centre",
    name: "Pune Exhibition Centre",
    address: "Pune-Mumbai Highway, Pune – 411001",
    city: "Pune",
    state: "Maharashtra",
    description: "Pune's dedicated exhibition center for trade shows and business events.",
    about: "The Pune Exhibition Centre is a modern facility designed for trade exhibitions and corporate events. With multiple halls and extensive outdoor space, it caters to various industries including manufacturing, technology, and automotive sectors.",
    totalArea: "12,000 sq m",
    halls: "3 Halls",
    capacity: "6,000+ visitors",
    established: "2005",
    specialities: ["Manufacturing Exhibitions", "Technology Shows", "Automotive Events", "Education Fairs"],
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
  },
];

const PACKAGE_DETAILS = {
  "booth-reservation": {
    compact: {
      title: "Compact Booth — 6' × 6' (36 sq ft)",
      subtitle: "Booth Reservation",
      price: "Contact for Pricing",
      priceNote: "Price varies by event and venue. Request a personalised quote.",
      description: "Our Compact booth package is ideal for small businesses or startups looking to make their presence felt at major exhibitions without a large footprint. The 36 sq ft space is efficiently designed to maximize visibility.",
      includes: ["Booth space allocation (36 sq ft)", "Standard carpet flooring", "1 Information counter", "2 Folding chairs", "Basic lighting (2 spotlights)", "Fascia name board (company name)", "1 Power socket (5A)", "Visitor Wi-Fi access"],
      notIncludes: ["Booth design or fabrication", "Additional furniture", "Marketing materials", "Extra power sockets", "Storage area"],
      duration: "Duration of the exhibition event",
    },
    standard: {
      title: "Standard Booth — 6' × 9' (54 sq ft)",
      subtitle: "Booth Reservation",
      price: "Contact for Pricing",
      priceNote: "Price varies by event and venue. Request a personalised quote.",
      description: "The Standard booth provides a comfortable 54 sq ft space, suitable for SMEs looking to present products and engage visitors effectively. Comes with additional furnishing and display options.",
      includes: ["Booth space allocation (54 sq ft)", "Premium carpet flooring", "1 Information counter with lockable storage", "3 Chairs", "Enhanced lighting (4 spotlights)", "Fascia name board (backlit)", "2 Power sockets (5A + 15A)", "Visitor Wi-Fi access", "1 Product display shelf"],
      notIncludes: ["Booth design or fabrication", "Marketing materials", "TV / AV equipment", "Extra staff"],
      duration: "Duration of the exhibition event",
    },
    premium: {
      title: "Premium Booth — 10' × 10' (100 sq ft)",
      subtitle: "Booth Reservation",
      price: "Contact for Pricing",
      priceNote: "Price varies by event and venue. Request a personalised quote.",
      description: "The Premium booth is perfect for established brands wanting a strong exhibition presence. 100 sq ft allows for a branded environment with product displays, meeting corners, and proper visitor engagement areas.",
      includes: ["Booth space allocation (100 sq ft)", "Premium flooring (choice of carpet or tiles)", "1 Reception counter", "Meeting corner (2 chairs + side table)", "Professional lighting package", "Backlit fascia board (premium print)", "3 Power sockets (mixed)", "Wi-Fi & LAN access", "2 Product display shelves", "1 Lockable storage cabinet"],
      notIncludes: ["Booth design / custom fabrication (available as add-on)", "AV screens", "Marketing materials"],
      duration: "Duration of the exhibition event",
    },
    executive: {
      title: "Executive Booth — 16' × 20' (380 sq ft)",
      subtitle: "Booth Reservation",
      price: "Contact for Pricing",
      priceNote: "Price varies by event and venue. Request a personalised quote.",
      description: "The Executive booth is designed for premium brands and large corporations requiring a commanding presence. 380 sq ft provides ample space for elaborate displays, multiple meeting rooms, and comprehensive visitor engagement.",
      includes: ["Booth space allocation (380 sq ft)", "Premium flooring & carpeting", "Executive reception area", "2 Meeting rooms (4 chairs each)", "Professional lighting & sound system", "Premium backlit fascia board", "Multiple power sockets (15A & 30A)", "High-speed Wi-Fi & LAN", "Multiple display shelves & cabinets", "Dedicated storage area", "VIP lounge area"],
      notIncludes: ["Custom booth design & fabrication", "AV equipment & screens", "Catering services", "Extra staff"],
      duration: "Duration of the exhibition event",
    },
    custom: {
      title: "Custom Booth Size",
      subtitle: "Booth Reservation",
      price: "Contact for Pricing",
      priceNote: "Price varies by event and venue. Request a personalised quote.",
      description: "For unique requirements and special exhibition needs, we offer custom booth sizes tailored to your specific requirements. Our team will work with you to design the perfect space for your exhibition presence.",
      includes: ["Custom booth space allocation", "Flexible furnishing options", "Custom lighting solutions", "Personalized fascia design", "Power requirements assessment", "Wi-Fi & connectivity setup"],
      notIncludes: ["Custom booth fabrication", "Specialized equipment", "Additional services"],
      duration: "Duration of the exhibition event",
    },
  },
  "booth-design": {
    essential: {
      title: "Essential Booth Design",
      subtitle: "Booth Design",
      price: "₹25,000 - ₹50,000",
      priceNote: "Price depends on booth size and complexity.",
      description: "Our Essential booth design package provides a clean, professional look suitable for most exhibition requirements. Includes basic design elements and standard materials.",
      includes: ["Basic design consultation", "2D floor plan", "Standard color scheme", "Basic graphics & branding", "Standard materials (panels, lighting)", "Installation guidance"],
      notIncludes: ["3D visualization", "Premium materials", "Custom fabrication", "Advanced lighting", "AV integration"],
      duration: "2-3 weeks",
    },
    professional: {
      title: "Professional Booth Design",
      subtitle: "Booth Design",
      price: "₹50,000 - ₹1,50,000",
      priceNote: "Price depends on booth size and complexity.",
      description: "The Professional design package offers enhanced aesthetics with premium materials and better visual impact. Ideal for companies wanting to stand out at exhibitions.",
      includes: ["Detailed design consultation", "3D visualization", "Premium color schemes", "Professional graphics & branding", "Quality materials & finishes", "Enhanced lighting design", "Installation supervision"],
      notIncludes: ["Custom fabrication", "AV equipment integration", "Special effects", "Premium materials"],
      duration: "3-4 weeks",
    },
    premium: {
      title: "Premium Booth Design",
      subtitle: "Booth Design",
      price: "₹1,50,000 - ₹4,00,000",
      priceNote: "Price depends on booth size and complexity.",
      description: "Premium booth design combines creativity, functionality, and luxury materials to create a memorable exhibition presence. Perfect for premium brands and high-profile events.",
      includes: ["Comprehensive design consultation", "3D visualization & walkthrough", "Luxury materials & finishes", "Custom graphics & branding", "Advanced lighting & effects", "AV equipment integration", "Full installation service"],
      notIncludes: ["Ultra-premium materials", "Complex special effects", "Custom sculpture work"],
      duration: "4-6 weeks",
    },
    luxury: {
      title: "Luxury Booth Design",
      subtitle: "Booth Design",
      price: "₹4,00,000 - ₹10,00,000+",
      priceNote: "Price depends on booth size and complexity.",
      description: "Our Luxury booth design package offers unparalleled creativity and premium execution. This is for brands that want to make a statement and create an unforgettable exhibition experience.",
      includes: ["VIP design consultation", "Full 3D visualization", "Ultra-premium materials", "Custom fabrication", "Advanced lighting & special effects", "Complete AV integration", "Full project management", "Premium installation & dismantling"],
      notIncludes: ["Extreme custom requests", "One-of-a-kind sculptures"],
      duration: "6-8 weeks",
    },
    custom: {
      title: "Custom Booth Design",
      subtitle: "Booth Design",
      price: "Contact for Pricing",
      priceNote: "Price depends on specific requirements and complexity.",
      description: "For unique and extraordinary booth requirements, our custom design service offers unlimited creativity and bespoke solutions tailored to your vision.",
      includes: ["Unlimited design consultations", "Custom concept development", "Bespoke materials & finishes", "Special effects & innovations", "Complete project customization", "Full technical support"],
      notIncludes: ["Budget constraints apply"],
      duration: "8+ weeks",
    },
  },
  "booth-install-demolition": {
    basic: {
      title: "Basic Installation Service",
      subtitle: "Booth Install & Demolition",
      price: "₹15,000 - ₹30,000",
      priceNote: "Price depends on booth size and complexity.",
      description: "Our Basic installation service provides essential setup and dismantling for standard exhibition booths. Includes basic assembly and standard material handling.",
      includes: ["Basic booth assembly", "Standard panel installation", "Basic lighting setup", "Fascia board mounting", "Standard furniture placement", "Basic dismantling"],
      notIncludes: ["Custom fabrication", "Electrical work", "Heavy equipment handling", "Premium materials"],
      duration: "1-2 days",
    },
    standard: {
      title: "Standard Installation Service",
      subtitle: "Booth Install & Demolition",
      price: "₹30,000 - ₹75,000",
      priceNote: "Price depends on booth size and complexity.",
      description: "The Standard installation package offers professional setup with enhanced services including electrical work and premium material handling.",
      includes: ["Professional booth assembly", "Panel & structure installation", "Electrical connections", "Enhanced lighting setup", "Furniture & display arrangement", "Graphics mounting", "Professional dismantling"],
      notIncludes: ["Custom fabrication", "Heavy machinery", "Specialized equipment"],
      duration: "2-3 days",
    },
    premium: {
      title: "Premium Installation Service",
      subtitle: "Booth Install & Demolition",
      price: "₹75,000 - ₹2,00,000",
      priceNote: "Price depends on booth size and complexity.",
      description: "Premium installation service provides comprehensive setup with specialized equipment, custom fabrication support, and full project management.",
      includes: ["Complete booth assembly", "Custom fabrication installation", "Full electrical setup", "Advanced lighting systems", "AV equipment integration", "Furniture & display setup", "Project management", "Professional dismantling"],
      notIncludes: ["Ultra-specialized installations", "Extreme custom work"],
      duration: "3-5 days",
    },
    deluxe: {
      title: "Deluxe Installation Service",
      subtitle: "Booth Install & Demolition",
      price: "₹2,00,000 - ₹5,00,000+",
      priceNote: "Price depends on booth size and complexity.",
      description: "Our Deluxe installation service offers white-glove treatment with specialized teams, premium equipment, and comprehensive project management for high-profile exhibitions.",
      includes: ["VIP project management", "Specialized installation teams", "Premium equipment & tools", "Complete custom fabrication", "Full electrical & AV setup", "Luxury finishing touches", "24/7 on-site support", "Premium dismantling service"],
      notIncludes: ["Extreme custom requests"],
      duration: "5-7 days",
    },
  },
  "logistics": {
    basic: {
      title: "Basic Logistics Package",
      subtitle: "Logistics Services",
      price: "₹25,000 - ₹50,000",
      priceNote: "Price depends on distance and volume.",
      description: "Our Basic logistics package covers essential transportation and handling needs for exhibition materials and equipment.",
      includes: ["Local transportation", "Basic loading/unloading", "Standard packaging", "Basic insurance coverage", "Documentation support"],
      notIncludes: ["International shipping", "Custom crating", "Express delivery", "Specialized equipment transport"],
      duration: "3-5 days",
    },
    standard: {
      title: "Standard Logistics Package",
      subtitle: "Logistics Services",
      price: "₹50,000 - ₹1,50,000",
      priceNote: "Price depends on distance and volume.",
      description: "The Standard logistics package provides comprehensive transportation solutions with enhanced services and better insurance coverage.",
      includes: ["Domestic transportation", "Professional loading/unloading", "Custom packaging & crating", "Enhanced insurance", "Real-time tracking", "Customs documentation", "Storage solutions"],
      notIncludes: ["International shipping", "Air freight", "Express services"],
      duration: "5-7 days",
    },
    premium: {
      title: "Premium Logistics Package",
      subtitle: "Logistics Services",
      price: "₹1,50,000 - ₹4,00,000",
      priceNote: "Price depends on distance and volume.",
      description: "Premium logistics offers end-to-end solutions with specialized handling, express delivery options, and comprehensive project management.",
      includes: ["Express domestic shipping", "Specialized equipment transport", "Premium packaging & crating", "Comprehensive insurance", "Real-time GPS tracking", "Complete documentation", "Project management", "On-site coordination"],
      notIncludes: ["International air freight", "Ultra-specialized transport"],
      duration: "2-5 days",
    },
    freight: {
      title: "Full Freight Management",
      subtitle: "Logistics Services",
      price: "₹4,00,000 - ₹10,00,000+",
      priceNote: "Price depends on distance and volume.",
      description: "Complete freight management service for complex international and domestic logistics requirements with full project oversight.",
      includes: ["International & domestic shipping", "Air, sea & road freight", "Complete customs clearance", "Specialized cargo handling", "Full insurance coverage", "Real-time tracking & reporting", "Dedicated project manager", "Complete documentation"],
      notIncludes: ["Extreme specialized cargo"],
      duration: "7-14 days",
    },
  },
  "marketing": {
    basic: {
      title: "Basic Marketing Package",
      subtitle: "Marketing Services",
      price: "₹50,000 - ₹1,00,000",
      priceNote: "Price depends on campaign scope.",
      description: "Essential marketing support to enhance your exhibition presence and drive visitor engagement.",
      includes: ["Basic branding materials", "Social media promotion", "Email marketing campaign", "Basic PR support", "Visitor engagement materials"],
      notIncludes: ["Advanced digital marketing", "TV advertising", "Large-scale PR campaigns"],
      duration: "2-4 weeks",
    },
    digital: {
      title: "Digital Marketing Package",
      subtitle: "Marketing Services",
      price: "₹1,00,000 - ₹3,00,000",
      priceNote: "Price depends on campaign scope.",
      description: "Comprehensive digital marketing campaign to maximize your exhibition ROI through targeted online promotion and engagement.",
      includes: ["Social media advertising", "Targeted digital campaigns", "Content marketing", "SEO optimization", "Email automation", "Analytics & reporting", "Influencer partnerships"],
      notIncludes: ["Traditional media", "Large-scale events"],
      duration: "4-6 weeks",
    },
    premium: {
      title: "Premium Marketing Package",
      subtitle: "Marketing Services",
      price: "₹3,00,000 - ₹7,00,000",
      priceNote: "Price depends on campaign scope.",
      description: "Full-service marketing campaign combining digital and traditional marketing channels for maximum exhibition impact.",
      includes: ["Complete digital marketing", "Traditional media advertising", "PR & media relations", "Event marketing", "Brand activation", "Content creation", "Performance analytics"],
      notIncludes: ["Ultra-premium campaigns", "International advertising"],
      duration: "6-8 weeks",
    },
    campaign: {
      title: "Full Marketing Campaign",
      subtitle: "Marketing Services",
      price: "₹7,00,000 - ₹15,00,000+",
      priceNote: "Price depends on campaign scope.",
      description: "Comprehensive marketing campaign with integrated strategies across all channels for premium brand positioning and maximum market penetration.",
      includes: ["360-degree marketing strategy", "Multi-channel advertising", "VIP PR campaigns", "Brand experience design", "Content & creative production", "Advanced analytics", "Dedicated marketing team"],
      notIncludes: ["Extreme custom campaigns"],
      duration: "8-12 weeks",
    },
  },
  "interpretation-protocol": {
    basic: {
      title: "Basic Interpretation Service",
      subtitle: "Interpretation & Protocol Services",
      price: "₹25,000 - ₹50,000",
      priceNote: "Price depends on duration and languages.",
      description: "Essential interpretation services for basic communication needs during exhibitions and business meetings.",
      includes: ["Basic interpretation (1-2 languages)", "Standard equipment", "2-4 hour sessions", "Basic protocol assistance"],
      notIncludes: ["Simultaneous interpretation", "VIP protocol services", "Extended hours"],
      duration: "Per event",
    },
    professional: {
      title: "Professional Interpretation Service",
      subtitle: "Interpretation & Protocol Services",
      price: "₹50,000 - ₹1,50,000",
      priceNote: "Price depends on duration and languages.",
      description: "Professional interpretation services with qualified interpreters and enhanced equipment for important business communications.",
      includes: ["Professional interpreters", "Multiple language support", "Quality equipment", "Extended sessions", "Protocol coordination", "Documentation support"],
      notIncludes: ["Simultaneous interpretation", "VIP services"],
      duration: "Per event",
    },
    vip: {
      title: "VIP Protocol Services",
      subtitle: "Interpretation & Protocol Services",
      price: "₹1,50,000 - ₹4,00,000",
      priceNote: "Price depends on requirements.",
      description: "Premium protocol and interpretation services for VIP visitors, dignitaries, and high-profile business delegations.",
      includes: ["VIP protocol management", "Expert interpreters", "Simultaneous interpretation", "Premium equipment", "Transportation coordination", "Accommodation arrangements", "Personal assistants"],
      notIncludes: ["State-level protocol"],
      duration: "Per event",
    },
    management: {
      title: "Full Protocol Management",
      subtitle: "Protocol Services",
      price: "₹4,00,000 - ₹10,00,000+",
      priceNote: "Price depends on scale and requirements.",
      description: "Complete protocol management for large-scale events, international delegations, and complex diplomatic requirements.",
      includes: ["Complete protocol management", "International delegation handling", "Diplomatic coordination", "Full interpretation services", "Transportation & logistics", "Security coordination", "Event management"],
      notIncludes: ["State security requirements"],
      duration: "Per event",
    },
  },
  "no-show-space": {
    basic: {
      title: "Basic No-Show Space",
      subtitle: "No Show Space Booking",
      price: "₹50,000 - ₹1,00,000",
      priceNote: "Price depends on space requirements.",
      description: "Basic storage and preparation space for exhibition materials and equipment setup.",
      includes: ["Basic storage space", "Loading/unloading access", "Basic security", "24/7 access"],
      notIncludes: ["Climate control", "Specialized storage", "Equipment rental"],
      duration: "Per event",
    },
    premium: {
      title: "Premium No-Show Space",
      subtitle: "No Show Space Booking",
      price: "₹1,00,000 - ₹3,00,000",
      priceNote: "Price depends on space requirements.",
      description: "Premium storage and preparation facilities with enhanced security and amenities for valuable exhibition materials.",
      includes: ["Premium storage space", "Climate-controlled environment", "Enhanced security", "Equipment rental options", "Staff assistance", "24/7 monitoring"],
      notIncludes: ["Ultra-secure facilities", "Specialized equipment"],
      duration: "Per event",
    },
  },
};

const EVENTS = [
  ["India International Trade Fair 2026", "November 14 - 27, 2026", "Yashobhoomi, Dwarka, New Delhi", "yashobhoomi", "Trade Fair"],
  ["Auto Expo 2026", "January 15 - 20, 2026", "Yashobhoomi, Dwarka, New Delhi", "yashobhoomi", "Industry Expo"],
  ["National Engineering Expo", "February 8 - 12, 2026", "Yashobhoomi, Dwarka, New Delhi", "yashobhoomi", "Engineering"],
  ["FoodPro India 2026", "April 20 - 23, 2026", "Yashobhoomi, Dwarka, New Delhi", "yashobhoomi", "Food & Beverage"],
  ["PLASTINDIA 2026", "February 1 - 5, 2026", "Pragati Maidan (ITPO), New Delhi", "delhi", "Plastics & Rubber"],
  ["India Pharma Expo 2026", "March 10 - 13, 2026", "Pragati Maidan (ITPO), New Delhi", "delhi", "Pharmaceuticals"],
  ["Bombay Exhibition World Fair", "May 5 - 9, 2026", "Bombay Exhibition Centre, Mumbai", "mumbai", "Multi-Industry"],
  ["Jio World Jewellery Show 2026", "June 12 - 15, 2026", "Jio World Convention Centre, Mumbai", "mumbai", "Jewellery & Gems"],
  ["Auto Cluster Motor Show 2026", "March 20 - 23, 2026", "Auto Cluster Exhibition Centre, Pune", "pune", "Automotive"],
  ["Chennai Trade Expo 2026", "April 3 - 6, 2026", "Chennai Trade Centre, Nandambakkam", "chennai", "Trade & Commerce"],
  ["BIEC Agriculture & Tech Expo", "August 10 - 13, 2026", "BIEC, Tumkur Road, Bangalore", "bangalore", "Agriculture & Tech"],
  ["Hitex Industrial Fair 2026", "September 15 - 18, 2026", "Hitex Exhibition Centre, Hyderabad", "hyderabad", "Industrial"],
  ["Kolkata Book Fair 2026", "January 28 - February 9, 2026", "Milan Mela Ground, Kolkata", "kolkata", "Books & Culture"],
  ["Vibrant Gujarat Summit", "January 10 - 12, 2026", "Helipad Exhibition Ground, Ahmedabad", "ahmedabad", "Investment Summit"],
  ["Cochin International Marine Expo", "October 5 - 8, 2026", "CIAL Cochin Conventions, Kochi", "kochi", "Marine & Ports"],
  ["JECC Handicraft Mela 2026", "November 1 - 10, 2026", "JECC Sitapura, Jaipur", "jaipur", "Handicrafts"],
];

async function countRows(db, table) {
  const row = await db.get(`SELECT COUNT(*) AS count FROM ${table}`);
  return Number(row?.count || 0);
}

async function seedDatabase({ resetEvents = true } = {}) {
  const db = await initDatabase();

  try {
    // Seed services
    console.log('🌱 Seeding services...');
    for (const [serviceId, serviceData] of Object.entries(SERVICE_PACKAGES)) {
      await upsertByKeys(db, 'services', ['service_id'], {
        service_id: serviceId,
        label: serviceData.label,
        packages: JSON.stringify(serviceData.packages),
      });
    }

    // Seed venues
    console.log('🌱 Seeding venues...');
    for (const venue of VENUE_DETAILS) {
      await upsertByKeys(db, 'venues', ['location_id', 'sub_venue_id'], {
        location_id: venue.locationId,
        sub_venue_id: venue.subVenueId,
        name: venue.name,
        address: venue.address,
        city: venue.city,
        state: venue.state,
        description: venue.description,
        about: venue.about,
        total_area: venue.totalArea,
        halls: venue.halls,
        capacity: venue.capacity,
        established: venue.established,
        website: venue.website || null,
        specialities: JSON.stringify(venue.specialities),
        image: venue.image,
      });
    }

    // Seed packages
    console.log('🌱 Seeding packages...');
    for (const [category, subcategories] of Object.entries(PACKAGE_DETAILS)) {
      for (const [subcategory, packageData] of Object.entries(subcategories)) {
        await upsertByKeys(db, 'packages', ['category', 'subcategory'], {
          category,
          subcategory,
          title: packageData.title,
          subtitle: packageData.subtitle,
          price: packageData.price,
          price_note: packageData.priceNote,
          description: packageData.description,
          includes: JSON.stringify(packageData.includes),
          not_includes: JSON.stringify(packageData.notIncludes),
          duration: packageData.duration,
        });
      }
    }

    console.log('✅ Database seeded successfully!');
    const shouldSeedEvents = resetEvents || (await countRows(db, 'events')) === 0;
    if (shouldSeedEvents) {
      console.log('Seeding events...');
      if (resetEvents) await db.run('DELETE FROM events');
      for (const [name, date, venue, locationId, category] of EVENTS) {
        await db.run(
          'INSERT INTO events (name, date, venue, location_id, category, status) VALUES (?, ?, ?, ?, ?, ?)',
          [name, date, venue, locationId, category, 'Upcoming']
        );
      }
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

async function seedDatabaseIfEmpty() {
  const db = await initDatabase();
  const hasCatalog = (await countRows(db, 'services')) > 0
    && (await countRows(db, 'venues')) > 0
    && (await countRows(db, 'packages')) > 0
    && (await countRows(db, 'events')) > 0;

  if (hasCatalog) return db;
  await seedDatabase({ resetEvents: false });
  return initDatabase();
}

// Run seeding if called directly
const scriptUrl = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === scriptUrl) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Database initialization complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database initialization failed:', error);
      process.exit(1);
    });
}

export { EVENTS, PACKAGE_DETAILS, SERVICE_PACKAGES, VENUE_DETAILS, seedDatabase, seedDatabaseIfEmpty };
