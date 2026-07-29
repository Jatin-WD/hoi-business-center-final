const TABLES = [
  {
    name: 'users',
    columns: [
      ['id', 'pk'],
      ['name', 'varchar(160) not null'],
      ['email', 'varchar(255) not null'],
      ['password', 'varchar(255) not null'],
      ['phone', 'varchar(40)'],
      ['company', 'varchar(180)'],
      ['role', "varchar(40) default 'user'"],
      ['status', "varchar(40) default 'active'"],
      ['created_at', 'timestamp default current_timestamp'],
      ['updated_at', 'timestamp default current_timestamp'],
    ],
    uniqueKeys: [{ name: 'unique_users_email', columns: ['email'] }],
  },
  {
    name: 'venues',
    columns: [
      ['id', 'pk'],
      ['location_id', 'varchar(120) not null'],
      ['sub_venue_id', 'varchar(120) not null'],
      ['name', 'varchar(180) not null'],
      ['address', 'text not null'],
      ['city', 'varchar(120) not null'],
      ['state', 'varchar(120) not null'],
      ['description', 'text'],
      ['about', 'text'],
      ['total_area', 'varchar(120)'],
      ['halls', 'varchar(120)'],
      ['capacity', 'varchar(120)'],
      ['established', 'varchar(120)'],
      ['website', 'varchar(255)'],
      ['specialities', 'text'],
      ['image', 'varchar(500)'],
      ['created_at', 'timestamp default current_timestamp'],
      ['updated_at', 'timestamp default current_timestamp'],
    ],
    uniqueKeys: [{ name: 'unique_location_venue', columns: ['location_id', 'sub_venue_id'] }],
  },
  {
    name: 'services',
    columns: [['id', 'pk'], ['service_id', 'varchar(120) not null'], ['label', 'varchar(180) not null'], ['packages', 'text'], ['created_at', 'timestamp default current_timestamp'], ['updated_at', 'timestamp default current_timestamp']],
    uniqueKeys: [{ name: 'unique_services_service_id', columns: ['service_id'] }],
  },
  {
    name: 'packages',
    columns: [['id', 'pk'], ['category', 'varchar(120) not null'], ['subcategory', 'varchar(120) not null'], ['title', 'varchar(220) not null'], ['subtitle', 'varchar(220) not null'], ['price', 'varchar(80) not null'], ['price_note', 'text'], ['description', 'text'], ['includes', 'text'], ['not_includes', 'text'], ['duration', 'varchar(120)'], ['created_at', 'timestamp default current_timestamp'], ['updated_at', 'timestamp default current_timestamp']],
    uniqueKeys: [{ name: 'unique_packages_category_subcategory', columns: ['category', 'subcategory'] }],
  },
  {
    name: 'inquiries',
    columns: [['id', 'pk'], ['name', 'varchar(160) not null'], ['email', 'varchar(255) not null'], ['phone', 'varchar(40) not null'], ['company', 'varchar(180)'], ['service', 'varchar(180) not null'], ['location', 'varchar(180)'], ['message', 'text'], ['status', "varchar(40) default 'pending'"], ['created_at', 'timestamp default current_timestamp'], ['updated_at', 'timestamp default current_timestamp']],
  },
  {
    name: 'manpower_requests',
    columns: [['id', 'pk'], ['role', 'varchar(120) not null'], ['name', 'varchar(160) not null'], ['email', 'varchar(255) not null'], ['phone', 'varchar(40) not null'], ['company', 'varchar(180)'], ['experience', 'text'], ['languages', 'text'], ['industries', 'text'], ['tasks', 'text'], ['availability', 'text'], ['documents', 'text'], ['status', "varchar(40) default 'pending'"], ['created_at', 'timestamp default current_timestamp'], ['updated_at', 'timestamp default current_timestamp']],
  },
  {
    name: 'events',
    columns: [
      ['id', 'pk'],
      ['name', 'varchar(220) not null'],
      ['date', 'varchar(120) not null'],
      ['venue', 'varchar(220) not null'],
      ['location_id', 'varchar(120) not null'],
      ['category', 'varchar(120)'],
      ['status', "varchar(40) default 'Upcoming'"],
      ['source_provider', 'varchar(80)'],
      ['source_key', 'varchar(255)'],
      ['source_url', 'varchar(500)'],
      ['source_synced_at', 'timestamp null'],
      ['created_at', 'timestamp default current_timestamp'],
      ['updated_at', 'timestamp default current_timestamp'],
    ],
    uniqueKeys: [{ name: 'unique_events_source_key', columns: ['source_key'] }],
  },
  {
    name: 'bookings',
    columns: [['id', 'pk'], ['user_id', 'integer not null'], ['service_id', 'varchar(120)'], ['package_id', 'varchar(120)'], ['event_id', 'integer'], ['notes', 'text'], ['status', "varchar(40) default 'pending'"], ['created_at', 'timestamp default current_timestamp'], ['updated_at', 'timestamp default current_timestamp']],
  },
  {
    name: 'cms_content',
    columns: [['id', 'pk'], ['content_key', 'varchar(180) not null'], ['label', 'varchar(180) not null'], ['value', 'text not null'], ['type', "varchar(40) default 'text'"], ['created_at', 'timestamp default current_timestamp'], ['updated_at', 'timestamp default current_timestamp']],
    uniqueKeys: [{ name: 'unique_cms_content_key', columns: ['content_key'] }],
  },
  {
    name: 'content_translations',
    columns: [
      ['id', 'pk'],
      ['content_key', 'varchar(180) not null'],
      ['language_code', 'varchar(10) not null'],
      ['label', 'varchar(180) not null'],
      ['value', 'text not null'],
      ['type', "varchar(40) default 'text'"],
      ['created_at', 'timestamp default current_timestamp'],
      ['updated_at', 'timestamp default current_timestamp'],
    ],
    uniqueKeys: [{ name: 'unique_content_translation', columns: ['content_key', 'language_code'] }],
  },
  {
    name: 'admin_replies',
    columns: [['id', 'pk'], ['source', 'varchar(80) not null'], ['record_id', 'integer not null'], ['subject', 'varchar(220) not null'], ['message', 'text not null'], ['created_at', 'timestamp default current_timestamp']],
  },
  {
    name: 'notification_dismissals',
    columns: [['id', 'pk'], ['notification_id', 'varchar(160) not null'], ['created_at', 'timestamp default current_timestamp']],
    uniqueKeys: [{ name: 'unique_notification_dismissals_notification_id', columns: ['notification_id'] }],
  },
];

function columnSql(client, [name, type]) {
  if (type === 'pk') return `${name} int auto_increment primary key`;
  return `${name} ${type}`;
}

export function createSchemaStatements(client) {
  return TABLES.map((table) => {
    const uniqueConstraints = (table.uniqueKeys || []).map((key) => `unique key \`${key.name}\` (${key.columns.map((column) => `\`${column}\``).join(', ')})`);
    const definitions = [...table.columns.map((column) => columnSql(client, column)), ...uniqueConstraints];
    return `CREATE TABLE IF NOT EXISTS ${table.name} (${definitions.join(', ')})`;
  });
}

export const databaseTables = TABLES.map((table) => table.name);
export { TABLES, columnSql };
