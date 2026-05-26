"""
scripts/export_catalog.py
─────────────────────────
Dumps the ÉCLAT TypeScript catalog to a JSON file that the Python
search service can read.

Since the catalog lives in TypeScript (catalog.ts), we replicate it
here as Python so no Node.js transpile step is needed.

Run from search-service/:
    python scripts/export_catalog.py
"""

import json
from pathlib import Path

# ── ÉCLAT Product Catalog (mirrored from storefront/src/lib/mock/catalog.ts) ──
# Keep in sync when catalog.ts changes.

CATALOG = [
    # ── Outdoor / Rain Gear ──────────────────────────────────────────────────
    {
        "id": "prd_r001",
        "name": "StormShield Pro Monsoon Jacket",
        "brand": "Wildcraft",
        "category": "outdoor_gear",
        "priceINR": 3799,
        "shortDescription": "20,000mm waterproof rating. Sealed seams. Built for the Western Ghats monsoon.",
        "tags": ["waterproof", "rain", "outdoor", "jacket", "monsoon"],
        "stock": 38,
        "rating": 4.7,
        "reviewCount": 312,
        "sizes": [],
        "semantic": {
            "style": ["utilitarian", "technical"],
            "vibe": ["prepared", "active", "resilient"],
            "colorEmotion": ["dark", "serious"],
            "aesthetic": ["gorpcore", "outdoor"]
        }
    },
    {
        "id": "prd_r002",
        "name": "AquaGuard Trekking Shoes",
        "brand": "Columbia",
        "category": "outdoor_gear",
        "priceINR": 5199,
        "shortDescription": "Omni-Tech waterproof membrane with aggressive lug sole. Zero slippage on wet laterite.",
        "tags": ["waterproof", "rain", "shoes", "trekking", "outdoor", "monsoon"],
        "stock": 22,
        "rating": 4.5,
        "reviewCount": 189,
        "sizes": [],
        "semantic": {
            "style": ["rugged", "technical"],
            "vibe": ["adventurous", "grounded", "safe"],
            "colorEmotion": ["earthy", "muted"],
            "aesthetic": ["gorpcore", "utilitarian"]
        }
    },
    {
        "id": "prd_r003",
        "name": "DryPack 40L Waterproof Backpack",
        "brand": "Decathlon",
        "category": "outdoor_gear",
        "priceINR": 2499,
        "shortDescription": "Roll-top PVC dry bag. Keeps everything bone-dry even fully submerged.",
        "tags": ["waterproof", "rain", "backpack", "outdoor", "travel", "monsoon"],
        "stock": 55,
        "rating": 4.3,
        "reviewCount": 421,
        "sizes": [],
        "semantic": {
            "style": ["functional", "minimalist"],
            "vibe": ["prepared", "utilitarian"],
            "colorEmotion": ["high visibility", "energetic"],
            "aesthetic": ["survival", "technical"]
        }
    },
    # ── Tech Accessories ─────────────────────────────────────────────────────
    {
        "id": "prd_t001",
        "name": "UltraBook Laptop Stand (Foldable)",
        "brand": "Nexstand",
        "category": "tech_accessories",
        "priceINR": 1899,
        "shortDescription": "Aluminium alloy, 7-angle adjust. Elevates posture for WFH monsoon days.",
        "tags": ["tech", "laptop", "wfh", "work_from_home", "indoor"],
        "stock": 67,
        "rating": 4.6,
        "reviewCount": 874,
        "sizes": [],
        "semantic": {
            "style": ["sleek", "modern"],
            "vibe": ["productive", "focused", "professional"],
            "colorEmotion": ["metallic", "cold"],
            "aesthetic": ["minimalist tech", "wfh"]
        }
    },
    {
        "id": "prd_t002",
        "name": "Anker 4-Port USB-C Hub",
        "brand": "Anker",
        "category": "tech_accessories",
        "priceINR": 2299,
        "shortDescription": "4K HDMI, 100W PD, dual USB-A. The hub that turns your laptop into a workstation.",
        "tags": ["tech", "hub", "wfh", "work_from_home", "indoor", "productivity"],
        "stock": 43,
        "rating": 4.8,
        "reviewCount": 1203,
        "sizes": [],
        "semantic": {
            "style": ["industrial", "compact"],
            "vibe": ["efficient", "connected"],
            "colorEmotion": ["neutral", "sleek"],
            "aesthetic": ["tech minimal"]
        }
    },
    {
        "id": "prd_t003",
        "name": "Sony WF-C700N Earbuds",
        "brand": "Sony",
        "category": "tech_accessories",
        "priceINR": 6990,
        "shortDescription": "ANC with 8-hr battery. Rain pattering on windows? You won't hear it.",
        "tags": ["tech", "audio", "anc", "wfh", "indoor", "rain"],
        "stock": 29,
        "rating": 4.4,
        "reviewCount": 562,
        "sizes": [],
        "semantic": {
            "style": ["soft", "ergonomic"],
            "vibe": ["isolated", "peaceful", "focused"],
            "colorEmotion": ["calming", "pastel"],
            "aesthetic": ["ambient", "quiet luxury"]
        }
    },
    # ── Travel ───────────────────────────────────────────────────────────────
    {
        "id": "prd_v001",
        "name": "Victorinox Crosslight Day Pack",
        "brand": "Victorinox",
        "category": "travel",
        "priceINR": 8500,
        "shortDescription": "Water-resistant 20L with RFID-blocking pocket. Commute or trek — it does both.",
        "tags": ["waterproof", "travel", "commute", "outdoor", "backpack"],
        "stock": 14,
        "rating": 4.9,
        "reviewCount": 236,
        "sizes": [],
        "semantic": {
            "style": ["refined", "versatile"],
            "vibe": ["professional yet ready", "organized"],
            "colorEmotion": ["stealth", "dark"],
            "aesthetic": ["urban commuter", "sleek"]
        }
    },
    # ── ÉCLAT Fashion Collection ─────────────────────────────────────────────
    {
        "id": "eclat_coat_01",
        "name": "The Monolith Coat",
        "brand": "ÉCLAT",
        "category": "outerwear",
        "priceINR": 185000,
        "shortDescription": "Washed charcoal canvas, large-format red samurai print with arrows bleeding into the fabric. Leather belt tie, quilted lining. Dark, archival, singular.",
        "tags": ["rain", "cold", "structured", "wool", "winter", "outerwear", "statement", "gothic", "dark", "moody", "dramatic", "archival", "editorial", "avant-garde", "bold", "graphic", "artistic", "dark-academia", "samurai-print", "red-samurai", "warrior", "arrows", "belted", "quilted-lining", "canvas-coat", "wrap-coat"],
        "sizes": ["S", "M", "L", "XL"],
        "stock": 8,
        "rating": 4.9,
        "reviewCount": 47,
        "semantic": {
            "style": ["avant-garde", "bold", "structured", "wrap", "belted"],
            "vibe": ["mysterious", "dark", "dramatic", "main character", "artistic"],
            "colorEmotion": ["charcoal", "shadowy", "moody", "washed grey", "red accent"],
            "aesthetic": ["dark academia", "gothic", "archival", "street goth", "japanese print"]
        }
    },
    {
        "id": "eclat_coat_02",
        "name": "Sculpted Wool Greatcoat",
        "brand": "ÉCLAT",
        "category": "outerwear",
        "priceINR": 245000,
        "shortDescription": "Floor-length double-breasted dark chocolate brown wool. Six-button closure, oversized belted silhouette. The coat as architecture.",
        "tags": ["rain", "cold", "wool", "winter", "outerwear", "luxury", "gothic", "dark", "dramatic", "architectural", "sculptural", "structured", "statement", "minimal", "elongated", "editorial", "bold", "elegant", "double-breasted", "oversized", "belted", "brown-coat", "chocolate-brown", "olive-brown"],
        "sizes": ["XS", "S", "M", "L"],
        "stock": 5,
        "rating": 5.0,
        "reviewCount": 23,
        "semantic": {
            "style": ["architectural", "minimal", "elongated", "oversized", "double-breasted"],
            "vibe": ["powerful", "confident", "CEO", "imposing", "sophisticated"],
            "colorEmotion": ["dark brown", "chocolate", "formal", "sharp"],
            "aesthetic": ["quiet luxury", "goth ninja", "matrix", "high fashion", "classic"]
        }
    },
    {
        "id": "eclat_coat_03",
        "name": "The Archival Trench",
        "brand": "ÉCLAT",
        "category": "outerwear",
        "priceINR": 320000,
        "shortDescription": "Oversized classic sand-beige trench coat. Features a yellow plaid check lining, single-breasted button front, and belted cuffs. Parisian in weight, modern in scale.",
        "tags": ["rain", "structured", "outerwear", "archival", "classic", "camel", "neutral", "everyday", "casual", "parisian", "oversized", "minimal", "timeless", "editorial", "relaxed", "effortless", "beige", "sand", "plaid-lining", "check-pattern", "mac-coat", "single-breasted", "button-front"],
        "sizes": ["S", "M", "L", "XL"],
        "stock": 3,
        "rating": 4.8,
        "reviewCount": 18,
        "semantic": {
            "style": ["classic", "oversized", "relaxed", "single-breasted"],
            "vibe": ["effortless", "parisian", "breezy", "nostalgic", "preppy"],
            "colorEmotion": ["camel", "neutral", "warm sand", "beige"],
            "aesthetic": ["classic cinema", "vintage parisenne", "timeless", "preppy"]
        }
    },
    {
        "id": "eclat_sep_01",
        "name": "Structure Top",
        "brand": "ÉCLAT",
        "category": "separates",
        "priceINR": 42000,
        "shortDescription": "Shimmering rose gold sequined tank top. Delicate spaghetti strap on one side, dramatic 3D ruffled sequin floral strap on the other. Deep V-neckline. Party-ready glamour.",
        "tags": ["evening", "night", "formal", "statement", "party", "separates", "sexy", "sensual", "date", "luxury", "sequins", "pink", "rose-gold", "sparkly", "glitter", "shimmering", "clubwear", "glamour", "floral-strap", "one-shoulder", "camisole", "tanktop", "V-neck", "date-night"],
        "sizes": ["XS", "S", "M", "L", "XL"],
        "stock": 14,
        "rating": 4.6,
        "reviewCount": 89,
        "semantic": {
            "style": ["glamorous", "sequined", "asymmetric", "camisole"],
            "vibe": ["sensual", "confident", "alluring", "party", "sparkling", "playful"],
            "colorEmotion": ["rose gold", "pink shimmer", "iridescent"],
            "aesthetic": ["party glam", "glitz", "Y2K fashion", "festival style"]
        }
    },
    {
        "id": "eclat_sep_02",
        "name": "Silk Narrative Blouse",
        "brand": "ÉCLAT",
        "category": "separates",
        "priceINR": 89000,
        "shortDescription": "Intricately embroidered black bustier crop top. Features stunning hand-beaded gold and silver sunburst / celestial sun motifs over the bust and embellished straps. Structured corset silhouette.",
        "tags": ["evening", "night", "separates", "luxury", "romantic", "sexy", "sensual", "formal", "date", "glamorous", "seductive", "statement", "bustier", "corset", "cropped", "black", "gold", "silver", "beaded", "embroidery", "celestial", "sunburst", "sun"],
        "sizes": ["XS", "S", "M", "L"],
        "stock": 11,
        "rating": 4.9,
        "reviewCount": 62,
        "semantic": {
            "style": ["structured", "corset", "heavily-embellished", "crop-top"],
            "vibe": ["romantic", "seductive", "glamorous", "luxurious", "celestial", "dramatic"],
            "colorEmotion": ["midnight", "glossy black", "gold and silver", "gilded"],
            "aesthetic": ["baroque", "celestial goth", "high fashion evening", "dark romance"]
        }
    },
    {
        "id": "eclat_sep_03",
        "name": "The Void Trousers",
        "brand": "ÉCLAT",
        "category": "separates",
        "priceINR": 67000,
        "shortDescription": "High-waisted black wide-leg trousers. Wide structured corset waistband with three vertical buttons, deep front pleats cascading into a relaxed drape.",
        "tags": ["minimal", "separates", "cotton", "everyday", "architectural", "structured", "avant-garde", "editorial", "dark", "moody", "streetwear", "bold", "dramatic", "gothic", "black", "trousers", "pants", "high-waisted", "wide-leg", "pleated", "corset-waist", "button-detail", "formal", "office", "elegant", "chic"],
        "sizes": ["XS", "S", "M", "L", "XL"],
        "stock": 19,
        "rating": 4.7,
        "reviewCount": 104,
        "semantic": {
            "style": ["wide-leg", "pleated", "high-waisted", "tailored"],
            "vibe": ["relaxed but sharp", "urban", "cool", "sophisticated", "powerful"],
            "colorEmotion": ["deep black", "formal", "classy"],
            "aesthetic": ["avant-street", "architectural minimal", "minimalist chic", "tailored elegance", "modern office"]
        }
    },
    {
        "id": "eclat_foot_01",
        "name": "Cantilever Heel in Nero",
        "brand": "ÉCLAT",
        "category": "footwear",
        "priceINR": 120000,
        "shortDescription": "Burgundy leather western cowboy boots with dramatic long fringes down the sides. Embroidered geometric/tribal details, pointed toe, and classic block western heel.",
        "tags": ["evening", "night", "formal", "statement", "footwear", "luxury", "gothic", "dark", "dramatic", "bold", "editorial", "party", "boots", "cowboy-boots", "western", "fringe", "burgundy", "maroon", "leather", "embroidery", "pointed-toe", "block-heel", "bohemian", "festival", "country-style"],
        "sizes": ["36", "37", "38", "39", "40", "41"],
        "stock": 7,
        "rating": 4.8,
        "reviewCount": 38,
        "semantic": {
            "style": ["western", "boho-chic", "fringed", "boots"],
            "vibe": ["fierce", "dominant", "avant-garde", "show-stopping", "free-spirited", "bohemian"],
            "colorEmotion": ["burgundy", "earthy red", "rich brown"],
            "aesthetic": ["western goth", "boho chic", "festival style"]
        }
    },
    {
        "id": "eclat_acc_01",
        "name": "The Noir Waistcoat",
        "brand": "ÉCLAT",
        "category": "separates",
        "priceINR": 120000,
        "shortDescription": "Structured black tailored wrap waistcoat. Features extended cap shoulders, notched lapels, and a wrap front secured by a delicate self-tie waist belt. Modern corporate chic.",
        "tags": ["evening", "night", "formal", "statement", "separates", "luxury", "gothic", "dark", "dramatic", "editorial", "structured", "bold", "sexy", "sensual", "artistic", "unique", "waistcoat", "vest", "black", "wrap", "belted", "cap-sleeve", "tailored", "notched-lapel", "business-casual", "office-wear", "workwear", "layering", "minimalist", "chic"],
        "sizes": ["ONE SIZE"],
        "stock": 9,
        "rating": 4.9,
        "reviewCount": 55,
        "semantic": {
            "style": ["tailored", "wrap", "minimalist", "structured"],
            "vibe": ["artistic", "edgy", "poetic", "rebellious", "professional", "composed", "modern", "sharp"],
            "colorEmotion": ["sleek black", "formal"],
            "aesthetic": ["minimalist tailoring", "modern business", "chic corporate", "dark romance"]
        }
    },
    {
        "id": "eclat_acc_02",
        "name": "L'Essence Editorial Dress",
        "brand": "ÉCLAT",
        "category": "separates",
        "priceINR": 165000,
        "shortDescription": "Sleek black column evening dress or jumpsuit with sparkling silver rhinestone chain straps. Open-back design, clean minimalist lines, high editorial fashion vibe.",
        "tags": ["evening", "night", "separates", "luxury", "formal", "statement", "romantic", "elegant", "sexy", "sensual", "draped", "editorial", "glamorous", "party", "seductive", "bold", "feminine", "confident", "jumpsuit", "black", "rhinestone-straps", "silver-chain", "open-back", "minimalist", "date-night"],
        "sizes": ["ONE SIZE"],
        "stock": 6,
        "rating": 5.0,
        "reviewCount": 29,
        "semantic": {
            "style": ["draped", "flowing", "editorial", "minimalist", "slip-dress"],
            "vibe": ["main character", "glamorous", "confident", "seductive", "elegant", "sophisticated", "dramatic"],
            "colorEmotion": ["black and silver", "stark"],
            "aesthetic": ["90s minimalism", "high fashion cover", "studio editorial", "runway ready"]
        }
    },
    {
        "id": "eclat_set_01",
        "name": "Linear Layering Set",
        "brand": "ÉCLAT",
        "category": "sets",
        "priceINR": 145000,
        "shortDescription": "Avant-garde black leather cropped shrug jacket. Features exaggerated structured shoulders embellished with silver spikes and hanging silver metal chains. High collar with zipper closures.",
        "tags": ["minimal", "everyday", "separates", "architectural", "avant-garde", "structured", "black", "editorial", "artistic", "jacket", "cropped", "shrug", "leather", "faux-leather", "spikes", "studs", "chains", "gothic", "punk", "cyberpunk", "matrix", "edgy", "outerwear", "statement"],
        "sizes": ["XS", "S", "M", "L", "XL"],
        "stock": 12,
        "rating": 4.8,
        "reviewCount": 71,
        "semantic": {
            "style": ["cropped", "spiked", "avant-garde", "layered"],
            "vibe": ["intellectual", "composed", "effortlessly cool", "rebellious", "aggressive", "cyber", "edgy"],
            "colorEmotion": ["pitch black", "silver metal", "dark"],
            "aesthetic": ["cyberpunk", "gothic punk", "biker goth", "fetish wear"]
        }
    },
]


def main():
    out_path = Path(__file__).parent / "catalog_export.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(CATALOG, f, ensure_ascii=False, indent=2)
    print(f"✅ Exported {len(CATALOG)} products to {out_path}")


if __name__ == "__main__":
    main()
