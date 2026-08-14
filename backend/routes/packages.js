import express from 'express';
import { PACKAGE_DETAILS } from '../data/seed-data.js';
import { FIRESTORE_COLLECTIONS, getFirestoreDb } from '../services/firestore.js';
import { serializeFirestoreDocs } from '../services/firestore-serialize.js';

const router = express.Router();

const CANONICAL_PACKAGE_CATEGORIES = Object.keys(PACKAGE_DETAILS);

function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getCanonicalPackage(category, subcategory) {
  return PACKAGE_DETAILS[category]?.[subcategory] || null;
}

function getCanonicalPackageList(category) {
  return Object.entries(PACKAGE_DETAILS[category] || {}).map(([subcategory, data]) => ({
    category,
    subcategory,
    title: data.title,
    subtitle: data.subtitle,
    price: data.price,
    price_note: data.priceNote,
    description: data.description,
    includes: data.includes,
    notIncludes: data.notIncludes,
    duration: data.duration,
  }));
}

function mergeCanonicalPackages(rows, category) {
  const rowsBySubcategory = new Map(rows.map((row) => [row.subcategory, row]));
  return getCanonicalPackageList(category).map((fallback) => {
    const row = rowsBySubcategory.get(fallback.subcategory);
    return {
      ...fallback,
      ...(row || {}),
      includes: parseJsonArray(row?.includes).length ? parseJsonArray(row.includes) : fallback.includes,
      notIncludes: parseJsonArray(row?.not_includes).length ? parseJsonArray(row.not_includes) : fallback.notIncludes,
      price_note: row?.price_note || fallback.price_note,
      title: row?.title || fallback.title,
      subtitle: row?.subtitle || fallback.subtitle,
      price: row?.price || fallback.price,
      description: row?.description || fallback.description,
      duration: row?.duration || fallback.duration,
    };
  });
}

async function loadPackages() {
  try {
    const db = getFirestoreDb();
    const snap = await db.collection(FIRESTORE_COLLECTIONS.packages).get();
    const packages = serializeFirestoreDocs(snap);
    if (packages.length) {
      return packages;
    }
  } catch (error) {
    console.warn('Falling back to seed packages:', error?.message || error);
  }

  return CANONICAL_PACKAGE_CATEGORIES.flatMap((category) => (
    Object.entries(PACKAGE_DETAILS[category] || {}).map(([subcategory, data]) => ({
      category,
      subcategory,
      title: data.title,
      subtitle: data.subtitle,
      price: data.price,
      price_note: data.priceNote,
      description: data.description,
      includes: data.includes,
      not_includes: data.notIncludes,
      duration: data.duration,
    }))
  ));
}

router.get('/', async (req, res) => {
  try {
    const packages = await loadPackages();
    const parsedPackages = CANONICAL_PACKAGE_CATEGORIES.flatMap((category) => {
      const categoryRows = packages.filter((pkg) => pkg.category === category);
      return mergeCanonicalPackages(categoryRows, category);
    });

    res.json({
      success: true,
      data: { packages: parsedPackages },
    });
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch packages from database' });
  }
});

router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const packages = (await loadPackages()).filter((pkg) => pkg.category === category);
    const parsedPackages = mergeCanonicalPackages(packages, category);

    res.json({
      success: true,
      data: { packages: parsedPackages },
    });
  } catch (error) {
    console.error('Get packages by category error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch packages from database' });
  }
});

router.get('/:id', async (req, res, next) => {
  if (!/^\d+$/.test(req.params.id)) return next();
  try {
    const packages = await loadPackages();
    const pkg = packages.find((item) => String(item.id) === String(req.params.id));

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    res.json({
      success: true,
      data: {
        package: {
          ...pkg,
          includes: parseJsonArray(pkg.includes),
          notIncludes: parseJsonArray(pkg.not_includes),
        },
      },
    });
  } catch (error) {
    console.error('Get package by id error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch package from database' });
  }
});

router.get('/:category/:subcategory', async (req, res) => {
  try {
    const { category, subcategory } = req.params;
    const packages = await loadPackages();
    const pkg = packages.find((item) => item.category === category && item.subcategory === subcategory);

    if (!pkg) {
      const fallback = getCanonicalPackage(category, subcategory);
      if (!fallback) {
        return res.status(404).json({ success: false, message: 'Package not found' });
      }

      return res.json({
        success: true,
        data: {
          package: {
            category,
            subcategory,
            title: fallback.title,
            subtitle: fallback.subtitle,
            price: fallback.price,
            price_note: fallback.priceNote,
            description: fallback.description,
            includes: fallback.includes,
            notIncludes: fallback.notIncludes,
            duration: fallback.duration,
          },
        },
      });
    }

    const parsedPackage = {
      ...pkg,
      includes: parseJsonArray(pkg.includes),
      notIncludes: parseJsonArray(pkg.not_includes),
    };

    res.json({
      success: true,
      data: { package: parsedPackage },
    });
  } catch (error) {
    console.error('Get package error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch package from database' });
  }
});

export default router;
