import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { EVENTS, PACKAGE_DETAILS, SERVICE_PACKAGES, VENUE_DETAILS } from '../data/seed-data.js';

const schemaPath = path.join(process.cwd(), 'backend', 'mysql-schema.sql');
const DEFAULT_ADMIN = {
  name: 'Admin',
  email: 'admin@gmail.com',
  passwordHash: '$2a$10$qvmE1VdQjbsZCAHZ9rIWMu6NYggxOioDexju0YjdDWaqOfkFOtpFS',
  phone: '',
  company: '',
  role: 'admin',
  status: 'active',
};

const DEFAULT_CONTENT = [
  ['home.hero.badge', 'Home hero badge', "India's Premier Exhibition & Business Center Service"],
  ['home.hero.title', 'Home hero title', 'Your Complete Exhibition Partner at HOI Business Center'],
  ['home.hero.highlight', 'Home hero highlight', 'Exhibition Partner'],
  ['home.hero.description', 'Home hero description', 'From booth reservation to design, installation, logistics, marketing, and manpower services - we handle every aspect of your exhibition journey at Yashobhoomi, Dubai, and beyond.'],
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
  ['contact.title', 'Contact page title', 'Contact Us'],
  ['contact.description', 'Contact page description', 'Reach out to our team for inquiries, quotations, or to book any of our services.'],
  ['about.hero.title', 'About hero title', 'About HOI Business Center'],
  ['about.hero.description', 'About hero description', 'Your trusted exhibition service partner for venues, booths, manpower, logistics, marketing, and end-to-end execution.'],
  ['yashobhoomi.hero.title', 'Yashobhoomi hero title', 'Yashobhoomi Exhibition Services'],
  ['yashobhoomi.hero.description', 'Yashobhoomi hero description', 'Manage your exhibition presence at India International Convention and Expo Centre, Dwarka with our complete service support.'],
  ['events.hero.title', 'Event calendar hero title', 'Event Calendar'],
  ['events.hero.description', 'Event calendar hero description', 'Explore upcoming exhibitions and trade shows across key venues.'],
  ['theme.primary', 'Website primary color', '#1a3a8f'],
  ['theme.primaryDark', 'Website dark color', '#0f2460'],
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

  parts.push(buildMultiInsert(
    'users',
    ['name', 'email', 'password', 'phone', 'company', 'role', 'status'],
    [[
      DEFAULT_ADMIN.name,
      DEFAULT_ADMIN.email,
      DEFAULT_ADMIN.passwordHash,
      DEFAULT_ADMIN.phone,
      DEFAULT_ADMIN.company,
      DEFAULT_ADMIN.role,
      DEFAULT_ADMIN.status,
    ]],
  ));

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
