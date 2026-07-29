import bcrypt from 'bcryptjs';
import { initDatabase } from '../config/database.js';
import { pathToFileURL } from 'url';
import { EVENTS, PACKAGE_DETAILS, SERVICE_PACKAGES, VENUE_DETAILS } from '../data/seed-data.js';
import { buildSourceKey, fetchIiccEvents } from '../services/iicc-event-sync.js';

const CANONICAL_SERVICE_IDS = Object.keys(SERVICE_PACKAGES);
const CANONICAL_PACKAGE_CATEGORIES = Object.keys(PACKAGE_DETAILS);

function getBootstrapAdmin() {
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || '');
  if (!email || !password) return null;
  return {
    name: String(process.env.ADMIN_NAME || 'Admin').trim() || 'Admin',
    email,
    password,
    phone: String(process.env.ADMIN_PHONE || '').trim(),
    company: String(process.env.ADMIN_COMPANY || '').trim(),
    role: String(process.env.ADMIN_ROLE || 'admin').trim() || 'admin',
    status: String(process.env.ADMIN_STATUS || 'active').trim() || 'active',
  };
}

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

async function countRows(db, table) {
  const row = await db.get(`SELECT COUNT(*) AS count FROM ${table}`);
  return Number(row?.count || 0);
}

function normalizeEventSeed(event) {
  if (Array.isArray(event)) {
    const [name, date, venue, locationId, category] = event;
    return {
      name,
      date,
      venue,
      locationId,
      category,
      status: 'Upcoming',
      sourceProvider: '',
      sourceKey: '',
      sourceUrl: '',
    };
  }

  return {
    name: event.name,
    date: event.date,
    venue: event.venue,
    locationId: event.locationId || event.location_id || 'yashobhoomi',
    category: event.category || 'Event',
    status: event.status || 'Upcoming',
    sourceProvider: event.sourceProvider || 'IICC',
    sourceKey: event.sourceKey || buildSourceKey({
      sourceUrl: event.sourceUrl || '',
      name: event.name,
      date: event.date,
      venue: event.venue,
      category: event.category || 'Event',
    }),
    sourceUrl: event.sourceUrl || '',
  };
}

async function loadEventSeeds() {
  try {
    return (await fetchIiccEvents()).map(normalizeEventSeed);
  } catch (error) {
    console.warn('IICC live event fetch failed, using bundled snapshot:', error.message);
    return EVENTS.map(normalizeEventSeed);
  }
}

function countExpectedPackages() {
  return Object.values(PACKAGE_DETAILS).reduce((total, subcategories) => total + Object.keys(subcategories).length, 0);
}

async function cleanupDeprecatedCatalogRows(db) {
  await db.run("DELETE FROM packages WHERE category = ?", ["no-show-space"]);
  await db.run("DELETE FROM services WHERE service_id = ?", ["no-show-space"]);

  if (CANONICAL_SERVICE_IDS.length) {
    const servicePlaceholders = CANONICAL_SERVICE_IDS.map(() => '?').join(', ');
    await db.run(
      `DELETE FROM services WHERE service_id NOT IN (${servicePlaceholders})`,
      CANONICAL_SERVICE_IDS
    );
  }

  if (CANONICAL_PACKAGE_CATEGORIES.length) {
    const packagePlaceholders = CANONICAL_PACKAGE_CATEGORIES.map(() => '?').join(', ');
    await db.run(
      `DELETE FROM packages WHERE category NOT IN (${packagePlaceholders})`,
      CANONICAL_PACKAGE_CATEGORIES
    );
  }
}

async function ensureDefaultAdmin(db) {
  const bootstrapAdmin = getBootstrapAdmin();
  if (!bootstrapAdmin) return;
  const existing = await db.get('SELECT id FROM users WHERE lower(email) = ?', [bootstrapAdmin.email]);
  if (existing) return;

  const passwordHash = await bcrypt.hash(bootstrapAdmin.password, 10);
  await db.run(
    'INSERT INTO users (name, email, password, phone, company, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      bootstrapAdmin.name,
      bootstrapAdmin.email,
      passwordHash,
      bootstrapAdmin.phone,
      bootstrapAdmin.company,
      bootstrapAdmin.role,
      bootstrapAdmin.status,
    ]
  );
}

async function seedDatabase({ resetEvents = true } = {}) {
  const db = await initDatabase();

  try {
    await ensureDefaultAdmin(db);

    // Remove deprecated catalog entries before re-seeding.
    await cleanupDeprecatedCatalogRows(db);

    // Seed services
    console.log('Seeding services...');
    for (const [serviceId, serviceData] of Object.entries(SERVICE_PACKAGES)) {
      await upsertByKeys(db, 'services', ['service_id'], {
        service_id: serviceId,
        label: serviceData.label,
        packages: JSON.stringify(serviceData.packages),
      });
    }

    // Seed venues
    console.log('Seeding venues...');
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
    console.log('Seeding packages...');
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

    console.log('Database seeded successfully!');
    const shouldSeedEvents = resetEvents || (await countRows(db, 'events')) === 0;
    if (shouldSeedEvents) {
      console.log('Seeding events...');
      if (resetEvents) await db.run('DELETE FROM events');
      const eventSeeds = await loadEventSeeds();
      for (const event of eventSeeds) {
        await db.run(
          `
            INSERT INTO events (
              name, date, venue, location_id, category, status,
              source_provider, source_key, source_url, source_synced_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `,
          [
            event.name,
            event.date,
            event.venue,
            event.locationId,
            event.category,
            event.status,
            event.sourceProvider,
            event.sourceKey,
            event.sourceUrl,
          ]
        );
      }
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

async function seedDatabaseIfEmpty() {
  const db = await initDatabase();
  await cleanupDeprecatedCatalogRows(db);
  const expectedServices = Object.keys(SERVICE_PACKAGES).length;
  const expectedVenues = VENUE_DETAILS.length;
  const expectedPackages = countExpectedPackages();
  const hasCatalog = (await countRows(db, 'services')) >= expectedServices
    && (await countRows(db, 'venues')) >= expectedVenues
    && (await countRows(db, 'packages')) >= expectedPackages
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
      console.log('Database initialization complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

export { seedDatabase, seedDatabaseIfEmpty };
