import express from 'express';
import { getDb } from '../config/database.js';

const router = express.Router();

// Get all packages
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const packages = await db.prepare(`
      SELECT
        id,
        category,
        subcategory,
        title,
        subtitle,
        price,
        price_note,
        description,
        includes,
        not_includes,
        duration,
        created_at,
        updated_at
      FROM packages
      ORDER BY category, subcategory
    `).all();

    // Parse JSON fields
    const parsedPackages = packages.map(pkg => ({
      ...pkg,
      includes: JSON.parse(pkg.includes || '[]'),
      notIncludes: JSON.parse(pkg.not_includes || '[]')
    }));

    res.json({
      success: true,
      data: { packages: parsedPackages }
    });
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch packages'
    });
  }
});

// Get packages by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const db = await getDb();

    const packages = await db.prepare(`
      SELECT
        id,
        category,
        subcategory,
        title,
        subtitle,
        price,
        price_note,
        description,
        includes,
        not_includes,
        duration,
        created_at,
        updated_at
      FROM packages
      WHERE category = ?
      ORDER BY subcategory
    `).all(category);

    // Parse JSON fields
    const parsedPackages = packages.map(pkg => ({
      ...pkg,
      includes: JSON.parse(pkg.includes || '[]'),
      notIncludes: JSON.parse(pkg.not_includes || '[]')
    }));

    res.json({
      success: true,
      data: { packages: parsedPackages }
    });
  } catch (error) {
    console.error('Get packages by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch packages'
    });
  }
});

// Get package by database ID
router.get('/:id', async (req, res, next) => {
  if (!/^\d+$/.test(req.params.id)) return next();
  try {
    const db = await getDb();
    const pkg = await db.prepare(`
      SELECT
        id,
        category,
        subcategory,
        title,
        subtitle,
        price,
        price_note,
        description,
        includes,
        not_includes,
        duration,
        created_at,
        updated_at
      FROM packages
      WHERE id = ?
    `).get(req.params.id);

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.json({
      success: true,
      data: {
        package: {
          ...pkg,
          includes: JSON.parse(pkg.includes || '[]'),
          notIncludes: JSON.parse(pkg.not_includes || '[]')
        }
      }
    });
  } catch (error) {
    console.error('Get package by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch package'
    });
  }
});

// Get specific package
router.get('/:category/:subcategory', async (req, res) => {
  try {
    const { category, subcategory } = req.params;
    const db = await getDb();

    const pkg = await db.prepare(`
      SELECT
        id,
        category,
        subcategory,
        title,
        subtitle,
        price,
        price_note,
        description,
        includes,
        not_includes,
        duration,
        created_at,
        updated_at
      FROM packages
      WHERE category = ? AND subcategory = ?
    `).get(category, subcategory);

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    // Parse JSON fields
    const parsedPackage = {
      ...pkg,
      includes: JSON.parse(pkg.includes || '[]'),
      notIncludes: JSON.parse(pkg.not_includes || '[]')
    };

    res.json({
      success: true,
      data: { package: parsedPackage }
    });
  } catch (error) {
    console.error('Get package error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch package'
    });
  }
});

export default router;
