const TARGET_LANGUAGES = ["hi", "ko"];
const SKIP_TRANSLATION_KEYS = new Set([
  "id",
  "href",
  "slug",
  "url",
  "phone",
  "email",
  "language_code",
  "content_key",
  "created_at",
  "updated_at",
  "enabled",
  "status",
]);

const TRANSLATABLE_HINT_KEYS = new Set([
  "label",
  "title",
  "subtitle",
  "description",
  "overview",
  "body",
  "text",
  "note",
  "hint",
  "message",
  "value",
  "headline",
  "eyebrow",
]);

const TRANSLATION_CACHE = new Map();

function getTargetLanguageName(lang) {
  if (lang === "hi") return "Hindi";
  if (lang === "ko") return "Korean";
  return "the target language";
}

function looksLikeJson(value) {
  const text = String(value || "").trim();
  return (text.startsWith("{") && text.endsWith("}")) || (text.startsWith("[") && text.endsWith("]"));
}

function looksLikePassthrough(value) {
  const text = String(value || "").trim();
  return (
    !text ||
    /^https?:\/\//i.test(text) ||
    /^\/[^\s]*$/.test(text) ||
    /^#[0-9a-fA-F]{3,8}$/.test(text) ||
    /^[0-9]+(\.[0-9]+)?$/.test(text) ||
    /^[A-Za-z0-9_-]+$/.test(text) && text.length <= 3
  );
}

async function translatePlainText(text, targetLang) {
  const sourceText = String(text ?? "");
  const cacheKey = `${targetLang}::${sourceText}`;
  if (TRANSLATION_CACHE.has(cacheKey)) {
    return TRANSLATION_CACHE.get(cacheKey);
  }

  const provider = String(process.env.TRANSLATION_PROVIDER || (process.env.OPENAI_API_KEY ? "openai" : "")).toLowerCase();
  if (provider !== "openai" || !process.env.OPENAI_API_KEY) {
    return null;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.TRANSLATION_OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: [
            "You translate CMS text for a public website.",
            `Translate from English into ${getTargetLanguageName(targetLang)}.`,
            "Preserve brand names and proper nouns exactly as written: HOI, Yashobhoomi, HOI Business Center, India International Convention and Expo Centre.",
            "Preserve punctuation, line breaks, and concise marketing tone.",
            "Return only the translated text. No quotes, no commentary.",
          ].join(" "),
        },
        { role: "user", content: sourceText },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Translation API error (${response.status}): ${errorText || response.statusText}`);
  }

  const payload = await response.json();
  const translated = String(payload?.choices?.[0]?.message?.content || "").trim();
  const result = translated || sourceText;
  TRANSLATION_CACHE.set(cacheKey, result);
  return result;
}

async function translateStructuredValue(value, targetLang, keyHint = "") {
  if (value === null || value === undefined) return value;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || looksLikePassthrough(trimmed) || SKIP_TRANSLATION_KEYS.has(keyHint)) {
      return value;
    }

    if (looksLikeJson(trimmed)) {
      try {
        const parsed = JSON.parse(trimmed);
        const translatedParsed = await translateStructuredValue(parsed, targetLang, keyHint);
        return JSON.stringify(translatedParsed);
      } catch {
        // Fall through to plain text translation.
      }
    }

    return (await translatePlainText(value, targetLang)) ?? value;
  }

  if (Array.isArray(value)) {
    const translated = [];
    for (const item of value) {
      translated.push(await translateStructuredValue(item, targetLang, keyHint));
    }
    return translated;
  }

  if (typeof value === "object") {
    const translated = {};
    for (const [nestedKey, nestedValue] of Object.entries(value)) {
      if (SKIP_TRANSLATION_KEYS.has(nestedKey)) {
        translated[nestedKey] = nestedValue;
        continue;
      }
      translated[nestedKey] = await translateStructuredValue(
        nestedValue,
        targetLang,
        TRANSLATABLE_HINT_KEYS.has(nestedKey) ? nestedKey : keyHint,
      );
    }
    return translated;
  }

  return value;
}

export async function translateCmsPayload(value, targetLang, keyHint = "") {
  return translateStructuredValue(value, targetLang, keyHint);
}

export { TARGET_LANGUAGES };
