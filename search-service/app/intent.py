"""
Intent extraction layer — runs BEFORE embedding.

Extracts structured signals from the raw query:
  - sizes (XS/S/M/L/XL/XXL/ONE SIZE)
  - colors
  - occasion (dinner, office, college, date, party, winter…)
  - aesthetic mood (gothic, minimal, romantic…)

Also enriches the query text with extracted hints so the embedding
captures more nuanced meaning.
"""

import re
from dataclasses import dataclass, field


# ── Size patterns ─────────────────────────────────────────────────────────────

SIZE_PATTERNS: list[tuple[re.Pattern, str]] = [
    (re.compile(r"\bextra\s*small\b|\bxs\b", re.I), "XS"),
    (re.compile(r"\bsmall\b|\bs\b(?!\w)", re.I),    "S"),
    (re.compile(r"\bmedium\b|\bm\b(?!\w)", re.I),   "M"),
    (re.compile(r"\blarge\b|\bl\b(?!\w)", re.I),    "L"),
    (re.compile(r"\bextra\s*large\b|\bxl\b", re.I), "XL"),
    (re.compile(r"\bxxl\b|\b2xl\b", re.I),          "XXL"),
    (re.compile(r"\bone\s*size\b", re.I),            "ONE SIZE"),
]

# ── Color vocabulary ─────────────────────────────────────────────────────────

COLOR_WORDS: set[str] = {
    "black", "white", "grey", "gray", "charcoal", "beige", "camel", "cream",
    "ivory", "brown", "tan", "navy", "blue", "red", "burgundy", "wine",
    "green", "olive", "forest", "pink", "blush", "rose", "purple", "lavender",
    "yellow", "orange", "gold", "silver", "nude", "ecru", "rust", "teal",
    "monochrome", "neutral", "dark", "light", "pastel", "neon", "metallic",
}

# ── Occasion vocabulary (word → canonical label) ──────────────────────────────

OCCASION_MAP: dict[str, str] = {
    # Evening / going out
    "dinner": "evening",
    "restaurant": "evening",
    "date": "evening",
    "night": "evening",
    "club": "evening",
    "party": "evening",
    "gala": "evening",
    "wedding": "formal",
    "ceremony": "formal",
    "event": "formal",
    # Daytime
    "office": "work",
    "work": "work",
    "meeting": "work",
    "interview": "work",
    "presentation": "work",
    "college": "casual",
    "school": "casual",
    "class": "casual",
    "campus": "casual",
    "brunch": "casual",
    "picnic": "casual",
    "market": "casual",
    "weekend": "casual",
    # Outdoor / weather
    "winter": "cold",
    "cold": "cold",
    "warm": "cold",          # "warm outfit" → cold-weather garments
    "snow": "cold",
    "rain": "rain",
    "monsoon": "rain",
    "outdoor": "outdoor",
    "hiking": "outdoor",
    "travel": "travel",
    # Comfort
    "home": "comfort",
    "wfh": "comfort",
    "cosy": "comfort",
    "cozy": "comfort",
    "lazy": "comfort",
}

# ── Aesthetic / mood vocabulary ───────────────────────────────────────────────

AESTHETIC_MAP: dict[str, str] = {
    "gothic": "gothic",
    "goth": "gothic",
    "dark": "gothic",
    "grunge": "gothic",
    "edgy": "gothic",
    "minimal": "minimal",
    "minimalist": "minimal",
    "clean": "minimal",
    "simple": "minimal",
    "classic": "classic",
    "timeless": "classic",
    "parisian": "classic",
    "romantic": "romantic",
    "feminine": "romantic",
    "flowy": "romantic",
    "elegant": "elegant",
    "luxury": "elegant",
    "classy": "elegant",
    "sophisticated": "elegant",
    "chic": "elegant",
    "streetwear": "street",
    "street": "street",
    "casual": "casual",
    "oversized": "casual",
    "comfy": "casual",
    "cute": "cute",
    "girly": "cute",
    "sweet": "cute",
    "editorial": "editorial",
    "avant": "editorial",
    "garde": "editorial",
    "bold": "editorial",
    "dramatic": "editorial",
}


# ── Result dataclass ──────────────────────────────────────────────────────────

@dataclass
class Intent:
    sizes: list[str] = field(default_factory=list)
    colors: list[str] = field(default_factory=list)
    occasion: str | None = None
    aesthetics: list[str] = field(default_factory=list)
    enriched_query: str = ""


def _levenshtein_distance(s1: str, s2: str) -> int:
    """Calculate the Levenshtein distance between two strings."""
    if len(s1) < len(s2):
        return _levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)

    previous_row = list(range(len(s2) + 1))
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (0 if c1 == c2 else 1)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row

    return previous_row[-1]


def _fuzzy_match(word: str, targets: set[str]) -> str | None:
    """Find a target word that is very close to the given word (spelling mistake)."""
    if len(word) <= 2:
        return None
    # 1. Transposition / Anagram check
    sorted_word = sorted(word)
    for t in targets:
        if len(t) == len(word) and sorted(t) == sorted_word:
            return t
    # 2. Levenshtein distance of 1 check
    for t in targets:
        if abs(len(t) - len(word)) <= 1:
            if _levenshtein_distance(word, t) == 1:
                return t
    return None


def extract_intent(query: str, remembered_sizes: list[str] | None = None) -> Intent:
    """
    Parse the query and return structured intent + an enriched query string
    that has been augmented with detected signals for better embedding quality.
    """
    lower = query.lower()
    raw_words = [w.strip() for w in re.split(r"[^\w\-]+", lower) if w.strip()]

    # Spell-check / fuzzy-correct words to known vocabulary
    all_vocab = COLOR_WORDS.union(OCCASION_MAP.keys()).union(AESTHETIC_MAP.keys())
    words = []
    for w in raw_words:
        if w in all_vocab:
            words.append(w)
        else:
            corrected = _fuzzy_match(w, all_vocab)
            if corrected:
                words.append(corrected)
                print(f"[intent] Typo corrected: '{w}' -> '{corrected}'")
            else:
                words.append(w)

    # 1. Sizes
    sizes: list[str] = []
    for pattern, size in SIZE_PATTERNS:
        if pattern.search(lower) and size not in sizes:
            sizes.append(size)
    # Merge with remembered sizes
    all_sizes = list(dict.fromkeys(sizes + (remembered_sizes or [])))

    # 2. Colors
    colors = [w for w in words if w in COLOR_WORDS]

    # 3. Occasion (first match wins for the primary label)
    occasion: str | None = None
    for word in words:
        if word in OCCASION_MAP:
            occasion = OCCASION_MAP[word]
            break

    # 4. Aesthetics (all matches)
    aesthetics = list(dict.fromkeys(
        AESTHETIC_MAP[w] for w in words if w in AESTHETIC_MAP
    ))

    # 5. Build enriched query
    enrichments: list[str] = []
    if occasion:
        enrichments.append(occasion)
    enrichments.extend(aesthetics)
    enrichments.extend(colors)

    enriched_query = query
    if enrichments:
        enriched_query = f"{query}. {' '.join(enrichments)}."

    return Intent(
        sizes=all_sizes,
        colors=colors,
        occasion=occasion,
        aesthetics=aesthetics,
        enriched_query=enriched_query,
    )
