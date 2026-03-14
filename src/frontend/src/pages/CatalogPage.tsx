import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import {
  useGetProductsByCategory,
  useSearchProducts,
} from "../hooks/useQueries";
import { useGetAllProducts } from "../hooks/useQueries";
import { CATEGORIES } from "../lib/categoryMeta";

export default function CatalogPage() {
  const searchParams = useSearch({ from: "/layout/catalog" });
  const navigate = useNavigate();

  const initialCategory =
    (searchParams as Record<string, string>)?.category ?? "All";
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Sync category from URL
  useEffect(() => {
    const cat = (searchParams as Record<string, string>)?.category;
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isSearching = debouncedQuery.trim().length > 0;
  const isCategoryFilter = !isSearching && activeCategory !== "All";

  const { data: searchResults, isLoading: searchLoading } = useSearchProducts(
    isSearching ? debouncedQuery : "",
  );
  const { data: categoryProducts, isLoading: catLoading } =
    useGetProductsByCategory(isCategoryFilter ? activeCategory : "");
  const { data: allProducts, isLoading: allLoading } = useGetAllProducts();

  const isLoading = isSearching
    ? searchLoading
    : isCategoryFilter
      ? catLoading
      : allLoading;

  const products = isSearching
    ? (searchResults ?? [])
    : isCategoryFilter
      ? (categoryProducts ?? [])
      : (allProducts ?? []);

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    setSearchQuery("");
    navigate({ to: "/catalog" });
  };

  const allCategories = ["All", ...CATEGORIES];

  return (
    <div className="container mx-auto px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8" data-ocid="catalog.page">
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
          Digital Marketplace
        </h1>
        <p className="text-muted-foreground">
          Discover thousands of premium digital products
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          data-ocid="catalog.search_input"
          placeholder="Search products, categories, creators…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 bg-secondary/40 border-border focus:border-primary/50 focus:bg-secondary/60 transition-all"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="flex gap-2 flex-shrink-0">
          {allCategories.map((cat) => (
            <button
              type="button"
              key={cat}
              data-ocid="catalog.category.tab"
              onClick={() => handleCategoryClick(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-glow-sm"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results info */}
      {!isLoading && (
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {products.length} product{products.length !== 1 ? "s" : ""}
            {isSearching && ` for "${debouncedQuery}"`}
            {isCategoryFilter && ` in ${activeCategory}`}
          </span>
          {(isSearching || activeCategory !== "All") && (
            <Badge
              variant="secondary"
              className="text-xs cursor-pointer hover:bg-destructive/20"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("All");
              }}
            >
              Clear
            </Badge>
          )}
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div
          data-ocid="catalog.products.loading_state"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {["a", "b", "c", "d", "e", "f", "g", "h"].map((k) => (
            <div
              key={k}
              className="rounded-xl overflow-hidden card-glass p-4 space-y-3"
            >
              <Skeleton className="aspect-video w-full rounded-lg bg-secondary/50" />
              <Skeleton className="h-4 w-3/4 bg-secondary/50" />
              <Skeleton className="h-3 w-full bg-secondary/50" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div
          data-ocid="catalog.products.empty_state"
          className="text-center py-20 card-glass rounded-xl"
        >
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="font-display text-xl font-semibold mb-2">
            No products found
          </h3>
          <p className="text-muted-foreground">
            {isSearching
              ? `No results for "${debouncedQuery}". Try a different keyword.`
              : `No products in ${activeCategory} yet.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
