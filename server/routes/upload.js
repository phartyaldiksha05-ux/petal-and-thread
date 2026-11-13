import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import { upload as diskUpload } from '../middleware/upload.js';
import { requireSellerOrAdmin } from '../middleware/auth.js';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

const router = express.Router();

/**
 * Validates actual binary file contents (magic bytes) to prevent extension spoofing.
 */
export function validateImageMagicBytes(buffer) {
  if (!buffer || buffer.length < 12) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return true;
  }

  // GIF: GIF87a or GIF89a (47 49 46 38)
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return true;
  }

  // WebP: RIFF (52 49 46 46) .... WEBP (57 45 42 50 at offset 8-11)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return true;
  }

  return false;
}

// In-memory Multer storage for streaming to Cloudinary
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB maximum
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only JPEG, PNG, WebP, and GIF images are permitted.'), false);
    }
  }
});

/**
 * Streams a buffer to Cloudinary with server-generated random public ID.
 */
function uploadToCloudinaryStream(fileBuffer, folder, originalName) {
  return new Promise((resolve, reject) => {
    const randomSuffix = crypto.randomBytes(8).toString('hex');
    const publicId = `${Date.now()}_${randomSuffix}`;

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        overwrite: false
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          filename: originalName,
          size: result.bytes,
          mimetype: `image/${result.format || 'jpeg'}`
        });
      }
    );
    stream.end(fileBuffer);
  });
}

/**
 * Resolves destination folder based on verified user identity.
 */
function getCloudinaryFolder(user) {
  if (user?.role === 'seller' || user?.seller) {
    const sellerId = user.sellerId || user.uid || 'unassigned';
    return `petal-and-thread/sellers/${sellerId}/products`;
  }
  return 'petal-and-thread/admin/products';
}

// Single image upload endpoint
router.post('/single', requireSellerOrAdmin, (req, res) => {
  const useCloudinary = isCloudinaryConfigured();
  const isProduction = process.env.NODE_ENV === 'production';

  // Production fail-closed: reject local storage when Cloudinary is unconfigured
  if (!useCloudinary && isProduction) {
    return res.status(503).json({
      error: 'Cloudinary image storage service is unconfigured. Uploads are disabled in production to prevent data loss.'
    });
  }

  if (useCloudinary) {
    memoryUpload.single('image')(req, res, async (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'Image size exceeds maximum allowed limit (5 MB).' });
        }
        return res.status(400).json({ error: err.message || 'Image upload failed.' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Please choose an image file to upload.' });
      }

      // Validate actual binary contents via magic bytes
      if (!validateImageMagicBytes(req.file.buffer)) {
        return res.status(400).json({
          error: 'Corrupt or invalid image content. File signature does not match JPEG, PNG, WebP, or GIF.'
        });
      }

      try {
        const folder = getCloudinaryFolder(req.user);
        const result = await uploadToCloudinaryStream(req.file.buffer, folder, req.file.originalname);

        return res.json({
          message: 'Image uploaded successfully to Cloudinary.',
          url: result.url,
          publicId: result.publicId,
          filename: result.filename,
          size: result.size,
          mimetype: result.mimetype
        });
      } catch (uploadError) {
        console.error('Cloudinary single upload failed:', uploadError);
        return res.status(502).json({
          error: 'Failed to upload image to Cloudinary storage service.'
        });
      }
    });
  } else {
    // Development fallback to local disk storage
    diskUpload.single('image')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'Image size exceeds maximum allowed limit (5 MB).' });
        }
        return res.status(400).json({ error: err.message || 'Image upload failed.' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Please choose an image file to upload.' });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      return res.json({
        message: 'Image uploaded successfully (local development storage).',
        url: fileUrl,
        publicId: req.file.filename,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    });
  }
});

// Multiple image upload endpoint (up to 6 files at once)
router.post('/multiple', requireSellerOrAdmin, (req, res) => {
  const useCloudinary = isCloudinaryConfigured();
  const isProduction = process.env.NODE_ENV === 'production';

  // Production fail-closed: reject local storage when Cloudinary is unconfigured
  if (!useCloudinary && isProduction) {
    return res.status(503).json({
      error: 'Cloudinary image storage service is unconfigured. Uploads are disabled in production to prevent data loss.'
    });
  }

  if (useCloudinary) {
    memoryUpload.array('images', 6)(req, res, async (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'One or more image sizes exceed the maximum allowed limit (5 MB).' });
        }
        return res.status(400).json({ error: err.message || 'Image upload failed.' });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Please select at least one image file.' });
      }

      // Pre-validate all files in the batch for magic bytes before uploading any
      for (const file of req.files) {
        if (!validateImageMagicBytes(file.buffer)) {
          return res.status(400).json({
            error: `File '${file.originalname}' has invalid or corrupt image content. Batch upload cancelled.`
          });
        }
      }

      try {
        const folder = getCloudinaryFolder(req.user);
        const settledResults = await Promise.allSettled(
          req.files.map((file) => uploadToCloudinaryStream(file.buffer, folder, file.originalname))
        );

        const succeeded = [];
        const failed = [];

        settledResults.forEach((resItem, idx) => {
          if (resItem.status === 'fulfilled') {
            succeeded.push(resItem.value);
          } else {
            failed.push({
              filename: req.files[idx].originalname,
              reason: resItem.reason?.message || 'Unknown upload failure'
            });
          }
        });

        // Atomic rollback: if any file failed, delete already-uploaded assets to avoid orphans
        if (failed.length > 0) {
          console.warn(`Partial upload failure: ${failed.length} failed. Rolling back ${succeeded.length} uploaded files...`);
          const cleanupErrors = [];

          for (const item of succeeded) {
            try {
              await cloudinary.uploader.destroy(item.publicId);
            } catch (cleanupErr) {
              console.error(`Rollback cleanup failed for publicId: ${item.publicId}`, cleanupErr);
              cleanupErrors.push({ publicId: item.publicId, error: cleanupErr.message });
            }
          }

          return res.status(502).json({
            error: `Batch upload failed (${failed.length} of ${req.files.length} images failed). All uploaded assets have been rolled back.`,
            failedFiles: failed,
            cleanupErrors: cleanupErrors.length > 0 ? cleanupErrors : undefined
          });
        }

        // All succeeded
        return res.json({
          message: `${succeeded.length} images uploaded successfully to Cloudinary.`,
          files: succeeded,
          urls: succeeded.map((r) => r.url)
        });
      } catch (overallError) {
        console.error('Cloudinary multiple stream upload crashed:', overallError);
        return res.status(502).json({
          error: 'Failed to upload images to Cloudinary storage service.'
        });
      }
    });
  } else {
    // Development fallback to local disk storage
    diskUpload.array('images', 6)(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'One or more image sizes exceed the maximum allowed limit (5 MB).' });
        }
        return res.status(400).json({ error: err.message || 'Image upload failed.' });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Please select at least one image file.' });
      }

      const files = req.files.map((f) => ({
        url: `/uploads/${f.filename}`,
        publicId: f.filename,
        filename: f.filename,
        size: f.size,
        mimetype: f.mimetype
      }));

      return res.json({
        message: `${files.length} images uploaded successfully (local development storage).`,
        files,
        urls: files.map((f) => f.url)
      });
    });
  }
});

export default router;
