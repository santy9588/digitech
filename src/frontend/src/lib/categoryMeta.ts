export interface CategoryMeta {
  icon: string;
  color: string;
  fallbackImage: string;
  description: string;
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  Audio: {
    icon: "🎙️",
    color: "oklch(0.65 0.2 250)",
    fallbackImage: "/assets/generated/product-audio.dim_400x300.jpg",
    description: "Audio files, podcasts, and sound effects",
  },
  Ebook: {
    icon: "📚",
    color: "oklch(0.62 0.18 30)",
    fallbackImage: "/assets/generated/product-ebook.dim_400x300.jpg",
    description: "Digital books and reading material",
  },
  PDF: {
    icon: "📄",
    color: "oklch(0.6 0.16 140)",
    fallbackImage: "/assets/generated/product-ebook.dim_400x300.jpg",
    description: "PDF documents, guides, and templates",
  },
  Music: {
    icon: "🎵",
    color: "oklch(0.65 0.22 295)",
    fallbackImage: "/assets/generated/product-music.dim_400x300.jpg",
    description: "Music tracks, albums, and instrumentals",
  },
  Video: {
    icon: "🎬",
    color: "oklch(0.62 0.2 15)",
    fallbackImage: "/assets/generated/product-video.dim_400x300.jpg",
    description: "Video courses, films, and tutorials",
  },
  Photo: {
    icon: "📸",
    color: "oklch(0.72 0.16 60)",
    fallbackImage: "/assets/generated/product-video.dim_400x300.jpg",
    description: "Stock photos, presets, and image packs",
  },
  Blog: {
    icon: "✍️",
    color: "oklch(0.68 0.18 160)",
    fallbackImage: "/assets/generated/product-ebook.dim_400x300.jpg",
    description: "Articles, newsletters, and written content",
  },
  Other: {
    icon: "📦",
    color: "oklch(0.6 0.1 264)",
    fallbackImage: "/assets/generated/product-ebook.dim_400x300.jpg",
    description: "Templates, software, and other digital goods",
  },
};

export const CATEGORIES = Object.keys(CATEGORY_META);
