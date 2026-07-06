import express from 'express';
import { getDb } from '../config/database.js';
import { SERVICE_PACKAGES } from '../data/seed-data.js';

const router = express.Router();
const CANONICAL_SERVICE_ORDER = [
  'booth-reservation',
  'booth-design',
  'booth-install-demolition',
  'logistics',
  'marketing',
  'interpretation-protocol',
];
const CANONICAL_SERVICE_IDS = new Set(CANONICAL_SERVICE_ORDER);
const CANONICAL_SERVICE_MAP = new Map(
  CANONICAL_SERVICE_ORDER.map((serviceId) => [serviceId, SERVICE_PACKAGES[serviceId]])
);

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

function mergeCanonicalServices(rows) {
  const rowsById = new Map(rows.map((row) => [row.service_id, row]));

  return CANONICAL_SERVICE_ORDER
    .map((serviceId) => {
      const fallback = CANONICAL_SERVICE_MAP.get(serviceId);
      if (!fallback) return null;
      const row = rowsById.get(serviceId);
      const parsedPackages = parseJsonArray(row?.packages);
      return {
        service_id: serviceId,
        label: row?.label || fallback.label,
        description: row?.description || '',
        packages: parsedPackages.length ? parsedPackages : fallback.packages,
        features: parseJsonArray(row?.features),
        images: parseJsonArray(row?.images),
        price: row?.price || '',
        durationType: row?.duration_type || row?.durationType || '',
        durationValue: row?.duration_value || row?.durationValue || '',
      };
    })
    .filter(Boolean);
}

// Get all services
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const services = await db.prepare(`
      SELECT *
      FROM services
      ORDER BY service_id
    `).all();

    const parsedServices = mergeCanonicalServices(
      services.filter((service) => CANONICAL_SERVICE_IDS.has(service.service_id))
    );

    res.json({
      success: true,
      data: { services: parsedServices }
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch services from database' });
  }
});

// Get service by ID
router.get('/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const db = await getDb();

    const service = await db.prepare(`
      SELECT *
      FROM services
      WHERE service_id = ?
    `).get(serviceId);

    if (!service) {
      const fallback = CANONICAL_SERVICE_MAP.get(serviceId);
      if (!fallback) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }

      return res.json({
        success: true,
        data: {
          service: {
            service_id: serviceId,
            label: fallback.label,
            description: '',
            packages: fallback.packages,
            features: [],
            images: [],
            price: '',
            durationType: '',
            durationValue: '',
          },
        },
      });
    }

    if (!CANONICAL_SERVICE_IDS.has(service.service_id)) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    const parsedService = mergeCanonicalServices([service])[0];

    res.json({
      success: true,
      data: { service: parsedService }
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch service from database' });
  }
});

export default router;
