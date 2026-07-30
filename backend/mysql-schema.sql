-- MySQL schema for HOI Business Center

CREATE TABLE IF NOT EXISTS users (
  id int auto_increment primary key,
  name varchar(160) not null,
  email varchar(255) not null unique,
  password varchar(255) not null,
  phone varchar(40),
  company varchar(180),
  role varchar(40) default 'user',
  status varchar(40) default 'active',
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS venues (
  id int auto_increment primary key,
  location_id varchar(120) not null,
  sub_venue_id varchar(120) not null,
  name varchar(180) not null,
  address text not null,
  city varchar(120) not null,
  state varchar(120) not null,
  description text,
  about text,
  total_area varchar(120),
  halls varchar(120),
  capacity varchar(120),
  established varchar(120),
  website varchar(255),
  specialities text,
  image varchar(500),
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp,
  unique key unique_location_venue (location_id, sub_venue_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS services (
  id int auto_increment primary key,
  service_id varchar(120) not null unique,
  label varchar(180) not null,
  packages text,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS packages (
  id int auto_increment primary key,
  category varchar(120) not null,
  subcategory varchar(120) not null,
  title varchar(220) not null,
  subtitle varchar(220) not null,
  price varchar(80) not null,
  price_note text,
  description text,
  includes text,
  not_includes text,
  duration varchar(120),
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp,
  unique key unique_category_subcategory (category, subcategory)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inquiries (
  id int auto_increment primary key,
  name varchar(160) not null,
  email varchar(255) not null,
  phone varchar(40) not null,
  company varchar(180),
  service varchar(180) not null,
  location varchar(180),
  message text,
  status varchar(40) default 'pending',
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS manpower_requests (
  id int auto_increment primary key,
  role varchar(120) not null,
  name varchar(160) not null,
  email varchar(255) not null,
  phone varchar(40) not null,
  company varchar(180),
  experience text,
  languages text,
  industries text,
  tasks text,
  availability text,
  documents text,
  status varchar(40) default 'pending',
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS events (
  id int auto_increment primary key,
  name varchar(220) not null,
  date varchar(120) not null,
  venue varchar(220) not null,
  location_id varchar(120) not null,
  category varchar(120),
  status varchar(40) default 'Upcoming',
  source_provider varchar(80),
  source_key varchar(255),
  source_url varchar(500),
  source_synced_at timestamp null,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp,
  unique key unique_events_source_key (source_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bookings (
  id int auto_increment primary key,
  user_id int not null,
  service_id varchar(120),
  package_id varchar(120),
  event_id int,
  notes text,
  status varchar(40) default 'pending',
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cms_content (
  id int auto_increment primary key,
  content_key varchar(180) not null unique,
  label varchar(180) not null,
  value text not null,
  type varchar(40) default 'text',
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS content_translations (
  id int auto_increment primary key,
  content_key varchar(180) not null,
  language_code varchar(10) not null,
  label varchar(180) not null,
  value text not null,
  type varchar(40) default 'text',
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp,
  unique key unique_content_translation (content_key, language_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_replies (
  id int auto_increment primary key,
  source varchar(80) not null,
  record_id int not null,
  subject varchar(220) not null,
  message text not null,
  created_at timestamp default current_timestamp
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notification_dismissals (
  id int auto_increment primary key,
  notification_id varchar(160) not null unique,
  created_at timestamp default current_timestamp
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO users (name, email, password, phone, company, role, status) VALUES
  ('Admin', 'admin@gmail.com', '$2a$10$qvmE1VdQjbsZCAHZ9rIWMu6NYggxOioDexju0YjdDWaqOfkFOtpFS', '', '', 'admin', 'active')
ON DUPLICATE KEY UPDATE
name = VALUES(name),
email = VALUES(email),
password = VALUES(password),
phone = VALUES(phone),
company = VALUES(company),
role = VALUES(role),
status = VALUES(status)
;

INSERT INTO services (service_id, label, packages) VALUES
  ('booth-reservation', 'Booth Reservation', '[{"label":"Compact Size 6'' x 6'' ft (36 sq ft)","href":"/packages/booth-reservation/compact"},{"label":"Standard Size 6'' x 9'' ft (54 sq ft)","href":"/packages/booth-reservation/standard"},{"label":"Premium Size 10'' x 10'' ft (100 sq ft)","href":"/packages/booth-reservation/premium"},{"label":"Executive 16'' x 20'' ft (380 sq ft)","href":"/packages/booth-reservation/executive"},{"label":"Custom Size","href":"/packages/booth-reservation/custom"}]'),
  ('booth-design', 'Booth Design', '[{"label":"Essential Design","href":"/packages/booth-design/essential"},{"label":"Professional Design","href":"/packages/booth-design/professional"},{"label":"Premium Design","href":"/packages/booth-design/premium"},{"label":"Luxury Design","href":"/packages/booth-design/luxury"},{"label":"Custom Design","href":"/packages/booth-design/custom"}]'),
  ('booth-install-demolition', 'Booth Install & Demolition', '[{"label":"Basic Installation","href":"/packages/booth-install-demolition/basic"},{"label":"Standard Installation","href":"/packages/booth-install-demolition/standard"},{"label":"Premium Installation","href":"/packages/booth-install-demolition/premium"},{"label":"Deluxe Installation","href":"/packages/booth-install-demolition/deluxe"}]'),
  ('logistics', 'Logistics Services', '[{"label":"Basic Logistics Package","href":"/packages/logistics/basic"},{"label":"Standard Logistics Package","href":"/packages/logistics/standard"},{"label":"Premium Logistics Package","href":"/packages/logistics/premium"},{"label":"Full Freight Management","href":"/packages/logistics/freight"}]'),
  ('marketing', 'Marketing Services', '[{"label":"Basic Marketing Package","href":"/packages/marketing/basic"},{"label":"Digital Marketing Package","href":"/packages/marketing/digital"},{"label":"Premium Marketing Package","href":"/packages/marketing/premium"},{"label":"Full Marketing Campaign","href":"/packages/marketing/campaign"}]'),
  ('interpretation-protocol', 'Interpretation & Protocol', '[{"label":"Basic Interpretation","href":"/packages/interpretation-protocol/basic"},{"label":"Professional Interpretation","href":"/packages/interpretation-protocol/professional"},{"label":"VIP Protocol Services","href":"/packages/interpretation-protocol/vip"},{"label":"Full Protocol Management","href":"/packages/interpretation-protocol/management"}]')
ON DUPLICATE KEY UPDATE
service_id = VALUES(service_id),
label = VALUES(label),
packages = VALUES(packages)
;

INSERT INTO venues (location_id, sub_venue_id, name, address, city, state, description, about, total_area, halls, capacity, established, website, specialities, image) VALUES
  ('yashobhoomi', 'india-international-convention-and-expo-centre', 'Yashobhoomi, India International Convention and Expo Centre', 'Sector 25, Dwarka, New Delhi - 110061', 'New Delhi', 'Delhi', 'Yashobhoomi is the priority HOI service venue for exhibition support, booth services, logistics, marketing, interpretation, and manpower.', 'Yashobhoomi, also known as India International Convention and Expo Centre, is the primary HOI service location in Dwarka, New Delhi. It supports large exhibitions, trade shows, conferences, and business events with modern halls and convention facilities.', 'India''s largest MICE destination', 'Exhibition and convention halls', 'Large-scale exhibitions and business events', '2023', 'https://www.yashobhoomi.org/', '["Priority HOI Venue","Exhibition Services","Convention Centre","Business Events"]', '/assets/yashobhoomi.png'),
  ('delhi', 'pragati-maidan', 'Pragati Maidan (ITPO)', 'Bhairon Marg, Pragati Maidan, New Delhi – 110001', 'New Delhi', 'Delhi', 'India''s largest and most iconic exhibition ground, managed by the India Trade Promotion Organisation (ITPO).', 'Pragati Maidan has been the heart of India''s trade exhibition ecosystem since its establishment. Spanning 123 acres, it hosts hundreds of national and international exhibitions every year. The venue underwent a massive ₹2,700 crore redevelopment — now known as IITPC — featuring world-class convention facilities, underground parking, and modern infrastructure.', '123 acres', '14 Halls', '50,000+ visitors/day', '1972', '', '["International Trade Fairs","Government Pavilions","ITPO Managed Events","Underground Connectivity to Delhi Metro"]', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'),
  ('delhi', 'nsic', 'NSIC Exhibition Grounds, Okhla', 'NSIC Complex, Okhla Industrial Estate, New Delhi – 110020', 'New Delhi', 'Delhi', 'NSIC''s exhibition grounds are a key venue for SME-focused trade fairs and government exhibitions in Delhi.', 'The National Small Industries Corporation (NSIC) Exhibition Complex in Okhla is a dedicated space for SME development and trade promotion. It regularly hosts sector-specific exhibitions focused on manufacturing, technology, and engineering — providing a cost-effective platform for small and medium enterprises.', '20 acres', '5 Halls', '10,000+ visitors', '1980', '', '["SME Trade Fairs","Government B2B Exhibitions","Manufacturing Sector Expos"]', 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80'),
  ('mumbai', 'bombay-exhibition-centre', 'Bombay Exhibition Centre', 'Western Express Highway, Goregaon East, Mumbai – 400063', 'Mumbai', 'Maharashtra', 'Mumbai''s premier exhibition and convention center, known for hosting international trade shows and corporate events.', 'The Bombay Exhibition Centre (BEC) is Mumbai''s largest and most modern exhibition venue. With over 50,000 sq m of exhibition space across multiple halls, it serves as the gateway for international trade in Western India. The center features state-of-the-art facilities, advanced AV equipment, and comprehensive event management services.', '50,000 sq m', '8 Halls', '25,000+ visitors', '1978', '', '["International Trade Shows","Corporate Events","Product Launches","Fashion Weeks"]', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80'),
  ('mumbai', 'mmrda-grounds', 'MMRDA Exhibition Grounds', 'Bandra Kurla Complex, Bandra East, Mumbai – 400051', 'Mumbai', 'Maharashtra', 'MMRDA''s exhibition grounds in Bandra Kurla Complex, ideal for large-scale exhibitions and outdoor events.', 'The Mumbai Metropolitan Region Development Authority (MMRDA) Exhibition Grounds in Bandra Kurla Complex offer extensive outdoor and indoor exhibition spaces. Located in Mumbai''s business district, it provides excellent connectivity and modern infrastructure for large-scale exhibitions, cultural events, and trade fairs.', '100 acres', '6 Halls + Outdoor Space', '30,000+ visitors', '1995', '', '["Large-scale Exhibitions","Cultural Events","Outdoor Trade Fairs","Automotive Shows"]', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80'),
  ('bangalore', 'bengaluru-international-exhibition-centre', 'Bengaluru International Exhibition Centre (BIEC)', '10th Mile, Tumkur Road, Madavara, Bengaluru – 562123', 'Bengaluru', 'Karnataka', 'Karnataka''s largest exhibition center, featuring modern facilities and extensive exhibition space.', 'The Bengaluru International Exhibition Centre (BIEC) is Karnataka''s premier exhibition venue, spanning 25 acres with over 20,000 sq m of indoor exhibition space. It serves as the hub for trade exhibitions, conferences, and business events in South India, offering world-class facilities and comprehensive event management services.', '25 acres', '6 Halls', '15,000+ visitors', '1997', '', '["Technology Exhibitions","IT & Software Events","Engineering Expos","Medical & Healthcare Shows"]', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'),
  ('chennai', 'chennai-trade-centre', 'Chennai Trade Centre', 'Mount Poonamalle Road, Nandambakkam, Chennai – 600089', 'Chennai', 'Tamil Nadu', 'Chennai''s modern exhibition and convention center, equipped with advanced facilities for trade shows and corporate events.', 'The Chennai Trade Centre is a state-of-the-art exhibition venue in South Chennai, featuring 15,000 sq m of exhibition space across multiple halls. It specializes in trade exhibitions, conferences, and corporate events, providing comprehensive event management and modern amenities.', '15,000 sq m', '4 Halls', '8,000+ visitors', '2001', '', '["Trade Exhibitions","Corporate Conferences","Automotive Shows","Manufacturing Expos"]', 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80'),
  ('hyderabad', 'hitex-exhibition-centre', 'HITEX Exhibition Centre', 'Izzat Nagar, Kothaguda, Hyderabad – 500084', 'Hyderabad', 'Telangana', 'Hyderabad''s premier exhibition center, known for hosting international exhibitions and conferences.', 'The Hyderabad International Trade Exposition Centre (HITEX) is Telangana''s largest exhibition venue, offering 20,000 sq m of exhibition space. It serves as the primary venue for international trade shows, conferences, and business events in South Central India.', '20,000 sq m', '5 Halls', '10,000+ visitors', '2003', '', '["International Trade Shows","IT & Technology Events","Pharma Exhibitions","Engineering Expos"]', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80'),
  ('pune', 'pune-exhibition-centre', 'Pune Exhibition Centre', 'Pune-Mumbai Highway, Pune – 411001', 'Pune', 'Maharashtra', 'Pune''s dedicated exhibition center for trade shows and business events.', 'The Pune Exhibition Centre is a modern facility designed for trade exhibitions and corporate events. With multiple halls and extensive outdoor space, it caters to various industries including manufacturing, technology, and automotive sectors.', '12,000 sq m', '3 Halls', '6,000+ visitors', '2005', '', '["Manufacturing Exhibitions","Technology Shows","Automotive Events","Education Fairs"]', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80')
ON DUPLICATE KEY UPDATE
location_id = VALUES(location_id),
sub_venue_id = VALUES(sub_venue_id),
name = VALUES(name),
address = VALUES(address),
city = VALUES(city),
state = VALUES(state),
description = VALUES(description),
about = VALUES(about),
total_area = VALUES(total_area),
halls = VALUES(halls),
capacity = VALUES(capacity),
established = VALUES(established),
website = VALUES(website),
specialities = VALUES(specialities),
image = VALUES(image)
;

INSERT INTO packages (category, subcategory, title, subtitle, price, price_note, description, includes, not_includes, duration) VALUES
  ('booth-reservation', 'compact', 'Compact Booth — 6'' × 6'' (36 sq ft)', 'Booth Reservation', 'Contact for Pricing', 'Price varies by event and venue. Request a personalised quote.', 'Our Compact booth package is ideal for small businesses or startups looking to make their presence felt at major exhibitions without a large footprint. The 36 sq ft space is efficiently designed to maximize visibility.', '["Booth space allocation (36 sq ft)","Standard carpet flooring","1 Information counter","2 Folding chairs","Basic lighting (2 spotlights)","Fascia name board (company name)","1 Power socket (5A)","Visitor Wi-Fi access"]', '["Booth design or fabrication","Additional furniture","Marketing materials","Extra power sockets","Storage area"]', 'Duration of the exhibition event'),
  ('booth-reservation', 'standard', 'Standard Booth — 6'' × 9'' (54 sq ft)', 'Booth Reservation', 'Contact for Pricing', 'Price varies by event and venue. Request a personalised quote.', 'The Standard booth provides a comfortable 54 sq ft space, suitable for SMEs looking to present products and engage visitors effectively. Comes with additional furnishing and display options.', '["Booth space allocation (54 sq ft)","Premium carpet flooring","1 Information counter with lockable storage","3 Chairs","Enhanced lighting (4 spotlights)","Fascia name board (backlit)","2 Power sockets (5A + 15A)","Visitor Wi-Fi access","1 Product display shelf"]', '["Booth design or fabrication","Marketing materials","TV / AV equipment","Extra staff"]', 'Duration of the exhibition event'),
  ('booth-reservation', 'premium', 'Premium Booth — 10'' × 10'' (100 sq ft)', 'Booth Reservation', 'Contact for Pricing', 'Price varies by event and venue. Request a personalised quote.', 'The Premium booth is perfect for established brands wanting a strong exhibition presence. 100 sq ft allows for a branded environment with product displays, meeting corners, and proper visitor engagement areas.', '["Booth space allocation (100 sq ft)","Premium flooring (choice of carpet or tiles)","1 Reception counter","Meeting corner (2 chairs + side table)","Professional lighting package","Backlit fascia board (premium print)","3 Power sockets (mixed)","Wi-Fi & LAN access","2 Product display shelves","1 Lockable storage cabinet"]', '["Booth design / custom fabrication (available as add-on)","AV screens","Marketing materials"]', 'Duration of the exhibition event'),
  ('booth-reservation', 'executive', 'Executive Booth — 16'' × 20'' (380 sq ft)', 'Booth Reservation', 'Contact for Pricing', 'Price varies by event and venue. Request a personalised quote.', 'The Executive booth is designed for premium brands and large corporations requiring a commanding presence. 380 sq ft provides ample space for elaborate displays, multiple meeting rooms, and comprehensive visitor engagement.', '["Booth space allocation (380 sq ft)","Premium flooring & carpeting","Executive reception area","2 Meeting rooms (4 chairs each)","Professional lighting & sound system","Premium backlit fascia board","Multiple power sockets (15A & 30A)","High-speed Wi-Fi & LAN","Multiple display shelves & cabinets","Dedicated storage area","VIP lounge area"]', '["Custom booth design & fabrication","AV equipment & screens","Catering services","Extra staff"]', 'Duration of the exhibition event'),
  ('booth-reservation', 'custom', 'Custom Booth Size', 'Booth Reservation', 'Contact for Pricing', 'Price varies by event and venue. Request a personalised quote.', 'For unique requirements and special exhibition needs, we offer custom booth sizes tailored to your specific requirements. Our team will work with you to design the perfect space for your exhibition presence.', '["Custom booth space allocation","Flexible furnishing options","Custom lighting solutions","Personalized fascia design","Power requirements assessment","Wi-Fi & connectivity setup"]', '["Custom booth fabrication","Specialized equipment","Additional services"]', 'Duration of the exhibition event'),
  ('booth-design', 'essential', 'Essential Booth Design', 'Booth Design', '₹25,000 - ₹50,000', 'Price depends on booth size and complexity.', 'Our Essential booth design package provides a clean, professional look suitable for most exhibition requirements. Includes basic design elements and standard materials.', '["Basic design consultation","2D floor plan","Standard color scheme","Basic graphics & branding","Standard materials (panels, lighting)","Installation guidance"]', '["3D visualization","Premium materials","Custom fabrication","Advanced lighting","AV integration"]', '2-3 weeks'),
  ('booth-design', 'professional', 'Professional Booth Design', 'Booth Design', '₹50,000 - ₹1,50,000', 'Price depends on booth size and complexity.', 'The Professional design package offers enhanced aesthetics with premium materials and better visual impact. Ideal for companies wanting to stand out at exhibitions.', '["Detailed design consultation","3D visualization","Premium color schemes","Professional graphics & branding","Quality materials & finishes","Enhanced lighting design","Installation supervision"]', '["Custom fabrication","AV equipment integration","Special effects","Premium materials"]', '3-4 weeks'),
  ('booth-design', 'premium', 'Premium Booth Design', 'Booth Design', '₹1,50,000 - ₹4,00,000', 'Price depends on booth size and complexity.', 'Premium booth design combines creativity, functionality, and luxury materials to create a memorable exhibition presence. Perfect for premium brands and high-profile events.', '["Comprehensive design consultation","3D visualization & walkthrough","Luxury materials & finishes","Custom graphics & branding","Advanced lighting & effects","AV equipment integration","Full installation service"]', '["Ultra-premium materials","Complex special effects","Custom sculpture work"]', '4-6 weeks'),
  ('booth-design', 'luxury', 'Luxury Booth Design', 'Booth Design', '₹4,00,000 - ₹10,00,000+', 'Price depends on booth size and complexity.', 'Our Luxury booth design package offers unparalleled creativity and premium execution. This is for brands that want to make a statement and create an unforgettable exhibition experience.', '["VIP design consultation","Full 3D visualization","Ultra-premium materials","Custom fabrication","Advanced lighting & special effects","Complete AV integration","Full project management","Premium installation & dismantling"]', '["Extreme custom requests","One-of-a-kind sculptures"]', '6-8 weeks'),
  ('booth-design', 'custom', 'Custom Booth Design', 'Booth Design', 'Contact for Pricing', 'Price depends on specific requirements and complexity.', 'For unique and extraordinary booth requirements, our custom design service offers unlimited creativity and bespoke solutions tailored to your vision.', '["Unlimited design consultations","Custom concept development","Bespoke materials & finishes","Special effects & innovations","Complete project customization","Full technical support"]', '["Budget constraints apply"]', '8+ weeks'),
  ('booth-install-demolition', 'basic', 'Basic Installation Service', 'Booth Install & Demolition', '₹15,000 - ₹30,000', 'Price depends on booth size and complexity.', 'Our Basic installation service provides essential setup and dismantling for standard exhibition booths. Includes basic assembly and standard material handling.', '["Basic booth assembly","Standard panel installation","Basic lighting setup","Fascia board mounting","Standard furniture placement","Basic dismantling"]', '["Custom fabrication","Electrical work","Heavy equipment handling","Premium materials"]', '1-2 days'),
  ('booth-install-demolition', 'standard', 'Standard Installation Service', 'Booth Install & Demolition', '₹30,000 - ₹75,000', 'Price depends on booth size and complexity.', 'The Standard installation package offers professional setup with enhanced services including electrical work and premium material handling.', '["Professional booth assembly","Panel & structure installation","Electrical connections","Enhanced lighting setup","Furniture & display arrangement","Graphics mounting","Professional dismantling"]', '["Custom fabrication","Heavy machinery","Specialized equipment"]', '2-3 days'),
  ('booth-install-demolition', 'premium', 'Premium Installation Service', 'Booth Install & Demolition', '₹75,000 - ₹2,00,000', 'Price depends on booth size and complexity.', 'Premium installation service provides comprehensive setup with specialized equipment, custom fabrication support, and full project management.', '["Complete booth assembly","Custom fabrication installation","Full electrical setup","Advanced lighting systems","AV equipment integration","Furniture & display setup","Project management","Professional dismantling"]', '["Ultra-specialized installations","Extreme custom work"]', '3-5 days'),
  ('booth-install-demolition', 'deluxe', 'Deluxe Installation Service', 'Booth Install & Demolition', '₹2,00,000 - ₹5,00,000+', 'Price depends on booth size and complexity.', 'Our Deluxe installation service offers white-glove treatment with specialized teams, premium equipment, and comprehensive project management for high-profile exhibitions.', '["VIP project management","Specialized installation teams","Premium equipment & tools","Complete custom fabrication","Full electrical & AV setup","Luxury finishing touches","24/7 on-site support","Premium dismantling service"]', '["Extreme custom requests"]', '5-7 days'),
  ('logistics', 'basic', 'Basic Logistics Package', 'Logistics Services', '₹25,000 - ₹50,000', 'Price depends on distance and volume.', 'Our Basic logistics package covers essential transportation and handling needs for exhibition materials and equipment.', '["Local transportation","Basic loading/unloading","Standard packaging","Basic insurance coverage","Documentation support"]', '["International shipping","Custom crating","Express delivery","Specialized equipment transport"]', '3-5 days'),
  ('logistics', 'standard', 'Standard Logistics Package', 'Logistics Services', '₹50,000 - ₹1,50,000', 'Price depends on distance and volume.', 'The Standard logistics package provides comprehensive transportation solutions with enhanced services and better insurance coverage.', '["Domestic transportation","Professional loading/unloading","Custom packaging & crating","Enhanced insurance","Real-time tracking","Customs documentation","Storage solutions"]', '["International shipping","Air freight","Express services"]', '5-7 days'),
  ('logistics', 'premium', 'Premium Logistics Package', 'Logistics Services', '₹1,50,000 - ₹4,00,000', 'Price depends on distance and volume.', 'Premium logistics offers end-to-end solutions with specialized handling, express delivery options, and comprehensive project management.', '["Express domestic shipping","Specialized equipment transport","Premium packaging & crating","Comprehensive insurance","Real-time GPS tracking","Complete documentation","Project management","On-site coordination"]', '["International air freight","Ultra-specialized transport"]', '2-5 days'),
  ('logistics', 'freight', 'Full Freight Management', 'Logistics Services', '₹4,00,000 - ₹10,00,000+', 'Price depends on distance and volume.', 'Complete freight management service for complex international and domestic logistics requirements with full project oversight.', '["International & domestic shipping","Air, sea & road freight","Complete customs clearance","Specialized cargo handling","Full insurance coverage","Real-time tracking & reporting","Dedicated project manager","Complete documentation"]', '["Extreme specialized cargo"]', '7-14 days'),
  ('marketing', 'basic', 'Basic Marketing Package', 'Marketing Services', '₹50,000 - ₹1,00,000', 'Price depends on campaign scope.', 'Essential marketing support to enhance your exhibition presence and drive visitor engagement.', '["Basic branding materials","Social media promotion","Email marketing campaign","Basic PR support","Visitor engagement materials"]', '["Advanced digital marketing","TV advertising","Large-scale PR campaigns"]', '2-4 weeks'),
  ('marketing', 'digital', 'Digital Marketing Package', 'Marketing Services', '₹1,00,000 - ₹3,00,000', 'Price depends on campaign scope.', 'Comprehensive digital marketing campaign to maximize your exhibition ROI through targeted online promotion and engagement.', '["Social media advertising","Targeted digital campaigns","Content marketing","SEO optimization","Email automation","Analytics & reporting","Influencer partnerships"]', '["Traditional media","Large-scale events"]', '4-6 weeks'),
  ('marketing', 'premium', 'Premium Marketing Package', 'Marketing Services', '₹3,00,000 - ₹7,00,000', 'Price depends on campaign scope.', 'Full-service marketing campaign combining digital and traditional marketing channels for maximum exhibition impact.', '["Complete digital marketing","Traditional media advertising","PR & media relations","Event marketing","Brand activation","Content creation","Performance analytics"]', '["Ultra-premium campaigns","International advertising"]', '6-8 weeks'),
  ('marketing', 'campaign', 'Full Marketing Campaign', 'Marketing Services', '₹7,00,000 - ₹15,00,000+', 'Price depends on campaign scope.', 'Comprehensive marketing campaign with integrated strategies across all channels for premium brand positioning and maximum market penetration.', '["360-degree marketing strategy","Multi-channel advertising","VIP PR campaigns","Brand experience design","Content & creative production","Advanced analytics","Dedicated marketing team"]', '["Extreme custom campaigns"]', '8-12 weeks'),
  ('interpretation-protocol', 'basic', 'Basic Interpretation Service', 'Interpretation & Protocol Services', '₹25,000 - ₹50,000', 'Price depends on duration and languages.', 'Essential interpretation services for basic communication needs during exhibitions and business meetings.', '["Basic interpretation (1-2 languages)","Standard equipment","2-4 hour sessions","Basic protocol assistance"]', '["Simultaneous interpretation","VIP protocol services","Extended hours"]', 'Per event'),
  ('interpretation-protocol', 'professional', 'Professional Interpretation Service', 'Interpretation & Protocol Services', '₹50,000 - ₹1,50,000', 'Price depends on duration and languages.', 'Professional interpretation services with qualified interpreters and enhanced equipment for important business communications.', '["Professional interpreters","Multiple language support","Quality equipment","Extended sessions","Protocol coordination","Documentation support"]', '["Simultaneous interpretation","VIP services"]', 'Per event'),
  ('interpretation-protocol', 'vip', 'VIP Protocol Services', 'Interpretation & Protocol Services', '₹1,50,000 - ₹4,00,000', 'Price depends on requirements.', 'Premium protocol and interpretation services for VIP visitors, dignitaries, and high-profile business delegations.', '["VIP protocol management","Expert interpreters","Simultaneous interpretation","Premium equipment","Transportation coordination","Accommodation arrangements","Personal assistants"]', '["State-level protocol"]', 'Per event'),
  ('interpretation-protocol', 'management', 'Full Protocol Management', 'Protocol Services', '₹4,00,000 - ₹10,00,000+', 'Price depends on scale and requirements.', 'Complete protocol management for large-scale events, international delegations, and complex diplomatic requirements.', '["Complete protocol management","International delegation handling","Diplomatic coordination","Full interpretation services","Transportation & logistics","Security coordination","Event management"]', '["State security requirements"]', 'Per event'),
ON DUPLICATE KEY UPDATE
category = VALUES(category),
subcategory = VALUES(subcategory),
title = VALUES(title),
subtitle = VALUES(subtitle),
price = VALUES(price),
price_note = VALUES(price_note),
description = VALUES(description),
includes = VALUES(includes),
not_includes = VALUES(not_includes),
duration = VALUES(duration)
;

INSERT INTO events (name, date, venue, location_id, category, status) VALUES
  ('India International Trade Fair 2026', 'November 14 - 27, 2026', 'Yashobhoomi, Dwarka, New Delhi', 'yashobhoomi', 'Trade Fair', 'Upcoming'),
  ('Auto Expo 2026', 'January 15 - 20, 2026', 'Yashobhoomi, Dwarka, New Delhi', 'yashobhoomi', 'Industry Expo', 'Upcoming'),
  ('National Engineering Expo', 'February 8 - 12, 2026', 'Yashobhoomi, Dwarka, New Delhi', 'yashobhoomi', 'Engineering', 'Upcoming'),
  ('FoodPro India 2026', 'April 20 - 23, 2026', 'Yashobhoomi, Dwarka, New Delhi', 'yashobhoomi', 'Food & Beverage', 'Upcoming'),
  ('PLASTINDIA 2026', 'February 1 - 5, 2026', 'Pragati Maidan (ITPO), New Delhi', 'delhi', 'Plastics & Rubber', 'Upcoming'),
  ('India Pharma Expo 2026', 'March 10 - 13, 2026', 'Pragati Maidan (ITPO), New Delhi', 'delhi', 'Pharmaceuticals', 'Upcoming'),
  ('Bombay Exhibition World Fair', 'May 5 - 9, 2026', 'Bombay Exhibition Centre, Mumbai', 'mumbai', 'Multi-Industry', 'Upcoming'),
  ('Jio World Jewellery Show 2026', 'June 12 - 15, 2026', 'Jio World Convention Centre, Mumbai', 'mumbai', 'Jewellery & Gems', 'Upcoming'),
  ('Auto Cluster Motor Show 2026', 'March 20 - 23, 2026', 'Auto Cluster Exhibition Centre, Pune', 'pune', 'Automotive', 'Upcoming'),
  ('Chennai Trade Expo 2026', 'April 3 - 6, 2026', 'Chennai Trade Centre, Nandambakkam', 'chennai', 'Trade & Commerce', 'Upcoming'),
  ('BIEC Agriculture & Tech Expo', 'August 10 - 13, 2026', 'BIEC, Tumkur Road, Bangalore', 'bangalore', 'Agriculture & Tech', 'Upcoming'),
  ('Hitex Industrial Fair 2026', 'September 15 - 18, 2026', 'Hitex Exhibition Centre, Hyderabad', 'hyderabad', 'Industrial', 'Upcoming'),
  ('Kolkata Book Fair 2026', 'January 28 - February 9, 2026', 'Milan Mela Ground, Kolkata', 'kolkata', 'Books & Culture', 'Upcoming'),
  ('Vibrant Gujarat Summit', 'January 10 - 12, 2026', 'Helipad Exhibition Ground, Ahmedabad', 'ahmedabad', 'Investment Summit', 'Upcoming'),
  ('Cochin International Marine Expo', 'October 5 - 8, 2026', 'CIAL Cochin Conventions, Kochi', 'kochi', 'Marine & Ports', 'Upcoming'),
  ('JECC Handicraft Mela 2026', 'November 1 - 10, 2026', 'JECC Sitapura, Jaipur', 'jaipur', 'Handicrafts', 'Upcoming')
ON DUPLICATE KEY UPDATE
name = VALUES(name),
date = VALUES(date),
venue = VALUES(venue),
location_id = VALUES(location_id),
category = VALUES(category),
status = VALUES(status)
;

INSERT INTO cms_content (content_key, label, value, type) VALUES
  ('home.hero.badge', 'Home hero badge', 'Official Yashobhoomi exhibition portal', 'text'),
  ('home.hero.title', 'Home hero title', 'Yashobhoomi Exhibition Services by HOI Business Center', 'text'),
  ('home.hero.highlight', 'Home hero highlight', 'Exhibition Partner', 'text'),
  ('home.hero.description', 'Home hero description', 'Book the six HOI exhibition services at Yashobhoomi in one place: booth reservation, booth design, booth install & demolition, logistics services, marketing services, and interpretation & protocol.', 'text'),
  ('home.hero.focusTitle', 'Home hero focus title', 'Official venue spotlight for Yashobhoomi', 'text'),
  ('home.hero.focusDesc', 'Home hero focus description', 'The homepage keeps every public path centered on one venue and six official services so the content stays simple and clear.', 'text'),
  ('home.services.title', 'Home services title', 'Yashobhoomi Exhibition Services', 'text'),
  ('home.services.description', 'Home services description', 'The public site uses one simple model: Yashobhoomi as the venue, and only these six service paths.', 'text'),
  ('home.locations.title', 'Home locations title', 'Yashobhoomi venue spotlight', 'text'),
  ('home.locations.description', 'Home locations description', 'Venue-led presentation with factual details and a clean image-first layout.', 'text'),
  ('home.locations.body', 'Home locations body', 'Yashobhoomi is the official HOI venue for exhibition and convention-led services.', 'text'),
  ('home.locations.cardBadge', 'Home locations card badge', 'Official venue spotlight', 'text'),
  ('home.locations.cardTitle', 'Home locations card title', 'Yashobhoomi, India International Convention and Expo Centre', 'text'),
  ('home.locations.cardDescription', 'Home locations card description', 'HOI Business Center primary exhibition venue at Yashobhoomi.', 'text'),
  ('home.why.title', 'Home why choose title', 'Why choose HOI Business Center for Yashobhoomi exhibitions?', 'text'),
  ('home.why.description', 'Home why choose description', 'An official, structured service experience built to reduce confusion and keep the content focused.', 'text'),
  ('home.cta.title', 'Home CTA title', 'Plan your Yashobhoomi exhibition with HOI', 'text'),
  ('home.cta.description', 'Home CTA description', 'Use the booking flow or contact the team for a direct response. The workflow stays simple and tied to Yashobhoomi.', 'text'),
  ('home.process.title', 'Home process title', 'Simple booking sequence', 'text'),
  ('home.process.description', 'Home process description', 'The homepage now guides users in a straight line from service discovery to booking.', 'text'),
  ('home.process.selectService', 'Home process select service', 'Select service', 'text'),
  ('home.process.review', 'Home process review', 'Review detail page', 'text'),
  ('home.process.start', 'Home process start', 'Start booking', 'text'),
  ('home.process.coordinate', 'Home process coordinate', 'Coordinate execution', 'text'),
  ('home.process.selectServiceBody', 'Home process select service body', 'Open the service catalog and choose the required service card.', 'text'),
  ('home.process.reviewBody', 'Home process review body', 'Read the service description, package links, and Yashobhoomi context.', 'text'),
  ('home.process.startBody', 'Home process start body', 'Move into the booking flow to confirm scope and requirements.', 'text'),
  ('home.process.coordinateBody', 'Home process coordinate body', 'HOI team manages delivery, support, and on-ground coordination.', 'text'),
  ('home.why.item1', 'Home why item 1', 'Official venue-first presentation', 'text'),
  ('home.why.item2', 'Home why item 2', 'Only six canonical services on public site', 'text'),
  ('home.why.item3', 'Home why item 3', 'Separate manpower application flow', 'text'),
  ('home.why.item4', 'Home why item 4', 'CMS-backed copy for easy updates', 'text'),
  ('home.note.body', 'Home note body', 'This homepage keeps the public information model strict and simple, which makes it easier for users to understand what HOI offers and where each path leads.', 'text'),
  ('footer.about', 'Footer about text', 'HOI Business Center provides end-to-end exhibition services including booth reservation, booth design, booth install & demolition, logistics services, marketing services, and interpretation & protocol.', 'text'),
  ('service.hero.title', 'Service page hero title', 'Exhibition Services', 'text'),
  ('service.hero.description', 'Service page hero description', 'Explore the six HOI services centered on Yashobhoomi: booth reservation, booth design, booth install & demolition, logistics services, marketing services, and interpretation & protocol. Services, packages, and venue content are managed from the admin panel.', 'text'),
  ('service.overview.title', 'Service catalog title', 'Service Catalog', 'text'),
  ('service.overview.description', 'Service catalog description', 'Choose a service to view package options, or open the Yashobhoomi venue flow to see how each package can be arranged there.', 'text'),
  ('services.page.title', 'Services page title', 'Services', 'text'),
  ('services.page.description', 'Services page description', 'Explore the six canonical HOI services at Yashobhoomi. Each card opens a dedicated description page, and every service can flow into the booking path.', 'text'),
  ('services.page.eyebrow', 'Services page eyebrow', 'Service catalog', 'text'),
  ('services.section.eyebrow', 'Services section eyebrow', 'Service cards', 'text'),
  ('services.section.title', 'Services section title', 'Tap a service to see the full description', 'text'),
  ('services.card.tag', 'Services card tag', 'HOI Service', 'text'),
  ('services.card.defaultDesc', 'Services card default description', 'Explore the service in detail and move into the booking path when ready.', 'text'),
  ('services.booth-reservation.title', 'Booth Reservation detail title', 'Booth Reservation', 'text'),
  ('services.booth-reservation.description', 'Booth Reservation detail description', 'Reserve exhibition space at Yashobhoomi with HOI managing availability, coordination, and booking support.', 'text'),
  ('services.booth-reservation.overview', 'Booth Reservation overview', 'Booth Reservation is the starting point for every exhibition journey. HOI helps clients secure the right space at Yashobhoomi, align the booking with event objectives, and keep the reservation process clear and coordinated.', 'text'),
  ('services.booth-reservation.highlights', 'Booth Reservation highlights', '["Space selection and booking support","Venue coordination for Yashobhoomi","Reservation guidance for exhibitors","Booking aligned to event timelines"]', 'text'),
  ('services.booth-reservation.process', 'Booth Reservation process', '["Review your exhibition requirement and target area.","Select the best booth size and layout alignment.","Confirm the reservation and hand over the booking details.","Move into design, logistics, and execution planning."]', 'text'),
  ('services.booth-reservation.bestFor', 'Booth Reservation best for', '["First-time exhibitors","Teams booking Yashobhoomi space","Brands needing end-to-end assistance"]', 'text'),
  ('services.booth-design.title', 'Booth Design detail title', 'Booth Design', 'text'),
  ('services.booth-design.description', 'Booth Design detail description', 'Create a strong exhibition identity with booth layouts tailored for visibility, flow, and brand impact.', 'text'),
  ('services.booth-design.overview', 'Booth Design overview', 'Booth Design turns exhibition space into a branded experience. HOI plans the layout, visitor movement, display zones, and finishing details so the booth feels cohesive and practical on the show floor.', 'text'),
  ('services.booth-design.highlights', 'Booth Design highlights', '["Concept and space planning","Brand-led visual styling","Visitor flow and engagement layout","Design support for compact and large booths"]', 'text'),
  ('services.booth-design.process', 'Booth Design process', '["Share your brand and exhibition objectives.","Review the layout direction and design elements.","Approve the final booth concept.","Prepare the design for production and installation."]', 'text'),
  ('services.booth-design.bestFor', 'Booth Design best for', '["Product launches","Custom exhibition booths","Brands seeking stronger visual presence"]', 'text'),
  ('services.booth-install-demolition.title', 'Booth Install & Demolition detail title', 'Booth Install & Demolition', 'text'),
  ('services.booth-install-demolition.description', 'Booth Install & Demolition detail description', 'Manage installation, supervision, and teardown with disciplined execution around the event schedule.', 'text'),
  ('services.booth-install-demolition.overview', 'Booth Install & Demolition overview', 'Booth Install & Demolition covers the physical build and dismantling of the booth. HOI coordinates the on-ground team so installation happens on time, safely, and without unnecessary disruption.', 'text'),
  ('services.booth-install-demolition.highlights', 'Booth Install & Demolition highlights', '["On-site installation supervision","Safe teardown and clearance","Execution aligned to venue rules","Schedule-aware deployment"]', 'text'),
  ('services.booth-install-demolition.process', 'Booth Install & Demolition process', '["Finalize design and installation requirements.","Coordinate materials, manpower, and access windows.","Install the booth at the venue on schedule.","Demolish and clear the site after the event."]', 'text'),
  ('services.booth-install-demolition.bestFor', 'Booth Install & Demolition best for', '["Complex booths","Short setup windows","Teams wanting one execution partner"]', 'text'),
  ('services.logistics.title', 'Logistics Services detail title', 'Logistics Services', 'text'),
  ('services.logistics.description', 'Logistics Services detail description', 'Coordinate movement, handling, and material support for smooth exhibition delivery.', 'text'),
  ('services.logistics.overview', 'Logistics Services overview', 'Logistics Services ensure that the right materials arrive at the right time. HOI coordinates transport, handling, and movement so booths and supporting assets reach the venue without stress.', 'text'),
  ('services.logistics.highlights', 'Logistics Services highlights', '["Transport and movement planning","Material handling coordination","Venue delivery support","Setup and return logistics"]', 'text'),
  ('services.logistics.process', 'Logistics Services process', '["List the materials and shipment needs.","Plan the delivery schedule and access points.","Coordinate arrival, handling, and transfer.","Manage return movement after the exhibition."]', 'text'),
  ('services.logistics.bestFor', 'Logistics Services best for', '["Exhibitors with physical assets","Teams shipping booth materials","Events with time-sensitive logistics"]', 'text'),
  ('services.marketing.title', 'Marketing Services detail title', 'Marketing Services', 'text'),
  ('services.marketing.description', 'Marketing Services detail description', 'Promote the exhibition presence before the event with brand-focused marketing support.', 'text'),
  ('services.marketing.overview', 'Marketing Services overview', 'Marketing Services help a booth attract the right attention before the event even begins. HOI supports visibility, promotional touchpoints, and exhibition marketing work that complements on-ground activity.', 'text'),
  ('services.marketing.highlights', 'Marketing Services highlights', '["Pre-event promotion support","Brand visibility planning","Exhibition campaign coordination","Audience engagement support"]', 'text'),
  ('services.marketing.process', 'Marketing Services process', '["Define campaign goals and audience.","Set the message and promotion plan.","Launch the campaign and track response.","Refine visibility around the event schedule."]', 'text'),
  ('services.marketing.bestFor', 'Marketing Services best for', '["Brands launching at exhibitions","Teams needing awareness before the show","Exhibitors wanting stronger lead generation"]', 'text'),
  ('services.interpretation-protocol.title', 'Interpretation & Protocol detail title', 'Interpretation & Protocol', 'text'),
  ('services.interpretation-protocol.description', 'Interpretation & Protocol detail description', 'Support visitors, delegates, and executives with language and protocol coordination.', 'text'),
  ('services.interpretation-protocol.overview', 'Interpretation & Protocol overview', 'Interpretation & Protocol keeps communication smooth and professional. HOI arranges language support, guest handling, and protocol assistance so exhibitors can focus on conversations, not coordination gaps.', 'text'),
  ('services.interpretation-protocol.highlights', 'Interpretation & Protocol highlights', '["Language support for meetings","Visitor and delegate assistance","Protocol coordination","Professional on-ground support"]', 'text'),
  ('services.interpretation-protocol.process', 'Interpretation & Protocol process', '["Share the event language and protocol needs.","Match the right support team to the event.","Coordinate delegate handling and communication.","Maintain smooth assistance during the event."]', 'text'),
  ('services.interpretation-protocol.bestFor', 'Interpretation & Protocol best for', '["International exhibitors","VIP visitor handling","Delegations and formal meetings"]', 'text'),
  ('contact.title', 'Contact page title', 'Contact Us', 'text'),
  ('contact.description', 'Contact page description', 'Reach out to our team for inquiries, quotations, or to book any of our services.', 'text'),
  ('about.hero.title', 'About hero title', 'About HOI Business Center', 'text'),
  ('about.hero.description', 'About hero description', 'Your trusted exhibition service partner for booth reservation, booth design, booth install & demolition, logistics services, marketing services, and interpretation & protocol.', 'text'),
  ('about.badge', 'About badge', 'About HOI', 'text'),
  ('about.whoTitle', 'About who title', 'Built around Yashobhoomi and the full exhibition journey.', 'text'),
  ('about.body1', 'About body 1', 'HOI Business Center is the premier exhibition and event services provider at Yashobhoomi - India''s largest MICE (Meetings, Incentives, Conferences & Exhibitions) venue, located in Dwarka, New Delhi.', 'text'),
  ('about.body2', 'About body 2', 'Our team of seasoned professionals provides comprehensive end-to-end services for exhibitors, ensuring that every aspect of your exhibition journey - from initial booth reservation to final demolition - is handled with expertise and care.', 'text'),
  ('about.body3', 'About body 3', 'Everything we present on the public site is centered on Yashobhoomi and the six canonical HOI services, so the experience stays simple and consistent.', 'text'),
  ('about.ourApproach', 'About approach badge', 'Our approach', 'text'),
  ('about.approachTitle', 'About approach title', 'We combine venue understanding, execution discipline, and client-first planning.', 'text'),
  ('about.approachBody', 'About approach body', 'The result is a service experience that feels premium, organized, and directly tied to how exhibitions actually run on the ground.', 'text'),
  ('about.coreValues', 'About core values badge', 'Our Core Values', 'text'),
  ('about.coreValuesTitle', 'About core values title', 'What we stand for', 'text'),
  ('about.value.excellence', 'About value excellence', 'Excellence', 'text'),
  ('about.value.excellenceDesc', 'About value excellence description', 'We deliver the highest standards in every service.', 'text'),
  ('about.value.reliability', 'About value reliability', 'Reliability', 'text'),
  ('about.value.reliabilityDesc', 'About value reliability description', 'Your timeline is our commitment. We never miss a deadline.', 'text'),
  ('about.value.innovation', 'About value innovation', 'Innovation', 'text'),
  ('about.value.innovationDesc', 'About value innovation description', 'Creative booth designs and marketing strategies that stand out.', 'text'),
  ('about.value.partnership', 'About value partnership', 'Partnership', 'text'),
  ('about.value.partnershipDesc', 'About value partnership description', 'We treat every client as a long-term partner, not a transaction.', 'text'),
  ('about.servicesOverview', 'About services overview badge', 'Our Services Overview', 'text'),
  ('about.currentServices', 'About services overview title', 'Current services, arranged like a premium venue section', 'text'),
  ('manpower.hero.title', 'Manpower page hero title', 'Apply for Manpower', 'text'),
  ('manpower.hero.description', 'Manpower page hero description', 'Select your role, add the role-specific details, and upload your CV. All submissions are stored in the project database.', 'text'),
  ('yashobhoomi.hero.title', 'Yashobhoomi hero title', 'Yashobhoomi Exhibition Services', 'text'),
  ('yashobhoomi.hero.description', 'Yashobhoomi hero description', 'Manage your exhibition presence at India International Convention and Expo Centre, Dwarka with our complete service support.', 'text'),
  ('events.hero.title', 'Event calendar hero title', 'Event Calendar', 'text'),
  ('events.hero.description', 'Event calendar hero description', 'Explore upcoming exhibitions and trade shows across key venues.', 'text'),
  ('theme.primary', 'Website primary color', '#f97316', 'text'),
  ('theme.primaryDark', 'Website dark color', '#111111', 'text'),
  ('theme.accent', 'Website accent color', '#facc15', 'text'),
  ('theme.accentText', 'Website accent text color', '#111827', 'text'),
  ('manpower.roles', 'Manpower roles JSON', '[{"id":"translator","label":"Translator / Interpreter","enabled":true},{"id":"helper","label":"Helper","enabled":true},{"id":"host","label":"Host / Hostess","enabled":true},{"id":"promoter","label":"Promoter","enabled":true},{"id":"protocol","label":"Protocol Officer","enabled":true},{"id":"info-desk","label":"Information Desk Executive","enabled":true}]', 'text')
ON DUPLICATE KEY UPDATE
content_key = VALUES(content_key),
label = VALUES(label),
value = VALUES(value),
type = VALUES(type)
;
