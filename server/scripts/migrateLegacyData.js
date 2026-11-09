/**
 * Petal & Thread - Legacy Data Migration Script
 * 
 * Safely migrates categories, products, fashion portfolio, art gallery,
 * website settings, and custom customer enquiries from `server/data/store.json`
 * into Cloud Firestore collections.
 * 
 * Storage Architecture:
 * - Public/Customer/Seller enquiry data: enquiries/{enquiryId} (WITHOUT adminNotes)
 * - Private administrative notes: admin_enquiry_notes/{enquiryId} (Admin only)
 * 
 * Usage:
 *   node server/scripts/migrateLegacyData.js --seller-id=<valid_firebase_uid> [--dry-run]
 * 
 * Note: An explicit valid seller UID is MANDATORY. Dummy or fallback IDs are strictly rejected.
 * A genuine dry-run performs ZERO filesystem writes and ZERO database reads/writes.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { adminDb, isInitialized } from '../config/firebaseAdmin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORE_PATH = path.join(__dirname, '../data/store.json');
const BACKUP_PATH = path.join(__dirname, '../data/store.json.bak');

function parseArgs() {
  const isDryRun = process.argv.includes('--dry-run');
  const sellerIdArg = process.argv.find(arg => arg.startsWith('--seller-id='));
  const sellerId = sellerIdArg ? sellerIdArg.split('=').slice(1).join('=') : null;
  return { isDryRun, sellerId };
}

async function migrate() {
  const { isDryRun, sellerId } = parseArgs();

  console.log('====================================================');
  console.log('🌸 Petal & Thread - Legacy Storefront to Firestore Migration');
  console.log(`Execution Mode: ${isDryRun ? '🔍 DRY RUN (Preview only — 0 writes)' : '🚀 LIVE EXECUTION'}`);
  console.log('====================================================\n');

  // Enforce mandatory valid seller UID
  if (!sellerId || sellerId.trim().length === 0 || sellerId === 'flagship-artisan-sister') {
    console.error('❌ Error: A valid Firebase seller UID is required via the --seller-id flag.');
    console.log('\nDummy or placeholder seller IDs are strictly forbidden.');
    console.log('To provision your flagship seller and obtain their UID:');
    console.log('   node server/scripts/seedFirstSeller.js --email=sister@petalandthread.com');
    console.log('\nThen run migration with the resulting UID:');
    console.log('   node server/scripts/migrateLegacyData.js --seller-id=<SELLER_UID> [--dry-run]\n');
    process.exit(1);
  }

  if (!fs.existsSync(STORE_PATH)) {
    console.error(`❌ Error: Source file not found at ${STORE_PATH}`);
    process.exit(1);
  }

  // Backup creation occurs ONLY during an explicitly authorized live migration.
  // Under --dry-run, absolutely zero filesystem writes are performed.
  if (!isDryRun) {
    if (!fs.existsSync(BACKUP_PATH)) {
      fs.copyFileSync(STORE_PATH, BACKUP_PATH);
      console.log(`✔ Safe backup preserved at: ${BACKUP_PATH}`);
    } else {
      console.log(`ℹ Backup already exists at: ${BACKUP_PATH}`);
    }
  } else {
    console.log(`ℹ [DRY RUN] Filesystem writes disabled. Would preserve backup at: ${BACKUP_PATH}`);
  }

  const rawData = fs.readFileSync(STORE_PATH, 'utf8');
  const store = JSON.parse(rawData);

  // Read actual customEnquiries collection from store.json (with fallback to enquiries)
  const enquiriesList = store.customEnquiries || store.enquiries || [];

  console.log(`\nFound in store.json:`);
  console.log(`- Categories: ${(store.categories || []).length}`);
  console.log(`- Products: ${(store.products || []).length}`);
  console.log(`- Fashion items: ${(store.fashionPortfolio || []).length}`);
  console.log(`- Art pieces: ${(store.artGallery || []).length}`);
  console.log(`- Custom Enquiries: ${enquiriesList.length}`);

  if (!isDryRun) {
    if (!isInitialized || !adminDb) {
      console.error('\n❌ Error: Firebase Admin SDK is not initialized.');
      console.log('Please ensure server/config/serviceAccountKey.json is present to perform a live migration.');
      console.log('You can run with --dry-run to validate the data mapping offline.');
      process.exit(1);
    }

    // Verify the seller profile exists before linking products
    try {
      const sellerDoc = await adminDb.collection('seller_profiles').doc(sellerId).get();
      if (!sellerDoc.exists) {
        console.warn(`⚠ Warning: No seller profile found in "seller_profiles" for UID: ${sellerId}.`);
        console.log('Please run seedFirstSeller.js first to create the creator profile before running live migration.');
        process.exit(1);
      }
      console.log(`✔ Verified target seller profile: "${sellerDoc.data()?.storeName || sellerId}"`);
    } catch (checkErr) {
      console.error('❌ Failed to verify seller profile in Firestore:', checkErr.message);
      process.exit(1);
    }
  }

  // 1. Migrate Categories
  console.log('\n--- 1. Migrating Categories ---');
  for (const cat of store.categories || []) {
    const catData = {
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      tag: cat.tag || '',
      shortDescription: cat.shortDescription || '',
      image: cat.image,
      itemCount: cat.itemCount || '0 items',
      displayOrder: cat.displayOrder || 1,
      createdAt: new Date().toISOString()
    };

    if (isDryRun) {
      console.log(`  [DRY RUN] Would set category: ${cat.id} ("${cat.name}")`);
    } else {
      await adminDb.collection('categories').doc(cat.id).set(catData, { merge: true });
      console.log(`  ✔ Migrated category: ${cat.id} ("${cat.name}")`);
    }
  }

  // 2. Migrate Products (Strictly assigned to validated seller UID with approved status)
  console.log(`\n--- 2. Migrating Products (Assigned to Seller UID: ${sellerId}) ---`);
  for (const prod of store.products || []) {
    const formattedImages = (prod.images || []).map((imgUrl, idx) => ({
      url: imgUrl,
      publicId: `legacy-migration-${prod.id}-${idx}`,
      isPrimary: idx === 0
    }));

    const prodData = {
      id: prod.id,
      sellerId: sellerId,
      sellerStoreName: 'Petal & Thread Studio',
      title: prod.name,
      name: prod.name,
      categoryId: prod.categorySlug,
      categorySlug: prod.categorySlug,
      categoryName: prod.categoryName,
      price: Number(prod.price) || 0,
      originalPrice: prod.originalPrice ? Number(prod.originalPrice) : null,
      stock: Number(prod.stock) || 10,
      badge: prod.badge || null,
      images: formattedImages,
      imageUrl: formattedImages[0]?.url || '',
      description: prod.description || '',
      materials: prod.materials || '',
      dimensions: prod.dimensions || '',
      variants: prod.variants || [],
      isCustomizable: prod.categorySlug === 'custom-creations' || prod.categorySlug === 'clothing',
      customInstructionsPlaceholder: 'Please specify color palette, size, or custom charm preferences',
      status: 'approved', // Pre-existing boutique items are pre-approved flagship items
      rejectionReason: null,
      isFeatured: Boolean(prod.isFeatured),
      createdAt: prod.createdAt || new Date().toISOString(),
      updatedAt: prod.updatedAt || new Date().toISOString()
    };

    if (isDryRun) {
      console.log(`  [DRY RUN] Would set product: ${prod.id} ("${prod.name}") -> sellerId: ${sellerId}`);
    } else {
      await adminDb.collection('products').doc(prod.id).set(prodData, { merge: true });
      console.log(`  ✔ Migrated product: ${prod.id} ("${prod.name}")`);
    }
  }

  // 3. Migrate Fashion Portfolio
  console.log('\n--- 3. Migrating Fashion Portfolio ---');
  for (const item of store.fashionPortfolio || []) {
    if (isDryRun) {
      console.log(`  [DRY RUN] Would set fashion item: ${item.id} ("${item.title}")`);
    } else {
      await adminDb.collection('fashion_portfolio').doc(item.id).set(item, { merge: true });
      console.log(`  ✔ Migrated fashion item: ${item.id} ("${item.title}")`);
    }
  }

  // 4. Migrate Art Gallery
  console.log('\n--- 4. Migrating Art Gallery ---');
  for (const piece of store.artGallery || []) {
    if (isDryRun) {
      console.log(`  [DRY RUN] Would set art piece: ${piece.id} ("${piece.title}")`);
    } else {
      await adminDb.collection('art_gallery').doc(piece.id).set(piece, { merge: true });
      console.log(`  ✔ Migrated art piece: ${piece.id} ("${piece.title}")`);
    }
  }

  // 5. Migrate Website Settings
  if (store.websiteSettings) {
    console.log('\n--- 5. Migrating Website Settings ---');
    if (isDryRun) {
      console.log(`  [DRY RUN] Would set settings document: settings/website`);
    } else {
      await adminDb.collection('settings').doc('website').set(store.websiteSettings, { merge: true });
      console.log(`  ✔ Migrated settings document: settings/website`);
    }
  }

  // 6. Migrate Historical Custom Enquiries
  // Privacy Architecture:
  // - Customer/Seller visible data -> enquiries/{enquiryId} (WITHOUT adminNotes)
  // - Private studio notes -> admin_enquiry_notes/{enquiryId} (Admin only)
  console.log('\n--- 6. Migrating Historical Custom Enquiries ---');
  for (const enq of enquiriesList) {
    // Preserve authentic status semantics
    const statusMap = {
      'New': 'new',
      'In Discussion': 'in_discussion',
      'In Progress': 'in_progress',
      'Completed': 'completed',
      'Archived': 'archived'
    };

    const enqData = {
      id: enq.id,
      // Legacy enquiries were public web form submissions without user accounts or catalog product links.
      // We explicitly record null rather than fabricating dummy customer or product records.
      customerId: enq.customerId || null,
      productId: enq.productId || null,
      sellerId: sellerId,
      productTitle: enq.productTitle || enq.creationType || 'Custom Atelier Creation',
      customerName: enq.customerName || '',
      customerEmail: enq.customerEmail || '',
      customerPhone: enq.customerPhone || '',
      creationType: enq.creationType || 'Crochet Bouquet / Florals',
      colorPalette: enq.colorPalette || '',
      deadline: enq.deadline || '',
      details: enq.details || '',
      customInstructions: enq.details || '',
      referenceImages: Array.isArray(enq.referenceImages) ? enq.referenceImages : [],
      status: statusMap[enq.status] || (enq.status ? enq.status.toLowerCase().replace(/\s+/g, '_') : 'new'),
      sellerNotes: '', // Strictly empty unless actual seller notes exist
      // Notice: adminNotes is strictly EXCLUDED from the main enquiry document to prevent client exposure
      isLegacy: true,
      isUnregisteredCustomer: !enq.customerId,
      legacySource: 'store.json/customEnquiries',
      createdAt: enq.createdAt || new Date().toISOString(),
      updatedAt: enq.updatedAt || enq.createdAt || new Date().toISOString()
    };

    if (isDryRun) {
      console.log(`  [DRY RUN] Would set enquiry: ${enq.id} ("${enq.customerName || 'Anonymous'}") in enquiries/${enq.id}`);
    } else {
      await adminDb.collection('enquiries').doc(enq.id).set(enqData, { merge: true });
      console.log(`  ✔ Migrated enquiry: ${enq.id} ("${enq.customerName || 'Anonymous'}")`);
    }

    // Isolate non-empty private admin notes into the separate admin-only collection
    // Uses atomic create-if-absent (.create) to preserve any existing live admin notes without overwrite
    const rawAdminNotes = typeof enq.adminNotes === 'string' ? enq.adminNotes.trim() : '';
    if (rawAdminNotes.length > 0) {
      const adminNoteData = {
        enquiryId: enq.id,
        adminNotes: rawAdminNotes,
        updatedAt: enq.updatedAt || enq.createdAt || new Date().toISOString()
      };

      if (isDryRun) {
        console.log(`  [DRY RUN] Would create private admin note for: ${enq.id} in admin_enquiry_notes/${enq.id} (preserved if exists)`);
      } else {
        try {
          await adminDb.collection('admin_enquiry_notes').doc(enq.id).create(adminNoteData);
          console.log(`  ✔ Migrated private admin note for: ${enq.id} in admin_enquiry_notes/${enq.id}`);
        } catch (createErr) {
          const isAlreadyExists = createErr.code === 6 || 
                                  createErr.code === 'ALREADY_EXISTS' || 
                                  createErr.code === 'already-exists' ||
                                  (typeof createErr.message === 'string' && createErr.message.toLowerCase().includes('already exists'));
          if (isAlreadyExists) {
            console.log(`  ℹ Preserved existing live admin note for: ${enq.id} in admin_enquiry_notes/${enq.id}`);
          } else {
            throw createErr;
          }
        }
      }
    }
  }

  console.log('\n====================================================');
  console.log(`🎉 ${isDryRun ? 'DRY RUN FINISHED — ZERO filesystem writes and ZERO Firestore writes performed.' : 'MIGRATION COMPLETE!'}`);
  console.log(`Original JSON data file at ${STORE_PATH} remains 100% intact.`);
  console.log('====================================================\n');
}

migrate().catch(err => {
  console.error('Migration execution failed:', err);
  process.exit(1);
});
