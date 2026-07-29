import express from 'express';
import { getDb } from '../config/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();
let defaultContentReady = false;
let defaultContentPromise = null;

const LEGACY_THEME_VALUES = {
  'theme.primary': '#1a3a8f',
  'theme.primaryDark': '#0f2460',
};

const HOI_THEME_VALUES = {
  'theme.primary': '#f97316',
  'theme.primaryDark': '#111111',
};

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
  ['services.booth-reservation.title', 'Booth Reservation detail title', 'Booth Reservation'],
  ['services.booth-reservation.description', 'Booth Reservation detail description', 'Reserve exhibition space at Yashobhoomi with HOI managing availability, coordination, and booking support.'],
  ['services.booth-design.title', 'Booth Design detail title', 'Booth Design'],
  ['services.booth-design.description', 'Booth Design detail description', 'Create a strong exhibition identity with booth layouts tailored for visibility, flow, and brand impact.'],
  ['services.booth-install-demolition.title', 'Booth Install & Demolition detail title', 'Booth Install & Demolition'],
  ['services.booth-install-demolition.description', 'Booth Install & Demolition detail description', 'Manage installation, supervision, and teardown with disciplined execution around the event schedule.'],
  ['services.logistics.title', 'Logistics Services detail title', 'Logistics Services'],
  ['services.logistics.description', 'Logistics Services detail description', 'Coordinate movement, handling, and material support for smooth exhibition delivery.'],
  ['services.marketing.title', 'Marketing Services detail title', 'Marketing Services'],
  ['services.marketing.description', 'Marketing Services detail description', 'Promote the exhibition presence before the event with brand-focused marketing support.'],
  ['services.interpretation-protocol.title', 'Interpretation & Protocol detail title', 'Interpretation & Protocol'],
  ['services.interpretation-protocol.description', 'Interpretation & Protocol detail description', 'Support visitors, delegates, and executives with language and protocol coordination.'],
  ['contact.title', 'Contact page title', 'Contact Us'],
  ['contact.description', 'Contact page description', 'Reach out to our team for inquiries, quotations, or to book any of our services.'],
  ['about.hero.title', 'About hero title', 'About HOI Business Center'],
  ['about.hero.description', 'About hero description', 'Your trusted exhibition service partner for booth reservation, booth design, booth install & demolition, logistics services, marketing services, and interpretation & protocol.'],
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

async function ensureDefaultContent() {
  const db = await getDb();
  for (const [key, label, value] of DEFAULT_CONTENT) {
    const existing = await db.prepare('SELECT id FROM cms_content WHERE content_key = ?').get(key);
    if (!existing) {
      await db.prepare(`
        INSERT INTO cms_content (content_key, label, value, type)
        VALUES (?, ?, ?, 'text')
      `).run(key, label, value);
    }
  }
}

async function ensureDefaultContentOnce() {
  if (defaultContentReady) return;
  if (!defaultContentPromise) {
    defaultContentPromise = ensureDefaultContent()
      .then(() => {
        defaultContentReady = true;
      })
      .finally(() => {
        defaultContentPromise = null;
      });
  }
  await defaultContentPromise;
}

async function normalizeLegacyThemeContent() {
  const db = await getDb();
  for (const [contentKey, legacyValue] of Object.entries(LEGACY_THEME_VALUES)) {
    const row = await db.prepare('SELECT id, value FROM cms_content WHERE content_key = ?').get(contentKey);
    if (row && row.value === legacyValue) {
      await db.prepare('UPDATE cms_content SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE content_key = ?')
        .run(HOI_THEME_VALUES[contentKey], contentKey);
    }
  }
}

function normalizeThemeValue(contentKey, value) {
  if (contentKey in LEGACY_THEME_VALUES && value === LEGACY_THEME_VALUES[contentKey]) {
    return HOI_THEME_VALUES[contentKey];
  }
  return value;
}

router.get('/content', async (req, res) => {
  try {
    await ensureDefaultContentOnce();
    await normalizeLegacyThemeContent();
    const db = await getDb();
    const rows = await db.prepare(`
      SELECT id, content_key, label, value, type, updated_at
      FROM cms_content
      ORDER BY content_key
    `).all();
    const normalizedRows = rows.map((row) => ({
      ...row,
      value: normalizeThemeValue(row.content_key, row.value),
    }));
    res.json({
      success: true,
      data: {
        content: normalizedRows,
        map: Object.fromEntries(normalizedRows.map((row) => [row.content_key, row.value])),
      },
    });
  } catch (error) {
    console.error('CMS content error:', error);
    res.status(500).json({ success: false, message: 'Failed to load CMS content' });
  }
});

router.post('/content', requireAdmin, async (req, res) => {
  try {
    const { contentKey, label, value, type = 'text' } = req.body;
    if (!contentKey || !label || typeof value !== 'string') {
      return res.status(400).json({ success: false, message: 'Content key, label, and value are required' });
    }
    const normalizedValue = normalizeThemeValue(contentKey, value);
    const db = await getDb();
    const existing = await db.prepare('SELECT id FROM cms_content WHERE content_key = ?').get(contentKey);
    if (existing) {
      await db.prepare('UPDATE cms_content SET label = ?, value = ?, type = ?, updated_at = CURRENT_TIMESTAMP WHERE content_key = ?')
        .run(label, normalizedValue, type, contentKey);
    } else {
      await db.prepare('INSERT INTO cms_content (content_key, label, value, type, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)')
        .run(contentKey, label, normalizedValue, type);
    }
    res.json({ success: true, message: 'Content saved successfully' });
  } catch (error) {
    console.error('CMS save error:', error);
    res.status(500).json({ success: false, message: 'Failed to save content' });
  }
});

router.delete('/content/:key', requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    await db.prepare('DELETE FROM cms_content WHERE content_key = ?').run(req.params.key);
    res.json({ success: true, message: 'Content deleted successfully' });
  } catch (error) {
    console.error('CMS delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete content' });
  }
});

export default router;
