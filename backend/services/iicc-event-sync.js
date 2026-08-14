import { createHash } from 'node:crypto';
import { FIRESTORE_COLLECTIONS, getFirestoreDb, serverTimestamp } from './firestore.js';

const IICC_BASE_URL = 'https://www.iiccnewdelhi.com';
const DEFAULT_WINDOW_DAYS = 365;
const SYNC_PROVIDER = 'IICC';

function decodeHtml(text) {
  return String(text || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/&ndash;/gi, '-')
    .replace(/&mdash;/gi, '-')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function clean(text) {
  return decodeHtml(text).replace(/\s*-\s*/g, ' - ').replace(/\s+/g, ' ').trim();
}

function toIsoDateParts(date = new Date(), timeZone = 'Asia/Kolkata') {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date).reduce((accumulator, part) => {
    if (part.type !== 'literal') accumulator[part.type] = part.value;
    return accumulator;
  }, {});
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function formatIsoDate(date = new Date(), timeZone = 'Asia/Kolkata') {
  const parts = toIsoDateParts(date, timeZone);
  const year = String(parts.year).padStart(4, '0');
  const month = String(parts.month).padStart(2, '0');
  const day = String(parts.day).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDaysIso(isoDate, days) {
  const [year, month, day] = isoDate.split('-').map((value) => Number(value));
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildSourceKey({ sourceUrl, name, date, venue, category }) {
  const raw = [sourceUrl || '', name || '', date || '', venue || '', category || ''].join('|').trim();
  return createHash('sha256').update(raw).digest('hex');
}

function normalizeSourceUrl(href) {
  const raw = String(href || '').trim();
  if (!raw) return '';
  if (/^javascript:/i.test(raw) || raw === '#') return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  return new URL(raw, IICC_BASE_URL).toString();
}

function parseIiccEventCards(html) {
  const cardRegex = /<a href="([^"]+)"[^>]*>\s*<div class="cardlis">([\s\S]*?)<\/div>\s*<\/a>/g;
  const events = [];

  for (const match of html.matchAll(cardRegex)) {
    const sourceUrl = match[1];
    const block = match[2];
    const category = clean((block.match(/<span>([\s\S]*?)<\/span>/) || [])[1] || '');
    const name = clean((block.match(/<h3>([\s\S]*?)<\/h3>/) || [])[1] || '');
    const description = clean((block.match(/<h5>([\s\S]*?)<\/h5>/i) || [])[1] || '');
    const venue = clean((block.match(/fa-map-marker[^>]*><\/i>\s*([\s\S]*?)<\/p>/) || [])[1] || '');
    const date = clean((block.match(/fa-calendar[^>]*><\/i>\s*([\s\S]*?)<\/b>/) || [])[1] || '');
    const imageUrl = normalizeSourceUrl((block.match(/<img[^>]+src="([^"]+)"/i) || [])[1] || '');

    if (!name || !date || !venue) continue;

    events.push({
      name,
      description,
      imageUrl,
      date,
      venue,
      locationId: 'yashobhoomi',
      category: category || 'Event',
      status: 'Upcoming',
      sourceProvider: SYNC_PROVIDER,
      sourceKey: buildSourceKey({
        sourceUrl,
        name,
        date,
        venue,
        category,
      }),
      sourceUrl: normalizeSourceUrl(sourceUrl),
    });
  }

  return events;
}

function pickFirst(...values) {
  for (const value of values) {
    const text = clean(value);
    if (text) return text;
  }
  return '';
}

function extractPagePreview(html) {
  const title = pickFirst(
    html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)?.[1],
    html.match(/<meta[^>]+name="twitter:title"[^>]+content="([^"]+)"/i)?.[1],
    html.match(/<title>([\s\S]*?)<\/title>/i)?.[1],
    html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
  );
  const description = pickFirst(
    html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i)?.[1],
    html.match(/<meta[^>]+name="twitter:description"[^>]+content="([^"]+)"/i)?.[1],
    html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i)?.[1],
    html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1]
  );
  const imageUrl = normalizeSourceUrl(
    html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)?.[1]
    || html.match(/<meta[^>]+name="twitter:image"[^>]+content="([^"]+)"/i)?.[1]
    || html.match(/<img[^>]+src="([^"]+)"/i)?.[1]
    || ''
  );

  return {
    title,
    description,
    imageUrl,
  };
}

export async function fetchSourcePreview(sourceUrl) {
  const normalizedUrl = normalizeSourceUrl(sourceUrl);
  if (!normalizedUrl) {
    return {
      description: '',
      imageUrl: '',
      title: '',
    };
  }

  const response = await fetch(normalizedUrl, { redirect: 'follow' });
  if (!response.ok) {
    return {
      description: '',
      imageUrl: '',
      title: '',
    };
  }

  const html = await response.text();
  return extractPagePreview(html);
}

export async function enrichEventMetadata(event) {
  const sourceUrl = event.sourceUrl || event.source_url || '';
  if (!sourceUrl) return event;
  if (event.description && event.imageUrl) return event;

  try {
    const preview = await fetchSourcePreview(sourceUrl);
    return {
      ...event,
      description: event.description || preview.description || '',
      imageUrl: event.imageUrl || preview.imageUrl || '',
      sourceTitle: event.sourceTitle || preview.title || '',
    };
  } catch {
    return event;
  }
}

export function buildIiccEventListUrl({
  startDate = formatIsoDate(),
  endDate = addDaysIso(formatIsoDate(), DEFAULT_WINDOW_DAYS),
} = {}) {
  const url = new URL('/event-list', IICC_BASE_URL);
  url.searchParams.set('exhibition', 'on');
  url.searchParams.set('conference', 'on');
  url.searchParams.set('culture_events', 'on');
  url.searchParams.set('other_events', 'on');
  url.searchParams.set('searchtitle', '');
  url.searchParams.set('start_date', startDate);
  url.searchParams.set('end_date', endDate);
  return url;
}

export async function fetchIiccEvents(options = {}) {
  const url = buildIiccEventListUrl(options);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`IICC event source returned ${response.status}`);
  }

  const html = await response.text();
  const events = parseIiccEventCards(html);
  if (!events.length) {
    throw new Error('No IICC events were parsed from the source page');
  }
  return events;
}

async function deleteMissingSyncedEvents(db, sourceKeys) {
  const syncedSnap = await db.collection(FIRESTORE_COLLECTIONS.events)
    .where('source_provider', '==', SYNC_PROVIDER)
    .get();
  const allowed = new Set(sourceKeys);
  const deletions = [];
  for (const docSnap of syncedSnap.docs) {
    const row = docSnap.data();
    if (!allowed.has(row.source_key)) {
      deletions.push(docSnap.ref.delete());
    }
  }
  await Promise.all(deletions);
}

async function upsertEvent(db, event) {
  const ref = db.collection(FIRESTORE_COLLECTIONS.events).doc(event.sourceKey);
  const existing = await ref.get();
  await ref.set({
    id: event.sourceKey,
    name: event.name,
    description: event.description,
    date: event.date,
    venue: event.venue,
    location_id: event.locationId,
    category: event.category,
    status: event.status,
    source_provider: event.sourceProvider,
    source_key: event.sourceKey,
    source_url: event.sourceUrl,
    source_synced_at: serverTimestamp(),
      created_at: existing.exists ? existing.data()?.created_at || serverTimestamp() : serverTimestamp(),
      updated_at: serverTimestamp(),
      image_url: event.imageUrl || '',
    }, { merge: true });
}

export async function syncIiccEvents({ db = null, options = {}, pruneMissing = true } = {}) {
  const targetDb = db || getFirestoreDb();
  const events = await fetchIiccEvents(options);

  for (const event of events) {
    await upsertEvent(targetDb, event);
  }

  if (pruneMissing) {
    await deleteMissingSyncedEvents(targetDb, events.map((event) => event.sourceKey));
  }

  return {
    count: events.length,
    events,
  };
}

let scheduledTimer = null;

function getNextSundayDelayMs({ timeZone = 'Asia/Kolkata', hour = 2, minute = 0 } = {}) {
  const now = new Date();
  const parts = toIsoDateParts(now, timeZone);
  const localNowMs = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  const localNow = new Date(localNowMs);
  const currentDay = localNow.getUTCDay();
  const targetDayOffset = currentDay === 0 ? 7 : 7 - currentDay;
  let targetMs = Date.UTC(parts.year, parts.month - 1, parts.day + targetDayOffset, hour, minute, 0);

  const targetAlreadyPassed =
    targetDayOffset === 0
    && (parts.hour > hour || (parts.hour === hour && (parts.minute > minute || (parts.minute === minute && parts.second > 0))));

  if (targetAlreadyPassed) {
    targetMs = Date.UTC(parts.year, parts.month - 1, parts.day + 7, hour, minute, 0);
  }

  return Math.max(0, targetMs - localNowMs);
}

export function scheduleIiccEventSync({ runImmediately = true, timeZone = 'Asia/Kolkata', hour = 2, minute = 0 } = {}) {
  const run = async () => {
    try {
      await syncIiccEvents({ pruneMissing: true });
      console.log('IICC event sync completed successfully');
    } catch (error) {
      console.error('IICC event sync failed:', error);
    } finally {
      const delay = getNextSundayDelayMs({ timeZone, hour, minute });
      scheduledTimer = setTimeout(run, delay);
      scheduledTimer.unref?.();
    }
  };

  if (scheduledTimer) return scheduledTimer;

  if (runImmediately) {
    void run();
    return null;
  }

  const delay = getNextSundayDelayMs({ timeZone, hour, minute });
  scheduledTimer = setTimeout(run, delay);
  scheduledTimer.unref?.();
  return scheduledTimer;
}

export default {
  fetchIiccEvents,
  syncIiccEvents,
  scheduleIiccEventSync,
  buildIiccEventListUrl,
  fetchSourcePreview,
  enrichEventMetadata,
};
