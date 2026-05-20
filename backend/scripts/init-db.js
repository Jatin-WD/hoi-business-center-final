import { initDatabase } from '../config/database.js';
import { pathToFileURL } from 'url';
import { EVENTS, PACKAGE_DETAILS, SERVICE_PACKAGES, VENUE_DETAILS } from '../data/seed-data.js';

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

async function seedDatabase({ resetEvents = true } = {}) {
  const db = await initDatabase();

  try {
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
      for (const [name, date, venue, locationId, category] of EVENTS) {
        await db.run(
          'INSERT INTO events (name, date, venue, location_id, category, status) VALUES (?, ?, ?, ?, ?, ?)',
          [name, date, venue, locationId, category, 'Upcoming']
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
      console.log('Database initialization complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

export { seedDatabase, seedDatabaseIfEmpty };
