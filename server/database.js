import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import './config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data', 'store.json');

// Default initial data seeds (no hardcoded credentials; local admin is bootstrapped from env when empty)
const initialSeeds = {
  admins: [],

  websiteSettings: {
    brandName: "Petal & Thread",
    legalName: "Petal & Thread Atelier Ltd.",
    tagline: "Handcrafted Treasures & Bespoke Fashion Atelier",
    taglineShort: "Little things, made with a lot of love.",
    description: "A sanctuary of handcrafted crochet wonders, delicate botanical hair accessories, bespoke feminine tailoring, and romantic fashion artwork.",
    contactEmail: "atelier@petalandthread.com",
    ordersEmail: "custom@petalandthread.com",
    phone: "+1 (555) 382-7432",
    whatsappNumber: "15553827432",
    whatsappDisplay: "+1 (555) 382-7432",
    instagramUrl: "https://instagram.com/petalandthread",
    pinterestUrl: "https://pinterest.com/petalandthread",
    heroHeadline: "Little things, made with a lot of love.",
    heroDescription: "Discover a world of handmade treasures, thoughtful fashion and beautiful creations.",
    heroBadge: "Bespoke & Handcrafted in Small Batches",
    heroImage: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85",
    logoUrl: "",
    updatedAt: new Date().toISOString()
  },

  categories: [
    {
      id: "cat-1",
      slug: "crochet-keychains",
      name: "Crochet Keychains",
      tag: "Small Wonders",
      shortDescription: "Hand-stitched keychains, miniature botanical charms, and lovable keepsakes.",
      image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
      itemCount: "8 items",
      displayOrder: 1
    },
    {
      id: "cat-2",
      slug: "crochet-flowers",
      name: "Crochet Flowers",
      tag: "Forever Bloom",
      shortDescription: "Everlasting crochet tulips, daisy arrangements, and romantic botanical bouquets.",
      image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
      itemCount: "12 items",
      displayOrder: 2
    },
    {
      id: "cat-3",
      slug: "hair-accessories",
      name: "Hair Accessories",
      tag: "Feminine Accents",
      shortDescription: "Delicate embroidered clips, velvet bows, and pearl-sprinkled floral pins.",
      image: "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?auto=format&fit=crop&w=800&q=80",
      itemCount: "9 items",
      displayOrder: 3
    },
    {
      id: "cat-4",
      slug: "handmade-gifts",
      name: "Handmade Gifts",
      tag: "Artisan Keepsakes",
      shortDescription: "Thoughtful gift sets, commemorative keepsakes, and heirloom charms.",
      image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
      itemCount: "15 items",
      displayOrder: 4
    },
    {
      id: "cat-5",
      slug: "clothing",
      name: "Clothing",
      tag: "Slow Fashion",
      shortDescription: "Original feminine garments, vintage-inspired collars, and slow fashion silhouettes.",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
      itemCount: "6 pieces",
      displayOrder: 5
    },
    {
      id: "cat-6",
      slug: "custom-creations",
      name: "Custom Creations",
      tag: "Made Just For You",
      shortDescription: "Personalized colorways, made-to-measure bridal hairpieces, and bespoke stitching.",
      image: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=80",
      itemCount: "Bespoke",
      displayOrder: 6
    }
  ],

  products: [
    {
      id: "prod-1",
      name: "Vintage Blossom Crochet Keychain",
      categorySlug: "crochet-keychains",
      categoryName: "Crochet Keychains",
      price: 24,
      originalPrice: 28,
      stock: 14,
      status: "available", // available | sold_out
      isFeatured: true,
      badge: "Bestseller",
      images: [
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Delicately crocheted five-petal blossom keychain handcrafted from 100% mercerized Egyptian cotton thread. Finished with a brushed rose-gold keyring and a tiny hand-stamped brass petal charm.",
      materials: "100% Mercerized Cotton, Brass Hardware, Rose Gold Finish",
      dimensions: "Flower 2.5\" diameter • Total length 4.5\"",
      variants: [
        { name: "Dusty Blush", inStock: true },
        { name: "Warm Ivory", inStock: true },
        { name: "Sage Mist", inStock: true }
      ],
      createdAt: "2026-10-15T09:00:00.000Z",
      updatedAt: "2026-11-01T12:00:00.000Z"
    },
    {
      id: "prod-2",
      name: "Handmade Crochet Tulip Stem",
      categorySlug: "crochet-flowers",
      categoryName: "Crochet Flowers",
      price: 32,
      originalPrice: null,
      stock: 8,
      status: "available",
      isFeatured: true,
      badge: "Artisan Favorite",
      images: [
        "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80"
      ],
      description: "An everlasting spring tulip sculpted from buttery soft milk cotton yarn. Features a flexible wrapped floral wire stem and a lifelike leaf that can be gently shaped in any vase.",
      materials: "Premium Milk Cotton Yarn, Wrapped Floral Wire Core",
      dimensions: "Stem length 13.5\" • Bloom 2.8\" height",
      variants: [
        { name: "Powder Pink", inStock: true },
        { name: "Soft Lilac", inStock: true },
        { name: "Sunshine Yellow", inStock: true },
        { name: "Butter Cream", inStock: true }
      ],
      createdAt: "2026-10-16T10:00:00.000Z",
      updatedAt: "2026-11-01T12:00:00.000Z"
    },
    {
      id: "prod-3",
      name: "Wildflower Embroidered Hair Clips (Set of 3)",
      categorySlug: "hair-accessories",
      categoryName: "Hair Accessories",
      price: 28,
      originalPrice: 34,
      stock: 6,
      status: "available",
      isFeatured: true,
      badge: "Limited Run",
      images: [
        "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Trio of vintage alligator clips upholstered in unbleached Belgian linen and meticulously embroidered with tiny forget-me-nots and French knot rosebuds. Gentle grip suitable for all hair types.",
      materials: "Belgian Linen, Silk Embroidery Floss, Non-slip Alligator Base",
      dimensions: "Clip length 2.8\" each",
      variants: [
        { name: "Pastel Meadow Trio", inStock: true },
        { name: "Autumn Rose Trio", inStock: false }
      ],
      createdAt: "2026-10-18T14:30:00.000Z",
      updatedAt: "2026-11-02T10:00:00.000Z"
    },
    {
      id: "prod-4",
      name: "Meadow Whisper Crochet Bouquet",
      categorySlug: "crochet-flowers",
      categoryName: "Crochet Flowers",
      price: 88,
      originalPrice: 98,
      stock: 4,
      status: "available",
      isFeatured: true,
      badge: "Signature Gift",
      images: [
        "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80"
      ],
      description: "A breathtaking permanent arrangement featuring 7 hand-crocheted blooms: two blush garden roses, one ivory tulip, chamomile daisies, and delicate eucalyptus sprigs wrapped in craft parchment.",
      materials: "Combed Cotton Yarns, Paper-wrapped Wire, Silk Ribbon Tie",
      dimensions: "Bouquet height 15\" • Spread approx 9\"",
      variants: [
        { name: "Blush & Ivory Ribbon", inStock: true },
        { name: "Sage & Lace Ribbon", inStock: true }
      ],
      createdAt: "2026-10-20T11:00:00.000Z",
      updatedAt: "2026-11-03T14:00:00.000Z"
    },
    {
      id: "prod-5",
      name: "Botanical Silk Scrunchie & Detachable Ribbon",
      categorySlug: "hair-accessories",
      categoryName: "Hair Accessories",
      price: 22,
      originalPrice: null,
      stock: 12,
      status: "available",
      isFeatured: true,
      badge: "New Arrival",
      images: [
        "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Hand-dyed mulberry silk scrunchie paired with an optional detachable embroidered ribbon tail. Dyed using natural rosehip and madder root extracts for a soft romantic patina.",
      materials: "100% Organic Mulberry Silk, Natural Botanical Plant Dyes",
      dimensions: "Scrunchie 4\" relaxed • Ribbon tail 9\"",
      variants: [
        { name: "Rose Madder", inStock: true },
        { name: "Ivory Chamomile", inStock: true },
        { name: "Sage Eucalyptus", inStock: true }
      ],
      createdAt: "2026-10-22T16:00:00.000Z",
      updatedAt: "2026-11-03T16:00:00.000Z"
    },
    {
      id: "prod-6",
      name: "Mini Daisy Crochet Bag Charm",
      categorySlug: "crochet-keychains",
      categoryName: "Crochet Keychains",
      price: 19,
      originalPrice: null,
      stock: 20,
      status: "available",
      isFeatured: true,
      badge: "Gift Choice",
      images: [
        "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"
      ],
      description: "A whimsical sunny daisy charm with sunny yellow core and pure white petals. Designed to clip effortlessly onto totes, straw summer bags, or key pouches.",
      materials: "Perle Cotton Yarn, Lobster Swivel Clasp",
      dimensions: "Daisy diameter 2\" • Total drop 3.8\"",
      variants: [
        { name: "Classic White", inStock: true },
        { name: "Pastel Lavender", inStock: true }
      ],
      createdAt: "2026-10-25T12:00:00.000Z",
      updatedAt: "2026-11-04T08:00:00.000Z"
    },
    {
      id: "prod-7",
      name: "Scalloped Linen Peter Pan Collar",
      categorySlug: "clothing",
      categoryName: "Clothing",
      price: 54,
      originalPrice: 62,
      stock: 5,
      status: "available",
      isFeatured: false,
      badge: "Atelier Piece",
      images: [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"
      ],
      description: "A detachable statement collar crafted from washed oatmeal European linen, bordered with delicate hand-crocheted picot lace and tied with satin ribbons.",
      materials: "100% European Flax Linen, Hand-crocheted Lace Trim",
      dimensions: "Adjustable neck fit (14\" - 17\")",
      variants: [
        { name: "Oatmeal Linen", inStock: true },
        { name: "Pure Ivory Linen", inStock: true }
      ],
      createdAt: "2026-10-28T14:00:00.000Z",
      updatedAt: "2026-11-04T09:00:00.000Z"
    },
    {
      id: "prod-8",
      name: "Bespoke Heirloom Baby Bonnet & Booties",
      categorySlug: "custom-creations",
      categoryName: "Custom Creations",
      price: 76,
      originalPrice: null,
      stock: 3,
      status: "available",
      isFeatured: false,
      badge: "Heirloom",
      images: [
        "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Softest organic bamboo-cotton baby keepsake set customized with the child's embroidered initials and birth date along the bonnet brim.",
      materials: "Organic Bamboo-Cotton Blend, Silk Satin Ribbon",
      dimensions: "Sizes available: 0-3M, 3-6M, 6-12M",
      variants: [
        { name: "0-3 Months", inStock: true },
        { name: "3-6 Months", inStock: true },
        { name: "6-12 Months", inStock: true }
      ],
      createdAt: "2026-10-30T10:00:00.000Z",
      updatedAt: "2026-11-04T10:00:00.000Z"
    }
  ],

  fashionPortfolio: [
    {
      id: "fashion-1",
      title: "The Scalloped Linen Smock Dress",
      description: "Hand-tailored smock dress made from high-thread unbleached European flax linen. Features hand-crocheted picot trim on the Peter Pan collar and billowy gathered cuffs.",
      category: "Dresses & Silhouettes",
      photos: [
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85"
      ],
      sketches: [
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80"
      ],
      fabrics: "100% GOTS Organic European Flax Linen, Hand-dyed Cotton Thread",
      sizes: "Made to Measure (XS to 3XL custom drafting)",
      availableForCustom: true,
      createdAt: "2026-10-10T12:00:00.000Z"
    },
    {
      id: "fashion-2",
      title: "Botanical Sleeve Silk Atelier Blouse",
      description: "Romantic blouson sleeve blouse crafted from sandwashed silk habotai, embellished with miniature embroidered daisy sprigs and hand-crocheted covered buttons.",
      category: "Blouses & Tops",
      photos: [
        "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80"
      ],
      sketches: [
        "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80"
      ],
      fabrics: "Sandwashed Mulberry Silk Habotai, Fine French Lace",
      sizes: "Custom measurements provided via consultation",
      availableForCustom: true,
      createdAt: "2026-10-22T15:00:00.000Z"
    }
  ],

  artGallery: [
    {
      id: "art-1",
      title: "The Botanical Dresser",
      medium: "Watercolor & Digital Gouache",
      category: "Fashion Illustration",
      year: "2026",
      dimensions: "12\" × 16\" Archival Print",
      image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=85",
      description: "Inspired by morning light filtering through antique lace curtains, depicting delicate crochet sprigs interwoven with organza.",
      isFeatured: true,
      createdAt: "2026-10-01T10:00:00.000Z"
    },
    {
      id: "art-2",
      title: "Flora & Thread Silhouette",
      medium: "Ink, Gold Leaf & Fine Line",
      category: "Fashion Illustration",
      year: "2026",
      dimensions: "11\" × 14\" Limited Edition",
      image: "https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?auto=format&fit=crop&w=900&q=85",
      description: "A minimalist study of high-fashion tailoring adorned with organic botanical silhouettes.",
      isFeatured: true,
      createdAt: "2026-10-05T11:00:00.000Z"
    },
    {
      id: "art-3",
      title: "Crochet Tulip Symphony",
      medium: "Pastel on Heavy Cotton Paper",
      category: "Botanical Study",
      year: "2026",
      dimensions: "9\" × 12\" Study",
      image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=900&q=85",
      description: "Color explorations studying the gradient transitions of dyed milk cotton yarn.",
      isFeatured: false,
      createdAt: "2026-10-12T14:00:00.000Z"
    },
    {
      id: "art-4",
      title: "Atelier Nocturne in Rose",
      medium: "Digital Mixed Media",
      category: "Studio Mood",
      year: "2026",
      dimensions: "16\" × 20\" Print",
      image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=900&q=85",
      description: "The romantic quiet of the studio after dark, surrounded by spools of thread and porcelain teacups.",
      isFeatured: true,
      createdAt: "2026-10-15T18:00:00.000Z"
    },
    {
      id: "art-5",
      title: "Lace Collar Study No. 4",
      medium: "Graphite & Hand-Toned Tea Wash",
      category: "Textile Study",
      year: "2026",
      dimensions: "8\" × 10\" Original",
      image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=900&q=85",
      description: "Detailed architectural line drawing of scalloped crochet edging for bridal boleros.",
      isFeatured: false,
      createdAt: "2026-10-20T09:00:00.000Z"
    }
  ],

  orders: [
    {
      id: "ord-1082",
      orderNumber: "PT-1082",
      customerName: "Sophia Miller",
      customerEmail: "sophia.miller@example.com",
      customerPhone: "+1 (555) 749-1204",
      products: [
        { name: "Vintage Blossom Crochet Keychain", quantity: 2, price: 24, variant: "Dusty Blush" },
        { name: "Handmade Crochet Tulip Stem", quantity: 1, price: 32, variant: "Powder Pink" }
      ],
      totalPrice: 80,
      paymentStatus: "Paid", // Paid | Pending | Refunded
      orderStatus: "Crafting", // Pending | Processing | Crafting | Shipped | Delivered | Cancelled
      notes: "Customer requested gift wrap with rose satin ribbon.",
      shippingAddress: "42 Magnolia Way, Savannah, GA 31401",
      createdAt: "2026-11-02T14:15:00.000Z"
    },
    {
      id: "ord-1081",
      orderNumber: "PT-1081",
      customerName: "Emily Vance",
      customerEmail: "emily.vance@example.com",
      customerPhone: "+1 (555) 612-8890",
      products: [
        { name: "Meadow Whisper Crochet Bouquet", quantity: 1, price: 88, variant: "Blush & Ivory Ribbon" }
      ],
      totalPrice: 88,
      paymentStatus: "Paid",
      orderStatus: "Shipped",
      notes: "Tracking number PT-USPS-940011 sent to customer.",
      shippingAddress: "128 Broad St, Charleston, SC 29401",
      createdAt: "2026-10-31T11:20:00.000Z"
    },
    {
      id: "ord-1080",
      orderNumber: "PT-1080",
      customerName: "Hannah Abbott",
      customerEmail: "hannah.a@example.com",
      customerPhone: "+1 (555) 438-2910",
      products: [
        { name: "Wildflower Embroidered Hair Clips (Set of 3)", quantity: 1, price: 28, variant: "Pastel Meadow Trio" }
      ],
      totalPrice: 28,
      paymentStatus: "Paid",
      orderStatus: "Delivered",
      notes: "Delivered on Nov 3. Customer loved the packaging.",
      shippingAddress: "78 King Street, Charleston, SC 29401",
      createdAt: "2026-10-28T09:40:00.000Z"
    }
  ],

  customEnquiries: [
    {
      id: "enq-201",
      customerName: "Clara Evans",
      customerEmail: "clara.evans@example.com",
      customerPhone: "+1 (555) 304-9912",
      creationType: "Crochet Bouquet / Florals",
      colorPalette: "Dusty rose, champagne cream and sage green",
      deadline: "December 14, 2026 (Wedding Anniversary)",
      details: "Would love an everlasting bouquet featuring 5 blush roses, 3 white daisies, and custom initials embroidered on the handle ribbon.",
      referenceImages: [
        "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80"
      ],
      status: "In Discussion", // New | In Discussion | In Progress | Completed | Archived
      adminNotes: "Sent palette proposal on Nov 2 via WhatsApp. Clara confirmed preference for satin ribbon.",
      createdAt: "2026-11-02T16:45:00.000Z"
    },
    {
      id: "enq-202",
      customerName: "Julianna Ross",
      customerEmail: "jross@example.com",
      customerPhone: "+1 (555) 882-4115",
      creationType: "Made-to-Measure Garment",
      colorPalette: "Unbleached natural linen",
      deadline: "January 20, 2027",
      details: "Inquiring about having the Scalloped Linen Dress tailored with 3/4 length sleeves instead of short sleeves for an autumn garden ceremony.",
      referenceImages: [],
      status: "New",
      adminNotes: "",
      createdAt: "2026-11-03T18:10:00.000Z"
    },
    {
      id: "enq-203",
      customerName: "Beatrice Montgomery",
      customerEmail: "beatrice.m@example.com",
      customerPhone: "+1 (555) 219-6734",
      creationType: "Hair Clip / Bridal Accessory",
      colorPalette: "Pearl white and soft ivory",
      deadline: "November 25, 2026",
      details: "Set of 6 matching floral bobby pins for bridesmaids hair styling.",
      referenceImages: [],
      status: "In Progress",
      adminNotes: "Crocheting petals now. Will ship by Nov 18.",
      createdAt: "2026-10-29T10:30:00.000Z"
    }
  ]
};

const BOOTSTRAP_PASSWORD_PLACEHOLDERS = new Set([
  'replace_with_strong_local_password',
  'your_admin_password',
  'changeme',
  'password',
  'admin'
]);

function ensureBootstrapAdmin(data) {
  if (!Array.isArray(data.admins)) {
    data.admins = [];
  }

  // Preserve any existing local admin accounts without overwriting
  if (data.admins.length > 0) {
    return false;
  }

  const email = (process.env.ADMIN_BOOTSTRAP_EMAIL || '').trim();
  const rawUsername = (process.env.ADMIN_BOOTSTRAP_USERNAME || '').trim();
  const password = typeof process.env.ADMIN_BOOTSTRAP_PASSWORD === 'string'
    ? process.env.ADMIN_BOOTSTRAP_PASSWORD
    : '';
  const name = (process.env.ADMIN_BOOTSTRAP_NAME || 'Atelier Administrator').trim();

  if (!email && !rawUsername && !password) {
    return false;
  }

  const identifier = rawUsername || (email.includes('@') ? email.split('@')[0] : email);
  if (!identifier || !password || password.length < 8 || BOOTSTRAP_PASSWORD_PLACEHOLDERS.has(password.trim())) {
    console.warn(
      '⚠ Skipping local admin bootstrap: provide a valid ADMIN_BOOTSTRAP_EMAIL (or ADMIN_BOOTSTRAP_USERNAME) and a non-placeholder ADMIN_BOOTSTRAP_PASSWORD of at least 8 characters.'
    );
    return false;
  }

  data.admins.push({
    id: `admin-${Date.now()}`,
    username: identifier,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    name,
    role: 'admin',
    createdAt: new Date().toISOString()
  });

  console.info('✔ Bootstrapped initial local admin account from environment variables.');
  return true;
}

// Ensure directory and load DB
function ensureDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let data;
  if (!fs.existsSync(DB_PATH)) {
    data = structuredClone(initialSeeds);
    ensureBootstrapAdmin(data);
    saveDb(data);
    return data;
  }

  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    data = JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file, restoring clean seeds:', err);
    data = structuredClone(initialSeeds);
    ensureBootstrapAdmin(data);
    saveDb(data);
    return data;
  }

  if (ensureBootstrapAdmin(data)) {
    saveDb(data);
  }

  return data;
}

// Atomic save
export function saveDb(data) {
  const tempPath = `${DB_PATH}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, DB_PATH);
}

export function getDb() {
  return ensureDb();
}

// Initialize database on import
ensureDb();
