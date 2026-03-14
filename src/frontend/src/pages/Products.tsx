import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type Product,
  type ProductCategory,
  getProducts,
} from "@/services/backend";
import { Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

type Page =
  | "home"
  | "products"
  | "orders"
  | "admin"
  | "product-detail"
  | "success";

interface ProductsProps {
  onNavigate: (page: Page, productId?: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Subscription: "bg-primary/10 text-primary border-primary/20",
  Software:
    "bg-[oklch(0.7_0.2_280/0.15)] text-[oklch(0.75_0.18_280)] border-[oklch(0.7_0.2_280/0.3)]",
  Analytics:
    "bg-[oklch(0.78_0.18_70/0.15)] text-[oklch(0.78_0.18_70)] border-[oklch(0.78_0.18_70/0.3)]",
  Storage:
    "bg-[oklch(0.72_0.17_150/0.15)] text-[oklch(0.72_0.17_150)] border-[oklch(0.72_0.17_150/0.3)]",
  API: "bg-[oklch(0.62_0.22_28/0.15)] text-[oklch(0.72_0.22_28)] border-[oklch(0.62_0.22_28/0.3)]",
  Marketing:
    "bg-[oklch(0.7_0.18_320/0.15)] text-[oklch(0.75_0.18_320)] border-[oklch(0.7_0.18_320/0.3)]",
};

const ALL_CATEGORIES = [
  "All",
  "Subscription",
  "Software",
  "Analytics",
  "Storage",
  "API",
  "Marketing",
] as const;
type FilterCategory = (typeof ALL_CATEGORIES)[number];

function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Skeleton className="w-full h-44" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function Products({ onNavigate }: ProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const filtered = products.filter((p) => {
    const matchesCategory =
      activeFilter === "All" || p.category === activeFilter;
    const matchesSearch =
      searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-primary text-sm font-medium font-mono mb-2">
            — ALL PRODUCTS
          </p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-foreground mb-3">
            Digital Tools & Services
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Professional-grade digital products with instant access and secure
            Stripe checkout.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-secondary border-border"
              data-ocid="products.search_input"
            />
          </div>

          <Tabs
            value={activeFilter}
            onValueChange={(v) => setActiveFilter(v as FilterCategory)}
            className="w-auto"
          >
            <TabsList className="bg-secondary h-auto flex-wrap gap-1 p-1">
              {ALL_CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  data-ocid="products.filter.tab"
                  className="text-xs px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24" data-ocid="products.empty_state">
            <p className="text-muted-foreground text-lg">
              No products match your search.
            </p>
            <Button
              variant="ghost"
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("All");
              }}
              className="mt-4 text-primary"
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`${activeFilter}-${searchQuery}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filtered.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  layout
                >
                  <Card
                    className="overflow-hidden bg-card border-border card-hover cursor-pointer h-full flex flex-col"
                    onClick={() => onNavigate("product-detail", product.id)}
                    data-ocid={`products.item.${idx + 1}`}
                  >
                    <div className="relative overflow-hidden h-44">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                      {product.popular && (
                        <div className="absolute top-3 right-3">
                          <span className="bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-full">
                            Popular
                          </span>
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <span
                        className={`inline-flex self-start text-xs font-medium px-2.5 py-0.5 rounded-full border ${CATEGORY_COLORS[product.category] ?? "bg-secondary text-secondary-foreground border-transparent"}`}
                      >
                        {product.category}
                      </span>
                      <h3 className="font-display font-semibold text-lg text-foreground leading-tight mt-1">
                        {product.name}
                      </h3>
                    </CardHeader>
                    <CardContent className="pb-3 flex-1">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between pt-3 border-t border-border">
                      <div>
                        <span className="text-2xl font-display font-bold text-foreground">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.category === "Subscription" && (
                          <span className="text-xs text-muted-foreground ml-1">
                            /mo
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate("product-detail", product.id);
                        }}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
