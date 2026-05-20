import express from 'express';
import { getDb } from '../config/database.js';
import { fallbackServices } from '../utils/catalogFallback.js';

const router = express.Router();

// Get all services
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const services = await db.prepare(`
      SELECT
        id,
        service_id,
        label,
        packages,
        created_at,
        updated_at
      FROM services
      ORDER BY service_id
    `).all();

    // Parse JSON fields
    const parsedServices = services.map(service => ({
      ...service,
      packages: JSON.parse(service.packages || '[]')
    }));

    res.json({
      success: true,
      data: { services: parsedServices }
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.json({ success: true, data: { services: fallbackServices() }, fallback: true });
  }
});

// Get service by ID
router.get('/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const db = await getDb();

    const service = await db.prepare(`
      SELECT
        id,
        service_id,
        label,
        packages,
        created_at,
        updated_at
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
      packages: JSON.parse(service.packages || '[]')
    };

    res.json({
      success: true,
      data: { service: parsedService }
    });
  } catch (error) {
    console.error('Get service error:', error);
    const service = fallbackServices().find((item) => item.service_id === req.params.serviceId);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: { service }, fallback: true });
  }
});

export default router;
