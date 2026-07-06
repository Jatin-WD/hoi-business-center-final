import express from 'express';
import { getDb } from '../config/database.js';

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

// Get all services
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const services = await db.prepare(`
      SELECT *
      FROM services
      ORDER BY service_id
    `).all();

    // Parse JSON fields
    const parsedServices = services
      .filter((service) => CANONICAL_SERVICE_IDS.has(service.service_id))
      .sort((a, b) => CANONICAL_SERVICE_ORDER.indexOf(a.service_id) - CANONICAL_SERVICE_ORDER.indexOf(b.service_id))
      .map((service) => ({
      ...service,
      label: service.label || service.name || service.slug || 'Service',
      description: service.description || '',
      packages: parseJsonArray(service.packages),
      features: parseJsonArray(service.features),
      images: parseJsonArray(service.images),
      price: service.price || '',
      durationType: service.duration_type || service.durationType || '',
      durationValue: service.duration_value || service.durationValue || '',
    }));

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
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Parse JSON fields
    const parsedService = {
      ...service,
      label: service.label || service.name || service.slug || 'Service',
      description: service.description || '',
      packages: parseJsonArray(service.packages),
      features: parseJsonArray(service.features),
      images: parseJsonArray(service.images),
      price: service.price || '',
      durationType: service.duration_type || service.durationType || '',
      durationValue: service.duration_value || service.durationValue || '',
    };

    if (!CANONICAL_SERVICE_IDS.has(parsedService.service_id)) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

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
