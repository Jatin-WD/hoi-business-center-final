const TABLES = [
  {
    name: 'users',
    columns: [
      ['id', 'pk'],
      ['name', 'varchar(160) not null'],
      ['email', 'varchar(255) not null unique'],
      ['password', 'varchar(255) not null'],
      ['phone', 'varchar(40)'],
      ['company', 'varchar(180)'],
      ['role', "varchar(40) default 'user'"],
      ['status', "varchar(40) default 'active'"],
      ['created_at', 'timestamp default current_timestamp'],
      ['updated_at', 'timestamp default current_timestamp'],
    ],
  },
  {
    name: 'otp_codes',
    columns: [
      ['id', 'pk'],
      ['phone', 'varchar(40) not null'],
      ['code_hash', 'varchar(255) not null'],
      ['expires_at', 'varchar(40) not null'],
      ['used_at', 'timestamp'],
      ['created_at', 'timestamp default current_timestamp'],
    ],
  },
  {
    name: 'signup_verifications',
    columns: [
      ['id', 'pk'],
      ['name', 'varchar(160) not null'],
      ['email', 'varchar(255) not null'],
      ['phone', 'varchar(40) not null'],
      ['company', 'varchar(180)'],
      ['password_hash', 'varchar(255) not null'],
      ['code_hash', 'varchar(255) not null'],
      ['expires_at', 'varchar(40) not null'],
      ['used_at', 'timestamp'],
      ['created_at', 'timestamp default current_timestamp'],
    ],
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
    constraints: ['unique(location_id, sub_venue_id)'],
  },
  {
    name: 'services',
    columns: [['id', 'pk'], ['service_id', 'varchar(120) not null unique'], ['label', 'varchar(180) not null'], ['packages', 'text'], ['created_at', 'timestamp default current_timestamp'], ['updated_at', 'timestamp default current_timestamp']],
  },
  {
    name: 'packages',
    columns: [['id', 'pk'], ['category', 'varchar(120) not null'], ['subcategory', 'varchar(120) not null'], ['title', 'varchar(220) not null'], ['subtitle', 'varchar(220) not null'], ['price', 'varchar(80) not null'], ['price_note', 'text'], ['description', 'text'], ['includes', 'text'], ['not_includes', 'text'], ['duration', 'varchar(120)'], ['created_at', 'timestamp default current_timestamp'], ['updated_at', 'timestamp default current_timestamp']],
    constraints: ['unique(category, subcategory)'],
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
    columns: [['id', 'pk'], ['name', 'varchar(220) not null'], ['date', 'varchar(120) not null'], ['venue', 'varchar(220) not null'], ['location_id', 'varchar(120) not null'], ['category', 'varchar(120)'], ['status', "varchar(40) default 'Upcoming'"], ['created_at', 'timestamp default current_timestamp'], ['updated_at', 'timestamp default current_timestamp']],
  },
  {
    name: 'bookings',
    columns: [['id', 'pk'], ['user_id', 'integer not null'], ['service_id', 'varchar(120)'], ['package_id', 'varchar(120)'], ['event_id', 'integer'], ['notes', 'text'], ['status', "varchar(40) default 'pending'"], ['created_at', 'timestamp default current_timestamp'], ['updated_at', 'timestamp default current_timestamp']],
  },
  {
    name: 'cms_content',
    columns: [['id', 'pk'], ['content_key', 'varchar(255) not null unique'], ['label', 'varchar(255) not null'], ['value', 'text not null'], ['type', "varchar(40) default 'text'"], ['updated_at', 'timestamp default current_timestamp'], ['created_at', 'timestamp default current_timestamp']],
  },
  {
    name: 'admin_replies',
    columns: [['id', 'pk'], ['source', 'varchar(80) not null'], ['record_id', 'integer not null'], ['subject', 'varchar(255)'], ['message', 'text not null'], ['created_at', 'timestamp default current_timestamp']],
  },
  {
    name: 'notification_dismissals',
    columns: [['id', 'pk'], ['notification_id', 'varchar(160) not null unique'], ['created_at', 'timestamp default current_timestamp']],
  },
];

function columnSql(client, [name, type]) {
  if (type === 'pk') return `${name} int auto_increment primary key`;
  return `${name} ${type}`;
}

export function createSchemaStatements(client) {
  return TABLES.map((table) => {
    const definitions = [...table.columns.map((column) => columnSql(client, column)), ...(table.constraints || [])];
    return `CREATE TABLE IF NOT EXISTS ${table.name} (${definitions.join(', ')})`;
  });
}

export const databaseTables = TABLES.map((table) => table.name);
