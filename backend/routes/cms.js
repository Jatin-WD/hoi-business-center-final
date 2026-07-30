import express from 'express';
import { getDb } from '../config/database.js';
import { requireAdmin } from '../middleware/auth.js';
import { TARGET_LANGUAGES, translateCmsPayload } from '../services/cms-translation.js';

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

const LEGACY_HOME_VALUES = {
  'home.hero.focusTitle': 'Official exhibition venue for every public service flow',
  'home.hero.focusDesc': 'The homepage stays centered on one venue so users do not have to decode multiple locations or mixed service models.',
  'home.locations.body': 'Yashobhoomi is the official HOI showcase venue for exhibitions and convention-led services.',
  'home.locations.cardBadge': 'Official venue spotlight',
  'home.locations.cardTitle': "Yashobhoomi, India International Convention and Expo Centre",
  'home.locations.cardDescription': "HOI Business Center's primary exhibition venue.",
  'home.hero.badge': "India's Premier Exhibition & Business Center Service",
  'home.hero.title': 'Your Complete Exhibition Partner at HOI Business Center',
  'home.hero.description': 'From booth reservation to booth design, booth install & demolition, logistics services, marketing services, and interpretation & protocol - we handle every aspect of your exhibition journey at Yashobhoomi and beyond.',
  'home.services.title': 'Our Services',
  'home.services.description': 'Comprehensive exhibition solutions designed to make your presence unforgettable. Select any service to begin your journey.',
  'home.locations.title': 'Where We Operate',
  'home.locations.description': "From India's premier MICE destination to global exhibition hubs",
  'home.why.title': 'Why Choose KIL - HOI Business Center?',
  'home.why.description': "We are the official HOI partner at Yashobhoomi - India's largest MICE destination. Our end-to-end services ensure your exhibition is seamless, professional, and impactful.",
  'home.cta.title': 'Ready to Elevate Your Exhibition Presence?',
  'home.cta.description': 'Contact our team today and let us create an unforgettable exhibition experience for your brand.',
};

const HOI_HOME_VALUES = {
  'home.hero.focusTitle': 'Official venue spotlight for Yashobhoomi',
  'home.hero.focusDesc': 'The homepage keeps every public path centered on one venue and six official services so the content stays simple and clear.',
  'home.hero.badge': 'Official Yashobhoomi exhibition portal',
  'home.hero.title': 'Yashobhoomi Exhibition Services by HOI Business Center',
  'home.hero.description': 'Book the six HOI exhibition services at Yashobhoomi in one place: booth reservation, booth design, booth install & demolition, logistics services, marketing services, and interpretation & protocol.',
  'home.services.title': 'Yashobhoomi Exhibition Services',
  'home.services.description': 'The public site uses one simple model: Yashobhoomi as the venue, and only these six service paths.',
  'home.locations.title': 'Yashobhoomi venue spotlight',
  'home.locations.description': 'Venue-led presentation with factual details and a clean image-first layout.',
  'home.locations.body': 'Yashobhoomi is the official HOI venue for exhibition and convention-led services.',
  'home.locations.cardBadge': 'Official venue spotlight',
  'home.locations.cardTitle': 'Yashobhoomi, India International Convention and Expo Centre',
  'home.locations.cardDescription': 'HOI Business Center primary exhibition venue at Yashobhoomi.',
  'home.why.title': 'Why choose HOI Business Center for Yashobhoomi exhibitions?',
  'home.why.description': 'An official, structured service experience built to reduce confusion and keep the content focused.',
  'home.cta.title': 'Plan your Yashobhoomi exhibition with HOI',
  'home.cta.description': 'Use the booking flow or contact the team for a direct response. The workflow stays simple and tied to Yashobhoomi.',
  'home.process.title': 'Simple booking sequence',
  'home.process.description': 'The homepage now guides users in a straight line from service discovery to booking.',
  'home.process.selectService': 'Select service',
  'home.process.review': 'Review detail page',
  'home.process.start': 'Start booking',
  'home.process.coordinate': 'Coordinate execution',
  'home.process.selectServiceBody': 'Open the service catalog and choose the required service card.',
  'home.process.reviewBody': 'Read the service description, package links, and Yashobhoomi context.',
  'home.process.startBody': 'Move into the booking flow to confirm scope and requirements.',
  'home.process.coordinateBody': 'HOI team manages delivery, support, and on-ground coordination.',
  'home.why.item1': 'Official venue-first presentation',
  'home.why.item2': 'Only six canonical services on public site',
  'home.why.item3': 'Separate manpower application flow',
  'home.why.item4': 'CMS-backed copy for easy updates',
  'home.note.body': 'This homepage keeps the public information model strict and simple, which makes it easier for users to understand what HOI offers and where each path leads.',
  'footer.about': 'HOI Business Center provides end-to-end exhibition services including booth reservation, booth design, booth install & demolition, logistics services, marketing services, and interpretation & protocol.',
};

const DEFAULT_LANGUAGE = 'en';
const SUPPORTED_LANGUAGE_CODES = new Set(['en', 'hi', 'ko']);

const DEFAULT_CONTENT = [
  ['home.hero.badge', 'Home hero badge', 'Official Yashobhoomi exhibition portal'],
  ['home.hero.title', 'Home hero title', 'Yashobhoomi Exhibition Services by HOI Business Center'],
  ['home.hero.highlight', 'Home hero highlight', 'Exhibition Partner'],
  ['home.hero.description', 'Home hero description', 'Book the six HOI exhibition services at Yashobhoomi in one place: booth reservation, booth design, booth install & demolition, logistics services, marketing services, and interpretation & protocol.'],
  ['home.hero.focusTitle', 'Home hero focus title', 'Official venue spotlight for Yashobhoomi'],
  ['home.hero.focusDesc', 'Home hero focus description', 'The homepage keeps every public path centered on one venue and six official services so the content stays simple and clear.'],
  ['home.services.title', 'Home services title', 'Yashobhoomi Exhibition Services'],
  ['home.services.description', 'Home services description', 'The public site uses one simple model: Yashobhoomi as the venue, and only these six service paths.'],
  ['home.locations.title', 'Home locations title', 'Yashobhoomi venue spotlight'],
  ['home.locations.description', 'Home locations description', 'Venue-led presentation with factual details and a clean image-first layout.'],
  ['home.locations.body', 'Home locations body', 'Yashobhoomi is the official HOI venue for exhibition and convention-led services.'],
  ['home.locations.cardBadge', 'Home locations card badge', 'Official venue spotlight'],
  ['home.locations.cardTitle', 'Home locations card title', 'Yashobhoomi, India International Convention and Expo Centre'],
  ['home.locations.cardDescription', 'Home locations card description', 'HOI Business Center primary exhibition venue at Yashobhoomi.'],
  ['home.why.title', 'Home why choose title', 'Why choose HOI Business Center for Yashobhoomi exhibitions?'],
  ['home.why.description', 'Home why choose description', 'An official, structured service experience built to reduce confusion and keep the content focused.'],
  ['home.cta.title', 'Home CTA title', 'Plan your Yashobhoomi exhibition with HOI'],
  ['home.cta.description', 'Home CTA description', 'Use the booking flow or contact the team for a direct response. The workflow stays simple and tied to Yashobhoomi.'],
  ['service.hero.title', 'Service page hero title', 'Exhibition Services'],
  ['service.hero.description', 'Service page hero description', 'Explore the six HOI services centered on Yashobhoomi: booth reservation, booth design, booth install & demolition, logistics services, marketing services, and interpretation & protocol. Services, packages, and venue content are managed from the admin panel.'],
  ['service.overview.title', 'Service catalog title', 'Service Catalog'],
  ['service.overview.description', 'Service catalog description', 'Choose a service to view package options, or open the Yashobhoomi venue flow to see how each package can be arranged there.'],
  ['services.page.title', 'Services page title', 'Services'],
  ['services.page.description', 'Services page description', 'Explore the six canonical HOI services at Yashobhoomi. Each card opens a dedicated description page, and every service can flow into the booking path.'],
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
  ['about.whoTitle', 'About who we are title', 'Built around Yashobhoomi and the full exhibition journey.'],
  ['about.body1', 'About body 1', "HOI Business Center is the premier exhibition and event services provider at Yashobhoomi - India's largest MICE (Meetings, Incentives, Conferences & Exhibitions) venue, located in Dwarka, New Delhi."],
  ['about.body2', 'About body 2', 'Our team of seasoned professionals provides comprehensive end-to-end services for exhibitors, ensuring that every aspect of your exhibition journey - from initial booth reservation to final demolition - is handled with expertise and care.'],
  ['about.body3', 'About body 3', 'Everything we present on the public site is centered on Yashobhoomi and the six canonical HOI services, so the experience stays simple and consistent.'],
  ['about.ourApproach', 'About approach badge', 'Our approach'],
  ['about.approachTitle', 'About approach title', 'We combine venue understanding, execution discipline, and client-first planning.'],
  ['about.approachBody', 'About approach body', 'The result is a service experience that feels premium, organized, and directly tied to how exhibitions actually run on the ground.'],
  ['about.value.excellence', 'About value excellence', 'Excellence'],
  ['about.value.excellenceDesc', 'About value excellence description', 'We deliver the highest standards in every service.'],
  ['about.value.reliability', 'About value reliability', 'Reliability'],
  ['about.value.reliabilityDesc', 'About value reliability description', 'Your timeline is our commitment. We never miss a deadline.'],
  ['about.value.innovation', 'About value innovation', 'Innovation'],
  ['about.value.innovationDesc', 'About value innovation description', 'Creative booth designs and marketing strategies that stand out.'],
  ['about.value.partnership', 'About value partnership', 'Partnership'],
  ['about.value.partnershipDesc', 'About value partnership description', 'We treat every client as a long-term partner, not a transaction.'],
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

function normalizeLanguageCode(value) {
  const code = String(value || DEFAULT_LANGUAGE).toLowerCase();
  return SUPPORTED_LANGUAGE_CODES.has(code) ? code : DEFAULT_LANGUAGE;
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

async function normalizeLegacyHomeContent() {
  const db = await getDb();
  for (const [contentKey, legacyValue] of Object.entries(LEGACY_HOME_VALUES)) {
    const row = await db.prepare('SELECT id, value FROM cms_content WHERE content_key = ?').get(contentKey);
    if (row && row.value === legacyValue) {
      await db.prepare('UPDATE cms_content SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE content_key = ?')
        .run(HOI_HOME_VALUES[contentKey], contentKey);
    }
  }
}

function normalizeThemeValue(contentKey, value) {
  if (contentKey in LEGACY_THEME_VALUES && value === LEGACY_THEME_VALUES[contentKey]) {
    return HOI_THEME_VALUES[contentKey];
  }
  return value;
}

async function loadCmsRowsForLanguage(lang) {
  const db = await getDb();
  const baseRows = await db.prepare(`
    SELECT id, content_key, label, value, type, updated_at
    FROM cms_content
    ORDER BY content_key
  `).all();

  const normalizedBaseRows = baseRows.map((row) => ({
    ...row,
    value: normalizeThemeValue(row.content_key, row.value),
  }));

  if (lang === DEFAULT_LANGUAGE) {
    return normalizedBaseRows;
  }

  const translations = await db.prepare(`
    SELECT content_key, label, value, type, updated_at
    FROM content_translations
    WHERE language_code = ?
    ORDER BY content_key
  `).all(lang);

  const translationMap = new Map(
    translations.map((row) => [
      row.content_key,
      {
        label: row.label,
        value: normalizeThemeValue(row.content_key, row.value),
        type: row.type,
        updated_at: row.updated_at,
      },
    ]),
  );

  return normalizedBaseRows.map((row) => {
    const translation = translationMap.get(row.content_key);
    if (!translation) return row;
    return {
      ...row,
      label: translation.label || row.label,
      value: translation.value ?? row.value,
      type: translation.type || row.type,
      updated_at: translation.updated_at || row.updated_at,
    };
  });
}

router.get('/content', async (req, res) => {
  try {
    await ensureDefaultContentOnce();
    await normalizeLegacyThemeContent();
    await normalizeLegacyHomeContent();
    const lang = normalizeLanguageCode(req.query.lang);
    const normalizedRows = await loadCmsRowsForLanguage(lang);
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
    const { contentKey, label, value, type = 'text', languageCode } = req.body;
    if (!contentKey || !label || typeof value !== 'string') {
      return res.status(400).json({ success: false, message: 'Content key, label, and value are required' });
    }
    const lang = normalizeLanguageCode(languageCode);
    const normalizedValue = normalizeThemeValue(contentKey, value);
    const db = await getDb();
    if (lang === DEFAULT_LANGUAGE) {
      const existing = await db.prepare('SELECT id FROM cms_content WHERE content_key = ?').get(contentKey);
      if (existing) {
        await db.prepare('UPDATE cms_content SET label = ?, value = ?, type = ?, updated_at = CURRENT_TIMESTAMP WHERE content_key = ?')
          .run(label, normalizedValue, type, contentKey);
      } else {
        await db.prepare('INSERT INTO cms_content (content_key, label, value, type, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)')
          .run(contentKey, label, normalizedValue, type);
      }

      const translatedTargets = [];
      for (const targetLang of TARGET_LANGUAGES) {
        try {
          const translatedLabel = await translateCmsPayload(label, targetLang, 'label');
          const translatedValue = await translateCmsPayload(normalizedValue, targetLang, contentKey);
          const translatedValueText = typeof translatedValue === 'string' ? translatedValue : JSON.stringify(translatedValue);
          const translatedLabelText = typeof translatedLabel === 'string' ? translatedLabel : label;
          const existingTranslation = await db.prepare('SELECT id FROM content_translations WHERE content_key = ? AND language_code = ?').get(contentKey, targetLang);
          if (existingTranslation) {
            await db.prepare('UPDATE content_translations SET label = ?, value = ?, type = ?, updated_at = CURRENT_TIMESTAMP WHERE content_key = ? AND language_code = ?')
              .run(translatedLabelText, translatedValueText, type, contentKey, targetLang);
          } else {
            await db.prepare('INSERT INTO content_translations (content_key, language_code, label, value, type, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)')
              .run(contentKey, targetLang, translatedLabelText, translatedValueText, type);
          }
          translatedTargets.push(targetLang);
        } catch (translationError) {
          console.warn(`CMS auto-translation skipped for ${contentKey} -> ${targetLang}:`, translationError.message || translationError);
        }
      }
      res.json({
        success: true,
        message: 'Content saved successfully',
        translation: {
          status: translatedTargets.length ? 'completed' : 'skipped',
          languages: translatedTargets,
        },
      });
      return;
    } else {
      const existing = await db.prepare('SELECT id FROM content_translations WHERE content_key = ? AND language_code = ?').get(contentKey, lang);
      if (existing) {
        await db.prepare('UPDATE content_translations SET label = ?, value = ?, type = ?, updated_at = CURRENT_TIMESTAMP WHERE content_key = ? AND language_code = ?')
          .run(label, normalizedValue, type, contentKey, lang);
      } else {
        await db.prepare('INSERT INTO content_translations (content_key, language_code, label, value, type, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)')
          .run(contentKey, lang, label, normalizedValue, type);
      }
    }
    res.json({ success: true, message: 'Content saved successfully', translation: { status: lang === DEFAULT_LANGUAGE ? 'completed' : 'manual' } });
  } catch (error) {
    console.error('CMS save error:', error);
    res.status(500).json({ success: false, message: 'Failed to save content' });
  }
});

router.delete('/content/:key', requireAdmin, async (req, res) => {
  try {
    const lang = normalizeLanguageCode(req.query.lang);
    const db = await getDb();
    if (lang === DEFAULT_LANGUAGE) {
      await db.prepare('DELETE FROM cms_content WHERE content_key = ?').run(req.params.key);
      await db.prepare('DELETE FROM content_translations WHERE content_key = ?').run(req.params.key);
    } else {
      await db.prepare('DELETE FROM content_translations WHERE content_key = ? AND language_code = ?').run(req.params.key, lang);
    }
    res.json({ success: true, message: 'Content deleted successfully' });
  } catch (error) {
    console.error('CMS delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete content' });
  }
});

export default router;
