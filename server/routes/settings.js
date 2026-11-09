import express from 'express';
import { getDb, saveDb } from '../database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET website settings (Public for site live sync & Admin)
router.get('/', (req, res) => {
  const db = getDb();
  res.json(db.websiteSettings || {});
});

// PUT update website settings (Admin only)
router.put('/', requireAdmin, (req, res) => {
  const db = getDb();
  const current = db.websiteSettings || {};
  const body = req.body;

  const updated = {
    ...current,
    brandName: body.brandName !== undefined ? body.brandName.trim() : current.brandName,
    legalName: body.legalName !== undefined ? body.legalName.trim() : current.legalName,
    tagline: body.tagline !== undefined ? body.tagline.trim() : current.tagline,
    taglineShort: body.taglineShort !== undefined ? body.taglineShort.trim() : current.taglineShort,
    description: body.description !== undefined ? body.description.trim() : current.description,
    contactEmail: body.contactEmail !== undefined ? body.contactEmail.trim() : current.contactEmail,
    ordersEmail: body.ordersEmail !== undefined ? body.ordersEmail.trim() : current.ordersEmail,
    phone: body.phone !== undefined ? body.phone.trim() : current.phone,
    whatsappNumber: body.whatsappNumber !== undefined ? body.whatsappNumber.replace(/[^0-9]/g, '') : current.whatsappNumber,
    whatsappDisplay: body.whatsappDisplay !== undefined ? body.whatsappDisplay.trim() : current.whatsappDisplay,
    instagramUrl: body.instagramUrl !== undefined ? body.instagramUrl.trim() : current.instagramUrl,
    pinterestUrl: body.pinterestUrl !== undefined ? body.pinterestUrl.trim() : current.pinterestUrl,
    heroHeadline: body.heroHeadline !== undefined ? body.heroHeadline.trim() : current.heroHeadline,
    heroDescription: body.heroDescription !== undefined ? body.heroDescription.trim() : current.heroDescription,
    heroBadge: body.heroBadge !== undefined ? body.heroBadge.trim() : current.heroBadge,
    heroImage: body.heroImage !== undefined ? body.heroImage : current.heroImage,
    logoUrl: body.logoUrl !== undefined ? body.logoUrl : current.logoUrl,
    updatedAt: new Date().toISOString()
  };

  db.websiteSettings = updated;
  saveDb(db);

  res.json({
    message: 'Website settings saved and updated live.',
    settings: updated
  });
});

export default router;
