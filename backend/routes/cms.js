import express from 'express';
import { requireAdmin } from '../middleware/auth.js';
import {
  deleteCmsContent,
  loadCmsContent,
  normalizeCmsLanguageCode,
  saveCmsContent,
} from '../services/cms-store.js';

const router = express.Router();

router.get('/content', async (req, res) => {
  try {
    const lang = normalizeCmsLanguageCode(req.query.lang);
    const content = await loadCmsContent(lang);
    res.json({
      success: true,
      data: {
        content,
        map: Object.fromEntries(content.map((row) => [row.content_key, row.value])),
      },
    });
  } catch (error) {
    console.error('CMS content error:', error);
    res.status(500).json({ success: false, message: 'Failed to load CMS content' });
  }
});

router.post('/content', requireAdmin, async (req, res) => {
  try {
    const result = await saveCmsContent(req.body);
    res.json({
      success: true,
      message: 'Content saved successfully',
      translation: result.translation,
    });
  } catch (error) {
    console.error('CMS save error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to save content',
    });
  }
});

router.delete('/content/:key', requireAdmin, async (req, res) => {
  try {
    await deleteCmsContent(req.params.key, req.query.lang);
    res.json({ success: true, message: 'Content deleted successfully' });
  } catch (error) {
    console.error('CMS delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete content' });
  }
});

export default router;
