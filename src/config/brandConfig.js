/**
 * Petal & Thread - Single Brand Configuration File
 * All brand naming, contact details, social links, editorial copy,
 * categories, products, and gallery items are defined here.
 * Editing this file updates the entire website dynamically.
 */

export const brandConfig = {
  // Brand Identity
  brand: {
    name: "Petal & Thread",
    legalName: "Petal & Thread Atelier Ltd.",
    tagline: "Handcrafted Treasures & Bespoke Fashion Atelier",
    taglineShort: "Little things, made with a lot of love.",
    description: "A sanctuary of handcrafted crochet wonders, delicate botanical hair accessories, bespoke feminine tailoring, and romantic fashion artwork.",
    establishedYear: "2024",
    currency: "₹",
    currencyCode: "INR",
    creator: {
      name: "Amelia Thorne",
      role: "Founder, Artisan & Fashion Illustrator",
      location: "Charleston & Savannah Atelier",
      signature: "Amelia Thorne"
    }
  },

  // Contact & Social Links
  contact: {
    email: "atelier@petalandthread.com",
    ordersEmail: "custom@petalandthread.com",
    phone: "+1 (555) 382-7432",
    whatsappNumber: "15553827432", // International format without +
    whatsappDisplay: "+1 (555) 382-7432",
    address: {
      line1: "Studio 14, The Old Mill Courtyard",
      line2: "Historic District, Charleston, SC 29401",
      city: "Charleston",
      state: "South Carolina",
      country: "United States"
    },
    hours: "Tuesday – Saturday: 10:30 AM – 6:00 PM EST",
    social: {
      instagram: {
        handle: "@petalandthread",
        url: "https://instagram.com/petalandthread"
      },
      pinterest: {
        handle: "petalandthreadatelier",
        url: "https://pinterest.com/petalandthread"
      },
      tiktok: {
        handle: "@petalandthread",
        url: "https://tiktok.com/@petalandthread"
      }
    }
  },

  // Navigation Links
  navigation: [
    { label: "Home", href: "#home" },
    { label: "Shop", href: "#shop" },
    { label: "Fashion Studio", href: "#fashion-studio" },
    { label: "Art Gallery", href: "#art-gallery" },
    { label: "Our Story", href: "#our-story" },
    { label: "Contact", href: "#contact" }
  ],

  // Hero Section Copy & Assets
  hero: {
    headline: "Little things, made with a lot of love.",
    description: "Discover a world of handmade treasures, thoughtful fashion and beautiful creations.",
    badge: "Bespoke & Handcrafted in Small Batches",
    buttons: {
      primary: {
        text: "Explore the Collection",
        href: "#shop"
      },
      secondary: {
        text: "Discover Our Designs",
        href: "#fashion-studio"
      }
    },
    images: {
      main: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85", // Soft aesthetic craft & linen
      accent1: "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=600&q=80", // Crochet flowers & bouquet
      accent2: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80", // Soft fashion atelier vibe
    },
    stats: [
      { number: "100%", label: "Handcrafted with Love" },
      { number: "Pure", label: "Organic Cottons & Silks" },
      { number: "Bespoke", label: "Custom Fit & Orders" }
    ]
  },

  // Shop Categories (Section C)
  categories: [
    {
      id: "crochet-treasures",
      name: "Crochet Treasures",
      shortDescription: "Hand-stitched keychains, miniature botanical charms, and lovable keepsakes.",
      image: "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&w=800&q=80",
      tag: "Small Wonders",
      itemCount: "14 items"
    },
    {
      id: "hair-accessories",
      name: "Hair Accessories",
      shortDescription: "Delicate embroidered clips, velvet bows, and pearl-sprinkled floral pins.",
      image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80",
      tag: "Feminine Accents",
      itemCount: "9 items"
    },
    {
      id: "floral-creations",
      name: "Floral Creations",
      shortDescription: "Everlasting crochet tulips, daisy arrangements, and romantic botanical bouquets.",
      image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
      tag: "Forever Bloom",
      itemCount: "18 items"
    },
    {
      id: "fashion-studio",
      name: "Fashion Studio",
      shortDescription: "Original feminine garments, vintage-inspired collars, and slow fashion silhouettes.",
      image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
      tag: "Bespoke Silhouettes",
      itemCount: "8 pieces"
    },
    {
      id: "custom-creations",
      name: "Custom Creations",
      shortDescription: "Personalized colorways, made-to-measure bridal hairpieces, and bespoke stitching.",
      image: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=80",
      tag: "Made Just For You",
      itemCount: "Custom Order"
    }
  ],

  // Featured Products (Section D)
  products: [
    {
      id: "prod-1",
      name: "Vintage Blossom Crochet Keychain",
      category: "crochet-treasures",
      categoryName: "Crochet Treasures",
      price: 24,
      originalPrice: 28,
      rating: 5.0,
      reviewsCount: 38,
      badge: "Bestseller",
      image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
      description: "Delicately crocheted five-petal blossom keychain handcrafted from 100% mercerized Egyptian cotton thread. Finished with a brushed rose-gold keyring and a tiny hand-stamped brass petal charm.",
      materials: "100% Mercerized Cotton, Brass Hardware, Rose Gold Finish",
      dimensions: "Flower 2.5\" diameter • Total length 4.5\"",
      isFeatured: true
    },
    {
      id: "prod-2",
      name: "Handmade Crochet Tulip Stem",
      category: "floral-creations",
      categoryName: "Floral Creations",
      price: 32,
      originalPrice: null,
      rating: 4.9,
      reviewsCount: 52,
      badge: "Artisan Favorite",
      image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80",
      description: "An everlasting spring tulip sculpted from buttery soft milk cotton yarn. Features a flexible wrapped floral wire stem and a lifelike leaf that can be gently shaped in any vase.",
      materials: "Premium Milk Cotton Yarn, Wrapped Floral Wire Core",
      dimensions: "Stem length 13.5\" • Bloom 2.8\" height",
      isFeatured: true
    },
    {
      id: "prod-3",
      name: "Wildflower Embroidered Hair Clips (Set of 3)",
      category: "hair-accessories",
      categoryName: "Hair Accessories",
      price: 28,
      originalPrice: 34,
      rating: 5.0,
      reviewsCount: 29,
      badge: "Limited Run",
      image: "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?auto=format&fit=crop&w=800&q=80",
      description: "Trio of vintage alligator clips upholstered in unbleached Belgian linen and meticulously embroidered with tiny forget-me-nots and French knot rosebuds. Gentle grip suitable for all hair types.",
      materials: "Belgian Linen, Silk Embroidery Floss, Non-slip Alligator Base",
      dimensions: "Clip length 2.8\" each",
      isFeatured: true
    },
    {
      id: "prod-4",
      name: "Meadow Whisper Crochet Bouquet",
      category: "floral-creations",
      categoryName: "Floral Creations",
      price: 88,
      originalPrice: 98,
      rating: 5.0,
      reviewsCount: 44,
      badge: "Signature Gift",
      image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
      description: "A breathtaking permanent arrangement featuring 7 hand-crocheted blooms: two blush garden roses, one ivory tulip, chamomile daisies, and delicate eucalyptus sprigs wrapped in craft parchment.",
      materials: "Combed Cotton Yarns, Paper-wrapped Wire, Silk Ribbon Tie",
      dimensions: "Bouquet height 15\" • Spread approx 9\"",
      isFeatured: true
    },
    {
      id: "prod-5",
      name: "Botanical Silk Scrunchie & Ribbon Accessory",
      category: "hair-accessories",
      categoryName: "Hair Accessories",
      price: 22,
      originalPrice: null,
      rating: 4.8,
      reviewsCount: 19,
      badge: "New Arrival",
      image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80",
      description: "Hand-dyed mulberry silk scrunchie paired with an optional detachable embroidered ribbon tail. Dyed using natural rosehip and madder root extracts for a soft romantic patina.",
      materials: "100% Organic Mulberry Silk, Natural Botanical Plant Dyes",
      dimensions: "Scrunchie 4\" relaxed • Ribbon tail 9\"",
      isFeatured: true
    },
    {
      id: "prod-6",
      name: "Mini Daisy Crochet Bag Charm",
      category: "crochet-treasures",
      categoryName: "Crochet Treasures",
      price: 19,
      originalPrice: null,
      rating: 4.9,
      reviewsCount: 61,
      badge: "Gift Choice",
      image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
      description: "A whimsical sunny daisy charm with sunny yellow core and pure white petals. Designed to clip effortlessly onto totes, straw summer bags, or key pouches.",
      materials: "Perle Cotton Yarn, Lobster Swivel Clasp",
      dimensions: "Daisy diameter 2\" • Total drop 3.8\"",
      isFeatured: true
    },
    {
      id: "prod-7",
      name: "Scalloped Linen Peter Pan Collar",
      category: "fashion-studio",
      categoryName: "Fashion Studio",
      price: 54,
      originalPrice: 62,
      rating: 5.0,
      reviewsCount: 14,
      badge: "Atelier Piece",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
      description: "A detachable statement collar crafted from washed oatmeal European linen, bordered with delicate hand-crocheted picot lace and tied with satin ribbons.",
      materials: "100% European Flax Linen, Hand-crocheted Lace Trim",
      dimensions: "Adjustable neck fit (14\" - 17\")",
      isFeatured: false
    },
    {
      id: "prod-8",
      name: "Bespoke Heirloom Baby Bonnet & Booties",
      category: "custom-creations",
      categoryName: "Custom Creations",
      price: 76,
      originalPrice: null,
      rating: 5.0,
      reviewsCount: 22,
      badge: "Heirloom",
      image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80",
      description: "Softest organic bamboo-cotton baby keepsake set customized with the child's embroidered initials and birth date along the bonnet brim.",
      materials: "Organic Bamboo-Cotton Blend, Silk Satin Ribbon",
      dimensions: "Sizes available: 0-3M, 3-6M, 6-12M",
      isFeatured: false
    }
  ],

  // Fashion Studio Section (Section E)
  fashionStudio: {
    headline: "Wear something made just for you.",
    subtitle: "Slow fashion, heirloom stitches & personalized silhouettes",
    description: "In our sunny atelier, we reject fast fashion rhythms in favor of thoughtful silhouettes tailored to your exact measurements. From hand-draped linen dresses to embroidered vintage collar blouses, every garment is an intimate collaboration between artisan and wearer.",
    atelierValues: [
      {
        title: "Bespoke Fit",
        description: "Patterns individually adjusted to your unique proportions for effortless grace and comfort."
      },
      {
        title: "Natural Fibers",
        description: "Carefully sourced deadstock silks, organic cottons, and GOTS-certified European linens."
      },
      {
        title: "Heirloom Craft",
        description: "French seams, hand-rolled hems, and signature miniature floral crochet accents on cuffs and buttons."
      }
    ],
    editorialImages: [
      {
        url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85",
        caption: "Autumn Reverie Collection • Hand-tailored Linen Smock Dress"
      },
      {
        url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
        caption: "Original Sketchbook Study • Botanical sleeve embellishments"
      },
      {
        url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80",
        caption: "Atelier Worktable • Draping silk crepon and measuring lace"
      }
    ],
    steps: [
      {
        step: "01",
        name: "Discovery & Silhouette",
        desc: "We discuss your aesthetic preferences, occasions, and fabric weights over tea or video call."
      },
      {
        step: "02",
        name: "Illustration & Swatches",
        desc: "Receive personalized watercolor fashion sketches and a curated sample card of tactile fabrics."
      },
      {
        step: "03",
        name: "Made-to-Measure Tailoring",
        desc: "Your garment is cut and assembled stitch by stitch, with continuous fitting check-ins."
      },
      {
        step: "04",
        name: "Artisan Finishing & Delivery",
        desc: "Wrapped in tissue with dried lavender sprigs, spare thread, and a certificate of craftsmanship."
      }
    ]
  },

  // Art Gallery Section (Section F)
  artGallery: {
    title: "Art Gallery & Atelier Studies",
    subtitle: "Fashion illustrations, botanical gouache & digital poetry",
    intro: "Before a piece is ever stitched, it exists as a dream on paper. Explore our ongoing portfolio of fashion illustrations, textile print studies, and digital artwork celebrating romantic slow living.",
    artworks: [
      {
        id: "art-1",
        title: "The Botanical Dresser",
        medium: "Watercolor & Digital Gouache",
        year: "2024",
        dimensions: "12\" × 16\" Archival Print",
        image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=85",
        note: "Inspired by morning light filtering through antique lace curtains, depicting delicate crochet sprigs interwoven with organza."
      },
      {
        id: "art-2",
        title: "Flora & Thread Silhouette",
        medium: "Ink, Gold Leaf & Fine Line",
        year: "2024",
        dimensions: "11\" × 14\" Limited Edition",
        image: "https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?auto=format&fit=crop&w=900&q=85",
        note: "A minimalist study of high-fashion tailoring adorned with organic botanical silhouettes."
      },
      {
        id: "art-3",
        title: "Crochet Tulip Symphony",
        medium: "Pastel on Heavy Cotton Paper",
        year: "2024",
        dimensions: "9\" × 12\" Study",
        image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=900&q=85",
        note: "Color explorations studying the gradient transitions of dyed milk cotton yarn."
      },
      {
        id: "art-4",
        title: "Atelier Nocturne in Rose",
        medium: "Digital Mixed Media",
        year: "2024",
        dimensions: "16\" × 20\" Print",
        image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=900&q=85",
        note: "The romantic quiet of the studio after dark, surrounded by spools of thread and porcelain teacups."
      },
      {
        id: "art-5",
        title: "Lace Collar Study No. 4",
        medium: "Graphite & Hand-Toned Tea Wash",
        year: "2024",
        dimensions: "8\" × 10\" Original",
        image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=900&q=85",
        note: "Detailed architectural line drawing of scalloped crochet edging for bridal boleros."
      }
    ]
  },

  // Meet the Creator Section (Section G)
  meetCreator: {
    headline: "Every creation has a little story.",
    subtitle: "A personal word from the artisan behind the needle and brush",
    paragraphs: [
      "Welcome to Petal & Thread. My journey began with a single wooden crochet hook passed down by my grandmother and a notebook filled with fashion sketches that didn't belong in mass-market retail.",
      "I believe the world moves too fast, and that true luxury lies in the quiet hours spent shaping a single petal, embroidering a wildflower onto linen, or cutting a bespoke silhouette that makes you feel entirely at home in your own skin.",
      "Every piece you find here is born in my studio surrounded by natural light, dried hydrangeas, spools of plant-dyed yarn, and classical vinyl records. Nothing is rushed; every knot and seam is made with patient, heartfelt intention."
    ],
    quote: "Crochet is a meditation of patience; every single stitch holds a quiet thought, a breath, and a touch of genuine devotion.",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=85", // Creative studio workspace
    stats: [
      { value: "8+", label: "Years of Handcraft Experience" },
      { value: "450+", label: "Heirlooms Crafted & Sent" },
      { value: "100%", label: "Sustainable & Plastic-free" }
    ]
  },

  // Custom Orders Section (Section H)
  customOrders: {
    headline: "Have a dream piece in mind?",
    subheadline: "Personalized crochet creations, wedding florals, and made-to-measure clothing.",
    description: "Whether you're looking for an everlasting crochet bridal bouquet matching your wedding palette, a personalized name charm for a loved one, or a bespoke linen dress made to your measurements, we would love to bring your vision to life.",
    options: [
      {
        title: "Bespoke Bridal Florals",
        desc: "Everlasting bouquets, boutonnieres, and hair wreaths designed to match your wedding color story."
      },
      {
        title: "Personalized Keepsakes",
        desc: "Custom colorways, embroidered initials, and commemorative date charms for momentous celebrations."
      },
      {
        title: "Made-to-Measure Garments",
        desc: "Feminine dresses, detachable lace collars, and tailored linen silhouettes made just for you."
      }
    ],
    whatsappPrompt: "Hi Amelia! I would love to enquire about a custom piece from Petal & Thread.",
    estimatedTurnaround: "Custom pieces typically require 10–21 days of handcrafting."
  },

  // Instagram Gallery Section (Section I)
  instagram: {
    handle: "@petalandthread",
    headline: "Moments from the Atelier",
    subtitle: "Follow our daily stitches, studio musings, and work in progress.",
    posts: [
      {
        id: "ig-1",
        image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80",
        caption: "Freshly finished daisy pins catching the 9 AM studio light ✨",
        likes: "428"
      },
      {
        id: "ig-2",
        image: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=600&q=80",
        caption: "Curating a custom lavender & blush bouquet palette for a spring bride 💐",
        likes: "612"
      },
      {
        id: "ig-3",
        image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80",
        caption: "Draping our new scalloped linen collar on the mannequin 🌿",
        likes: "589"
      },
      {
        id: "ig-4",
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
        caption: "The rhythm of cotton thread: 20 tulip petals ready for assembling 🌷",
        likes: "734"
      },
      {
        id: "ig-5",
        image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
        caption: "Evening watercolor study of our upcoming midsummer blouse illustration 🎨",
        likes: "510"
      },
      {
        id: "ig-6",
        image: "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&w=600&q=80",
        caption: "Packed with handmade botanical tissue and handwritten wax-sealed notes 💌",
        likes: "891"
      }
    ]
  }
};
