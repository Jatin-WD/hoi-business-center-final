import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { pathToFileURL } from 'url';
import { EVENTS, PACKAGE_DETAILS, SERVICE_PACKAGES, VENUE_DETAILS } from '../data/seed-data.js';

const schemaPath = path.join(process.cwd(), 'backend', 'mysql-schema.sql');
function getBootstrapAdminRow() {
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || '');
  if (!email || !password) return null;

  return {
    name: String(process.env.ADMIN_NAME || 'Admin').trim() || 'Admin',
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    phone: String(process.env.ADMIN_PHONE || '').trim(),
    company: String(process.env.ADMIN_COMPANY || '').trim(),
    role: String(process.env.ADMIN_ROLE || 'admin').trim() || 'admin',
    status: String(process.env.ADMIN_STATUS || 'active').trim() || 'active',
  };
}

const DEFAULT_CONTENT = [
  ['home.hero.badge', 'Home hero badge', "India's Premier Exhibition & Business Center Service"],
  ['home.hero.title', 'Home hero title', 'Your Complete Exhibition Partner at HOI Business Center'],
  ['home.hero.highlight', 'Home hero highlight', 'Exhibition Partner'],
  ['home.hero.description', 'Home hero description', 'From booth reservation to booth design, booth install & demolition, logistics services, marketing services, and interpretation & protocol - we handle every aspect of your exhibition journey at Yashobhoomi and beyond.'],
  ['home.services.title', 'Home services title', 'Our Services'],
  ['home.services.description', 'Home services description', 'Comprehensive exhibition solutions designed to make your presence unforgettable. Select any service to begin your journey.'],
  ['home.locations.title', 'Home locations title', 'Where We Operate'],
  ['home.locations.description', 'Home locations description', "From India's premier MICE destination to global exhibition hubs"],
  ['home.why.title', 'Home why choose title', 'Why Choose KIL - HOI Business Center?'],
  ['home.why.description', 'Home why choose description', "We are the official HOI partner at Yashobhoomi - India's largest MICE destination. Our end-to-end services ensure your exhibition is seamless, professional, and impactful."],
  ['home.cta.title', 'Home CTA title', 'Ready to Elevate Your Exhibition Presence?'],
  ['home.cta.description', 'Home CTA description', 'Contact our team today and let us create an unforgettable exhibition experience for your brand.'],
  ['service.hero.title', 'Service page hero title', 'Exhibition Services'],
  ['service.hero.description', 'Service page hero description', 'Explore booth reservation, booth design, booth install & demolition, logistics, marketing, and interpretation & protocol services. Services, packages, and venues are managed from the admin panel.'],
  ['service.overview.title', 'Service catalog title', 'Service Catalog'],
  ['service.overview.description', 'Service catalog description', 'Choose a service to view package options, or select a venue to see what can be arranged there.'],
  ['services.page.title', 'Services page title', 'Services'],
  ['services.page.description', 'Services page description', 'Explore the six canonical HOI services. Each card opens a dedicated description page, and every service can flow into the booking path.'],
  ['services.page.eyebrow', 'Services page eyebrow', 'Service catalog'],
  ['services.section.eyebrow', 'Services section eyebrow', 'Service cards'],
  ['services.section.title', 'Services section title', 'Tap a service to see the full description'],
  ['services.card.tag', 'Services card tag', 'HOI Service'],
  ['services.card.defaultDesc', 'Services card default description', 'Explore the service in detail and move into the booking path when ready.'],
  ['services.booth-reservation.title', 'Booth Reservation detail title', 'Booth Reservation'],
  ['services.booth-reservation.description', 'Booth Reservation detail description', 'Reserve exhibition space at Yashobhoomi with HOI managing availability, coordination, and booking support.'],
  ['services.booth-reservation.overview', 'Booth Reservation overview', 'Booth Reservation is the starting point for every exhibition journey. HOI helps clients secure the right space at Yashobhoomi, align the booking with event objectives, and keep the reservation process clear and coordinated.'],
  ['services.booth-reservation.highlights', 'Booth Reservation highlights', JSON.stringify(['Space selection and booking support', 'Venue coordination for Yashobhoomi', 'Reservation guidance for exhibitors', 'Booking aligned to event timelines'])],
  ['services.booth-reservation.process', 'Booth Reservation process', JSON.stringify(['Review your exhibition requirement and target area.', 'Select the best booth size and layout alignment.', 'Confirm the reservation and hand over the booking details.', 'Move into design, logistics, and execution planning.'])],
  ['services.booth-reservation.bestFor', 'Booth Reservation best for', JSON.stringify(['First-time exhibitors', 'Teams booking Yashobhoomi space', 'Brands needing end-to-end assistance'])],
  ['services.booth-design.title', 'Booth Design detail title', 'Booth Design'],
  ['services.booth-design.description', 'Booth Design detail description', 'Create a strong exhibition identity with booth layouts tailored for visibility, flow, and brand impact.'],
  ['services.booth-design.overview', 'Booth Design overview', 'Booth Design turns exhibition space into a branded experience. HOI plans the layout, visitor movement, display zones, and finishing details so the booth feels cohesive and practical on the show floor.'],
  ['services.booth-design.highlights', 'Booth Design highlights', JSON.stringify(['Concept and space planning', 'Brand-led visual styling', 'Visitor flow and engagement layout', 'Design support for compact and large booths'])],
  ['services.booth-design.process', 'Booth Design process', JSON.stringify(['Share your brand and exhibition objectives.', 'Review the layout direction and design elements.', 'Approve the final booth concept.', 'Prepare the design for production and installation.'])],
  ['services.booth-design.bestFor', 'Booth Design best for', JSON.stringify(['Product launches', 'Custom exhibition booths', 'Brands seeking stronger visual presence'])],
  ['services.booth-install-demolition.title', 'Booth Install & Demolition detail title', 'Booth Install & Demolition'],
  ['services.booth-install-demolition.description', 'Booth Install & Demolition detail description', 'Manage installation, supervision, and teardown with disciplined execution around the event schedule.'],
  ['services.booth-install-demolition.overview', 'Booth Install & Demolition overview', 'Booth Install & Demolition covers the physical build and dismantling of the booth. HOI coordinates the on-ground team so installation happens on time, safely, and without unnecessary disruption.'],
  ['services.booth-install-demolition.highlights', 'Booth Install & Demolition highlights', JSON.stringify(['On-site installation supervision', 'Safe teardown and clearance', 'Execution aligned to venue rules', 'Schedule-aware deployment'])],
  ['services.booth-install-demolition.process', 'Booth Install & Demolition process', JSON.stringify(['Finalize design and installation requirements.', 'Coordinate materials, manpower, and access windows.', 'Install the booth at the venue on schedule.', 'Demolish and clear the site after the event.'])],
  ['services.booth-install-demolition.bestFor', 'Booth Install & Demolition best for', JSON.stringify(['Complex booths', 'Short setup windows', 'Teams wanting one execution partner'])],
  ['services.logistics.title', 'Logistics Services detail title', 'Logistics Services'],
  ['services.logistics.description', 'Logistics Services detail description', 'Coordinate movement, handling, and material support for smooth exhibition delivery.'],
  ['services.logistics.overview', 'Logistics Services overview', 'Logistics Services ensure that the right materials arrive at the right time. HOI coordinates transport, handling, and movement so booths and supporting assets reach the venue without stress.'],
  ['services.logistics.highlights', 'Logistics Services highlights', JSON.stringify(['Transport and movement planning', 'Material handling coordination', 'Venue delivery support', 'Setup and return logistics'])],
  ['services.logistics.process', 'Logistics Services process', JSON.stringify(['List the materials and shipment needs.', 'Plan the delivery schedule and access points.', 'Coordinate arrival, handling, and transfer.', 'Manage return movement after the exhibition.'])],
  ['services.logistics.bestFor', 'Logistics Services best for', JSON.stringify(['Exhibitors with physical assets', 'Teams shipping booth materials', 'Events with time-sensitive logistics'])],
  ['services.marketing.title', 'Marketing Services detail title', 'Marketing Services'],
  ['services.marketing.description', 'Marketing Services detail description', 'Promote the exhibition presence before the event with brand-focused marketing support.'],
  ['services.marketing.overview', 'Marketing Services overview', 'Marketing Services help a booth attract the right attention before the event even begins. HOI supports visibility, promotional touchpoints, and exhibition marketing work that complements on-ground activity.'],
  ['services.marketing.highlights', 'Marketing Services highlights', JSON.stringify(['Pre-event promotion support', 'Brand visibility planning', 'Exhibition campaign coordination', 'Audience engagement support'])],
  ['services.marketing.process', 'Marketing Services process', JSON.stringify(['Define campaign goals and audience.', 'Set the message and promotion plan.', 'Launch the campaign and track response.', 'Refine visibility around the event schedule.'])],
  ['services.marketing.bestFor', 'Marketing Services best for', JSON.stringify(['Brands launching at exhibitions', 'Teams needing awareness before the show', 'Exhibitors wanting stronger lead generation'])],
  ['services.interpretation-protocol.title', 'Interpretation & Protocol detail title', 'Interpretation & Protocol'],
  ['services.interpretation-protocol.description', 'Interpretation & Protocol detail description', 'Support visitors, delegates, and executives with language and protocol coordination.'],
  ['services.interpretation-protocol.overview', 'Interpretation & Protocol overview', 'Interpretation & Protocol keeps communication smooth and professional. HOI arranges language support, guest handling, and protocol assistance so exhibitors can focus on conversations, not coordination gaps.'],
  ['services.interpretation-protocol.highlights', 'Interpretation & Protocol highlights', JSON.stringify(['Language support for meetings', 'Visitor and delegate assistance', 'Protocol coordination', 'Professional on-ground support'])],
  ['services.interpretation-protocol.process', 'Interpretation & Protocol process', JSON.stringify(['Share the event language and protocol needs.', 'Match the right support team to the event.', 'Coordinate delegate handling and communication.', 'Maintain smooth assistance during the event.'])],
  ['services.interpretation-protocol.bestFor', 'Interpretation & Protocol best for', JSON.stringify(['International exhibitors', 'VIP visitor handling', 'Delegations and formal meetings'])],
  ['contact.title', 'Contact page title', 'Contact Us'],
  ['contact.description', 'Contact page description', 'Reach out to our team for inquiries, quotations, or to book any of our services.'],
  ['about.hero.title', 'About hero title', 'About HOI Business Center'],
  ['about.hero.description', 'About hero description', 'Your trusted exhibition service partner for booth reservation, booth design, booth install & demolition, logistics services, marketing services, and interpretation & protocol.'],
  ['about.badge', 'About badge', 'About HOI'],
  ['about.whoTitle', 'About who title', 'Built around Yashobhoomi and the full exhibition journey.'],
  ['about.body1', 'About body 1', "HOI Business Center is the premier exhibition and event services provider at Yashobhoomi - India's largest MICE (Meetings, Incentives, Conferences & Exhibitions) venue, located in Dwarka, New Delhi."],
  ['about.body2', 'About body 2', 'Our team of seasoned professionals provides comprehensive end-to-end services for exhibitors, ensuring that every aspect of your exhibition journey - from initial booth reservation to final demolition - is handled with expertise and care.'],
  ['about.body3', 'About body 3', 'Everything we present on the public site is centered on Yashobhoomi and the six canonical HOI services, so the experience stays simple and consistent.'],
  ['about.ourApproach', 'About approach badge', 'Our approach'],
  ['about.approachTitle', 'About approach title', 'We combine venue understanding, execution discipline, and client-first planning.'],
  ['about.approachBody', 'About approach body', 'The result is a service experience that feels premium, organized, and directly tied to how exhibitions actually run on the ground.'],
  ['about.coreValues', 'About core values badge', 'Our Core Values'],
  ['about.coreValuesTitle', 'About core values title', 'What we stand for'],
  ['about.value.excellence', 'About value excellence', 'Excellence'],
  ['about.value.excellenceDesc', 'About value excellence description', 'We deliver the highest standards in every service.'],
  ['about.value.reliability', 'About value reliability', 'Reliability'],
  ['about.value.reliabilityDesc', 'About value reliability description', 'Your timeline is our commitment. We never miss a deadline.'],
  ['about.value.innovation', 'About value innovation', 'Innovation'],
  ['about.value.innovationDesc', 'About value innovation description', 'Creative booth designs and marketing strategies that stand out.'],
  ['about.value.partnership', 'About value partnership', 'Partnership'],
  ['about.value.partnershipDesc', 'About value partnership description', 'We treat every client as a long-term partner, not a transaction.'],
  ['about.servicesOverview', 'About services overview badge', 'Our Services Overview'],
  ['about.currentServices', 'About services overview title', 'Current services, arranged like a premium venue section'],
  ['manpower.hero.title', 'Manpower page hero title', 'Apply for Manpower'],
  ['manpower.hero.description', 'Manpower page hero description', 'Select your role, add the role-specific details, and upload your CV. All submissions are stored in the project database.'],
  ['yashobhoomi.hero.title', 'Yashobhoomi hero title', 'Yashobhoomi Exhibition Services'],
  ['yashobhoomi.hero.description', 'Yashobhoomi hero description', 'Manage your exhibition presence at India International Convention and Expo Centre, Dwarka with our complete service support.'],
  ['events.hero.title', 'Event calendar hero title', 'Event Calendar'],
  ['events.hero.description', 'Event calendar hero description', 'Explore upcoming exhibitions and trade shows across key venues.'],
  ['theme.primary', 'Website primary color', '#f97316'],
  ['theme.primaryDark', 'Website dark color', '#111111'],
  ['theme.accent', 'Website accent color', '#facc15'],
  ['theme.accentText', 'Website accent text color', '#111827'],
  ['manpower.roles', 'Manpower roles JSON', JSON.stringify([
    { id: 'translator', label: 'Translator / Interpreter', enabled: true },
    { id: 'helper', label: 'Helper', enabled: true },
    { id: 'host', label: 'Host / Hostess', enabled: true },
    { id: 'promoter', label: 'Promoter', enabled: true },
    { id: 'protocol', label: 'Protocol Officer', enabled: true },
    { id: 'info-desk', label: 'Information Desk Executive', enabled: true },
  ])],
];

function escapeSql(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''")
    .replace(/\r?\n/g, '\\n');
}

function row(values) {
  return `(${values.map((value) => `'${escapeSql(value)}'`).join(', ')})`;
}

function buildMultiInsert(table, columns, rows) {
  if (!rows.length) return '';
  return [
    `INSERT INTO ${table} (${columns.join(', ')}) VALUES`,
    rows.map((item) => `  ${row(item)}`).join(',\n'),
    'ON DUPLICATE KEY UPDATE',
    columns
      .filter((column) => !['id', 'created_at'].includes(column))
      .map((column) => `${column} = VALUES(${column})`)
      .join(',\n'),
    ';',
    '',
  ].join('\n');
}

function buildSchemaSeed() {
  const parts = [];

  parts.push('-- Seed data generated from backend/data/seed-data.js');
  parts.push('');

  const bootstrapAdmin = getBootstrapAdminRow();
  if (bootstrapAdmin) {
    parts.push(buildMultiInsert(
      'users',
      ['name', 'email', 'password', 'phone', 'company', 'role', 'status'],
      [[
        bootstrapAdmin.name,
        bootstrapAdmin.email,
        bootstrapAdmin.passwordHash,
        bootstrapAdmin.phone,
        bootstrapAdmin.company,
        bootstrapAdmin.role,
        bootstrapAdmin.status,
      ]],
    ));
  }

  parts.push(buildMultiInsert(
    'services',
    ['service_id', 'label', 'packages'],
    Object.entries(SERVICE_PACKAGES).map(([serviceId, service]) => [
      serviceId,
      service.label,
      JSON.stringify(service.packages),
    ]),
  ));

  parts.push(buildMultiInsert(
    'venues',
    ['location_id', 'sub_venue_id', 'name', 'address', 'city', 'state', 'description', 'about', 'total_area', 'halls', 'capacity', 'established', 'website', 'specialities', 'image'],
    VENUE_DETAILS.map((venue) => [
      venue.locationId,
      venue.subVenueId,
      venue.name,
      venue.address,
      venue.city,
      venue.state,
      venue.description,
      venue.about,
      venue.totalArea,
      venue.halls,
      venue.capacity,
      venue.established,
      venue.website || '',
      JSON.stringify(venue.specialities || []),
      venue.image || '',
    ]),
  ));

  const packageRows = [];
  for (const [category, subcategories] of Object.entries(PACKAGE_DETAILS)) {
    for (const [subcategory, pkg] of Object.entries(subcategories)) {
      packageRows.push([
        category,
        subcategory,
        pkg.title,
        pkg.subtitle,
        pkg.price,
        pkg.priceNote,
        pkg.description,
        JSON.stringify(pkg.includes || []),
        JSON.stringify(pkg.notIncludes || []),
        pkg.duration,
      ]);
    }
  }
  parts.push(buildMultiInsert(
    'packages',
    ['category', 'subcategory', 'title', 'subtitle', 'price', 'price_note', 'description', 'includes', 'not_includes', 'duration'],
    packageRows,
  ));

  parts.push(buildMultiInsert(
    'events',
    ['name', 'date', 'venue', 'location_id', 'category', 'status'],
    EVENTS.map(([name, date, venue, locationId, category]) => [name, date, venue, locationId, category, 'Upcoming']),
  ));

  parts.push(buildMultiInsert(
    'cms_content',
    ['content_key', 'label', 'value', 'type'],
    DEFAULT_CONTENT.map(([key, label, value]) => [key, label, value, 'text']),
  ));

  return parts.filter(Boolean).join('\n');
}

function main() {
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found at ${schemaPath}`);
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf8').replace(/\n-- Seed data generated from backend\/data\/seed-data\.js[\s\S]*$/, '').trimEnd();
  const next = `${schemaSql}\n\n${buildSchemaSeed()}\n`;
  fs.writeFileSync(schemaPath, next, 'utf8');
  console.log(`Updated ${schemaPath}`);
}

const scriptUrl = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === scriptUrl) main();
