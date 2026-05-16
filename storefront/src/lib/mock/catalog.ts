/**
 * Mock Product Catalog
 *
 * A small in-memory catalog of products. In production this would be
 * fetched from a database / headless CMS filtered by the context engine.
 *
 * The `tags` array is what the context engine uses for relevance scoring
 * (e.g. "waterproof" scores high when weather.condition === "heavy_rain").
 */

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  priceINR: number;
  originalPriceINR: number | null;
  imageUrl: string;
  /** All product images — used for carousel on product detail page */
  imageUrls?: string[];
  shortDescription: string;
  tags: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  /** Available sizes — used by the search engine's size memory feature */
  sizes?: string[];  // e.g. ['XS','S','M','L','XL'] or ['ONE SIZE']
  /** CSS object-position value for the product card image crop, e.g. 'top', 'center', '50% 20%' */
  imagePosition?: string;
  /** Semantic mood/vibe metadata used for semantic AI recommendation */
  semantic?: {
    style: string[];
    vibe: string[];
    colorEmotion: string[];
    aesthetic: string[];
  };
}

export const PRODUCT_CATALOG: Product[] = [
  // ── Waterproof / Rain Gear ────────────────────────────────────────────────
  {
    id: "prd_r001",
    name: "StormShield Pro Monsoon Jacket",
    brand: "Wildcraft",
    category: "outdoor_gear",
    priceINR: 3_799,
    originalPriceINR: 5_299,
    imageUrl: "/products/monsoon-jacket.jpg",
    shortDescription:
      "20,000mm waterproof rating. Sealed seams. Built for the Western Ghats monsoon.",
    tags: ["waterproof", "rain", "outdoor", "jacket", "monsoon"],
    stock: 38,
    rating: 4.7,
    reviewCount: 312,
    semantic: {
      style: ["utilitarian", "technical"],
      vibe: ["prepared", "active", "resilient"],
      colorEmotion: ["dark", "serious"],
      aesthetic: ["gorpcore", "outdoor"]
    }
  },
  {
    id: "prd_r002",
    name: "AquaGuard Trekking Shoes",
    brand: "Columbia",
    category: "outdoor_gear",
    priceINR: 5_199,
    originalPriceINR: 7_499,
    imageUrl: "/products/trekking-shoes.jpg",
    shortDescription:
      "Omni-Tech waterproof membrane with aggressive lug sole. Zero slippage on wet laterite.",
    tags: ["waterproof", "rain", "shoes", "trekking", "outdoor", "monsoon"],
    stock: 22,
    rating: 4.5,
    reviewCount: 189,
    semantic: {
      style: ["rugged", "technical"],
      vibe: ["adventurous", "grounded", "safe"],
      colorEmotion: ["earthy", "muted"],
      aesthetic: ["gorpcore", "utilitarian"]
    }
  },
  {
    id: "prd_r003",
    name: "DryPack 40L Waterproof Backpack",
    brand: "Decathlon",
    category: "outdoor_gear",
    priceINR: 2_499,
    originalPriceINR: 3_299,
    imageUrl: "/products/drybag.jpg",
    shortDescription:
      "Roll-top PVC dry bag. Keeps everything bone-dry even fully submerged.",
    tags: ["waterproof", "rain", "backpack", "outdoor", "travel", "monsoon"],
    stock: 55,
    rating: 4.3,
    reviewCount: 421,
    semantic: {
      style: ["functional", "minimalist"],
      vibe: ["prepared", "utilitarian"],
      colorEmotion: ["high visibility", "energetic"],
      aesthetic: ["survival", "technical"]
    }
  },
  // ── Tech Accessories ──────────────────────────────────────────────────────
  {
    id: "prd_t001",
    name: "UltraBook Laptop Stand (Foldable)",
    brand: "Nexstand",
    category: "tech_accessories",
    priceINR: 1_899,
    originalPriceINR: 2_599,
    imageUrl: "/products/laptop-stand.jpg",
    shortDescription:
      "Aluminium alloy, 7-angle adjust. Elevates posture for WFH monsoon days.",
    tags: ["tech", "laptop", "wfh", "work_from_home", "indoor"],
    stock: 67,
    rating: 4.6,
    reviewCount: 874,
    semantic: {
      style: ["sleek", "modern"],
      vibe: ["productive", "focused", "professional"],
      colorEmotion: ["metallic", "cold"],
      aesthetic: ["minimalist tech", "wfh"]
    }
  },
  {
    id: "prd_t002",
    name: "Anker 4-Port USB-C Hub",
    brand: "Anker",
    category: "tech_accessories",
    priceINR: 2_299,
    originalPriceINR: null,
    imageUrl: "/products/usb-hub.jpg",
    shortDescription:
      "4K HDMI, 100W PD, dual USB-A. The hub that turns your laptop into a workstation.",
    tags: ["tech", "hub", "wfh", "work_from_home", "indoor", "productivity"],
    stock: 43,
    rating: 4.8,
    reviewCount: 1_203,
    semantic: {
      style: ["industrial", "compact"],
      vibe: ["efficient", "connected"],
      colorEmotion: ["neutral", "sleek"],
      aesthetic: ["tech minimal"]
    }
  },
  {
    id: "prd_t003",
    name: "Sony WF-C700N Earbuds",
    brand: "Sony",
    category: "tech_accessories",
    priceINR: 6_990,
    originalPriceINR: 9_990,
    imageUrl: "/products/earbuds.jpg",
    shortDescription:
      "ANC with 8-hr battery. Rain pattering on windows? You won't hear it.",
    tags: ["tech", "audio", "anc", "wfh", "indoor", "rain"],
    stock: 29,
    rating: 4.4,
    reviewCount: 562,
    semantic: {
      style: ["soft", "ergonomic"],
      vibe: ["isolated", "peaceful", "focused"],
      colorEmotion: ["calming", "pastel"],
      aesthetic: ["ambient", "quiet luxury"]
    }
  },
  // ── Travel ────────────────────────────────────────────────────────────────
  {
    id: "prd_v001",
    name: "Victorinox Crosslight Day Pack",
    brand: "Victorinox",
    category: "travel",
    priceINR: 8_500,
    originalPriceINR: 11_000,
    imageUrl: "/products/day-pack.jpg",
    shortDescription:
      "Water-resistant 20L with RFID-blocking pocket. Commute or trek — it does both.",
    tags: ["waterproof", "travel", "commute", "outdoor", "backpack"],
    stock: 14,
    rating: 4.9,
    reviewCount: 236,
    semantic: {
      style: ["refined", "versatile"],
      vibe: ["professional yet ready", "organized"],
      colorEmotion: ["stealth", "dark"],
      aesthetic: ["urban commuter", "sleek"]
    }
  },

  // ── ÉCLAT Fashion Collection ───────────────────────────────────────────────
  {
    id: "eclat_coat_01",
    name: "The Monolith Coat",
    brand: "ÉCLAT",
    category: "outerwear",
    priceINR: 185_000,
    originalPriceINR: null,
    imageUrl: "/eclat/Post by @zegalba · 1 image.jpg",
    shortDescription:
      "Washed charcoal canvas, large-format samurai print bleeding into fabric. Leather belt tie, quilted lining. Dark, archival, singular.",
    tags: ["rain", "cold", "structured", "wool", "winter", "outerwear", "statement", "gothic", "dark", "moody", "dramatic", "archival", "editorial", "avant-garde", "bold", "graphic", "artistic", "dark-academia"],
    sizes: ["S", "M", "L", "XL"],
    stock: 8,
    rating: 4.9,
    reviewCount: 47,
    semantic: {
      style: ["avant-garde", "bold", "structured"],
      vibe: ["mysterious", "dark", "dramatic", "main character"],
      colorEmotion: ["charcoal", "shadowy", "moody"],
      aesthetic: ["dark academia", "gothic", "archival", "street goth"]
    }
  },
  {
    id: "eclat_coat_02",
    name: "Sculpted Wool Greatcoat",
    brand: "ÉCLAT",
    category: "outerwear",
    priceINR: 245_000,
    originalPriceINR: null,
    imageUrl: "/eclat/H&M Just Dropped a $150 Version of Hailey Bieber's $6K Designer Coat.jpg",
    shortDescription:
      "Floor-length double-breasted black wool. Six-button closure, extreme elongated silhouette. The coat as architecture.",
    tags: ["rain", "cold", "wool", "winter", "outerwear", "luxury", "gothic", "dark", "dramatic", "architectural", "sculptural", "structured", "statement", "minimal", "elongated", "editorial", "bold", "elegant"],
    sizes: ["XS", "S", "M", "L"],
    imagePosition: "50% 20%",
    stock: 5,
    rating: 5.0,
    reviewCount: 23,
    semantic: {
      style: ["architectural", "minimal", "elongated"],
      vibe: ["powerful", "confident", "CEO", "imposing"],
      colorEmotion: ["pitch black", "formal", "sharp"],
      aesthetic: ["quiet luxury", "goth ninja", "matrix", "high fashion"]
    }
  },
  {
    id: "eclat_coat_03",
    name: "The Archival Trench",
    brand: "ÉCLAT",
    category: "outerwear",
    priceINR: 320_000,
    originalPriceINR: null,
    imageUrl: "/eclat/WhatsApp Image 2026-05-16 at 2.07.49 AM.jpeg",
    shortDescription:
      "Oversized stone-camel canvas trench. Extreme volume, notched collar, front slit, belted cuffs. Parisian in weight, modern in scale.",
    tags: ["rain", "structured", "outerwear", "archival", "classic", "camel", "neutral", "everyday", "casual", "parisian", "oversized", "minimal", "timeless", "editorial", "relaxed", "effortless"],
    sizes: ["S", "M", "L", "XL"],
    stock: 3,
    rating: 4.8,
    reviewCount: 18,
    semantic: {
      style: ["classic", "oversized", "relaxed"],
      vibe: ["effortless", "parisian", "breezy", "nostalgic"],
      colorEmotion: ["camel", "neutral", "warm sand"],
      aesthetic: ["classic cinema", "vintage parisenne", "timeless"]
    }
  },
  {
    id: "eclat_sep_01",
    name: "Structure Top",
    brand: "ÉCLAT",
    category: "separates",
    priceINR: 42_000,
    originalPriceINR: null,
    imageUrl: "/eclat/Fashion Strappy Sweater Tank __ fashion product phorography.jpg",
    shortDescription:
      "Sculptural deconstructed one-shoulder silhouette. Wrapped torso, cascading fabric strips at hem. Avant-garde structure as statement.",
    tags: ["evening", "night", "formal", "statement", "structured", "sculptural", "architectural", "avant-garde", "dramatic", "editorial", "bold", "party", "separates", "sexy", "sensual", "date", "luxury"],
    sizes: ["XS", "S", "M", "L", "XL"],
    imagePosition: "center",
    stock: 14,
    rating: 4.6,
    reviewCount: 89,
    semantic: {
      style: ["sculptural", "deconstructed", "asymmetric"],
      vibe: ["sensual", "confident", "alluring", "party"],
      colorEmotion: ["monochrome", "intense"],
      aesthetic: ["avant-garde evening", "contemporary art"]
    }
  },
  {
    id: "eclat_sep_02",
    name: "Silk Narrative Blouse",
    brand: "ÉCLAT",
    category: "separates",
    priceINR: 89_000,
    originalPriceINR: null,
    imageUrl: "/eclat/Cucculelli Shaheen Fashion Collections For Women _ Moda Operandi.jpg",
    shortDescription:
      "Black satin cowl-neck, deep draped décolletage, pointed collar, bishop sleeves with cuffed wrists. Fluid luxury for evenings that command attention.",
    tags: ["silk", "evening", "night", "separates", "luxury", "romantic", "sexy", "sensual", "fluid", "elegant", "formal", "date", "glamorous", "seductive", "draped", "statement", "feminine"],
    sizes: ["XS", "S", "M", "L"],
    imagePosition: "center",
    stock: 11,
    rating: 4.9,
    reviewCount: 62,
    semantic: {
      style: ["fluid", "draped", "elegant"],
      vibe: ["romantic", "seductive", "glamorous", "luxurious"],
      colorEmotion: ["midnight", "glossy black", "deep"],
      aesthetic: ["vamp", "old hollywood", "dark romance"]
    }
  },
  {
    id: "eclat_sep_03",
    name: "The Void Trousers",
    brand: "ÉCLAT",
    category: "separates",
    priceINR: 67_000,
    originalPriceINR: null,
    imageUrl: "/eclat/WhatsApp Image 2026-05-16 at 2.01.39 AM.jpeg",
    shortDescription:
      "Charcoal grey wide-leg with heavy sculptural diagonal pleating. Structural crease lines as design — streetwear silhouette, avant-garde construction.",
    tags: ["minimal", "wfh", "separates", "cotton", "everyday", "architectural", "structured", "avant-garde", "editorial", "dark", "moody", "streetwear", "bold", "dramatic", "gothic", "grey", "relaxed"],
    sizes: ["XS", "S", "M", "L", "XL"],
    imagePosition: "bottom",
    stock: 19,
    rating: 4.7,
    reviewCount: 104,
    semantic: {
      style: ["wide-leg", "pleated", "streetwear"],
      vibe: ["relaxed but sharp", "urban", "cool"],
      colorEmotion: ["charcoal", "concrete", "slate"],
      aesthetic: ["avant-street", "dystopian casual", "architectural minimal"]
    }
  },
  {
    id: "eclat_foot_01",
    name: "Cantilever Heel in Nero",
    brand: "ÉCLAT",
    category: "footwear",
    priceINR: 120_000,
    originalPriceINR: null,
    imageUrl: "/eclat/WhatsApp Image 2026-05-16 at 1.44.40 AM.jpeg",
    shortDescription:
      "Sculptural floating wedge, heel cantilevered in space. Spiral leather straps wrap the shin. Large silver oval hardware at toe. Architecture you walk in.",
    tags: ["evening", "night", "formal", "statement", "footwear", "luxury", "gothic", "dark", "architectural", "sculptural", "avant-garde", "dramatic", "bold", "editorial", "platform", "sexy", "party"],
    sizes: ["36", "37", "38", "39", "40", "41"],
    imagePosition: "bottom",
    stock: 7,
    rating: 4.8,
    reviewCount: 38,
    semantic: {
      style: ["sculptural", "platform", "extreme"],
      vibe: ["fierce", "dominant", "avant-garde", "show-stopping"],
      colorEmotion: ["chrome", "abyss black"],
      aesthetic: ["cyberpunk luxury", "brutalist fashion"]
    }
  },
  {
    id: "eclat_acc_01",
    name: "The Noir Waistcoat",
    brand: "ÉCLAT",
    category: "separates",
    priceINR: 120_000,
    originalPriceINR: null,
    imageUrl: "/eclat/WhatsApp Image 2026-05-16 at 1.58.32 AM.jpeg",
    shortDescription:
      "Fine black silk waistcoat, embroidered lace-up patchwork construction, sleeveless. A structured layer that speaks before you do.",
    tags: ["evening", "night", "formal", "statement", "separates", "luxury", "gothic", "dark", "dramatic", "editorial", "embroidered", "structured", "bold", "sexy", "sensual", "artistic", "unique"],
    sizes: ["ONE SIZE"],
    imagePosition: "center",
    stock: 9,
    rating: 4.9,
    reviewCount: 55,
    semantic: {
      style: ["tailored", "patchwork", "intricate"],
      vibe: ["artistic", "edgy", "poetic", "rebellious"],
      colorEmotion: ["pitch", "ink"],
      aesthetic: ["dark romance", "gothic aristocrat", "punk tailoring"]
    }
  },
  {
    id: "eclat_acc_02",
    name: "L'Essence Editorial Dress",
    brand: "ÉCLAT",
    category: "separates",
    priceINR: 165_000,
    originalPriceINR: null,
    imageUrl: "/eclat/professional-model-sitting-floor-fashionable-dress-makeup-hairstyle-pretty-face-white-sheet-is-waving-magazine-cover.jpg",
    shortDescription:
      "The dress that earns a cover. Draped construction, editorial presence — for the woman who doesn't wait to be seen.",
    tags: ["evening", "night", "separates", "luxury", "formal", "statement", "romantic", "elegant", "sexy", "sensual", "draped", "editorial", "glamorous", "party", "seductive", "bold", "feminine", "confident"],
    sizes: ["ONE SIZE"],
    stock: 6,
    rating: 5.0,
    reviewCount: 29,
    semantic: {
      style: ["draped", "flowing", "editorial"],
      vibe: ["main character", "glamorous", "confident", "seductive"],
      colorEmotion: ["luminous", "stark white or deep black"],
      aesthetic: ["high fashion cover", "runway ready", "diva"]
    }
  },
  {
    id: "eclat_set_01",
    name: "Linear Layering Set",
    brand: "ÉCLAT",
    category: "sets",
    priceINR: 145_000,
    originalPriceINR: 195_000,
    imageUrl: "/eclat/807481408158586231.jpg",
    shortDescription:
      "Asymmetric wrap mini skirt layered over wide-leg tailored trousers. Grey-on-grey architectural proportions. One set, two readings.",
    tags: ["minimal", "wfh", "sets", "value", "everyday", "separates", "architectural", "avant-garde", "structured", "grey", "neutral", "monochrome", "editorial", "layering", "artistic", "casual", "relaxed"],
    sizes: ["XS", "S", "M", "L", "XL"],
    imagePosition: "50% 30%",
    stock: 12,
    rating: 4.8,
    reviewCount: 71,
    semantic: {
      style: ["layered", "asymmetric", "tailored"],
      vibe: ["intellectual", "composed", "effortlessly cool"],
      colorEmotion: ["ash", "concrete", "tonal grey"],
      aesthetic: ["minimalist architecture", "scandinavian avant-garde"]
    }
  },
];

/** Quick lookup by ID */
export function getProductById(id: string): Product | undefined {
  return PRODUCT_CATALOG.find((p) => p.id === id);
}

/** Filter products by one or more tags */
export function getProductsByTags(tags: string[]): Product[] {
  return PRODUCT_CATALOG.filter((p) =>
    tags.some((t) => p.tags.includes(t))
  );
}

/** ÉCLAT-only products */
export const ECLAT_CATALOG = PRODUCT_CATALOG.filter((p) =>
  p.id.startsWith("eclat_")
);
