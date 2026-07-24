import { createHash } from 'node:crypto';
import { getDb } from '../config/database.js';

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
  if (!raw) return IICC_BASE_URL;
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
    const venue = clean((block.match(/fa-map-marker[^>]*><\/i>\s*([\s\S]*?)<\/p>/) || [])[1] || '');
    const date = clean((block.match(/fa-calendar[^>]*><\/i>\s*([\s\S]*?)<\/b>/) || [])[1] || '');

    if (!name || !date || !venue) continue;

    events.push({
      name,
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
  if (!sourceKeys.length) return;

  const placeholderList = sourceKeys.map(() => '?').join(', ');
  await db.run(
    `DELETE FROM events WHERE source_provider = ? AND source_key NOT IN (${placeholderList})`,
    [SYNC_PROVIDER, ...sourceKeys]
  );
}

async function upsertEvent(db, event) {
  await db.run(
    `
      INSERT INTO events (
        name, date, venue, location_id, category, status,
        source_provider, source_key, source_url, source_synced_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        date = VALUES(date),
        venue = VALUES(venue),
        location_id = VALUES(location_id),
        category = VALUES(category),
        status = VALUES(status),
        source_provider = VALUES(source_provider),
        source_url = VALUES(source_url),
        source_synced_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
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

export async function syncIiccEvents({ db = null, options = {}, pruneMissing = true } = {}) {
  const targetDb = db || await getDb();
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
};
