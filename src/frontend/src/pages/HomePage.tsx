import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Globe, Shield, Star, Zap } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useGetAllProducts } from "../hooks/useQueries";
import { CATEGORIES, CATEGORY_META } from "../lib/categoryMeta";

const FEATURES = [
  {
    icon: <Zap className="h-5 w-5 text-primary" />,
    title: "Instant Delivery",
    desc: "Download your purchases immediately after payment. No waiting, no shipping.",
  },
  {
    icon: (
      <Globe
        className="h-5 w-5 text-accent-foreground"
        style={{ color: "oklch(0.65 0.22 295)" }}
      />
    ),
    title: "Global Payments",
    desc: "Accept payments from customers worldwide with 50+ payment methods via Stripe.",
  },
  {
    icon: (
      <Shield className="h-5 w-5" style={{ color: "oklch(0.7 0.2 145)" }} />
    ),
    title: "Secure & Decentralized",
    desc: "Built on the Internet Computer — your products and revenue are protected.",
  },
  {
    icon: <Star className="h-5 w-5" style={{ color: "oklch(0.82 0.16 85)" }} />,
    title: "AI-Enhanced",
    desc: "Smart search and discovery powered by AI to connect buyers with the right products.",
  },
];

export default function HomePage() {
  const { data: allProducts, isLoading } = useGetAllProducts();
  const navigate = useNavigate();

  const featuredProducts = allProducts?.slice(0, 8) ?? [];

  return (
    <div className="relative">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        data-ocid="home.page"
        className="relative min-h-[600px] flex items-center overflow-hidden"
        style={{
          background: `url('/assets/generated/hero-bg.dim_1600x900.jpg') center/cover no-repeat`,
        }}
      >
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 60% 50%, oklch(0.65 0.22 295 / 0.15) 0%, transparent 70%)",
          }}
        />

        <div className="container relative z-10 mx-auto px-4 py-20 sm:px-6">
          <div className="max-w-3xl space-y-6 animate-fade-up">
            <Badge
              className="gap-2 py-1.5 px-3 text-xs font-medium border border-primary/30"
              style={{
                background: "oklch(0.78 0.18 195 / 0.1)",
                color: "oklch(0.78 0.18 195)",
              }}
            >
              <Zap className="h-3 w-3" />
              The Future of Digital Commerce
            </Badge>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              Buy & Sell{" "}
              <span className="text-gradient-cyan">Digital Products</span>
              <br className="hidden sm:block" />
              Without Limits
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Audio, ebooks, music, videos, photos, PDFs — upload once, sell
              forever. Reach buyers across the globe with built-in AI discovery.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/catalog">
                <Button
                  data-ocid="home.browse.primary_button"
                  size="lg"
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow transition-all"
                >
                  Browse Catalog
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/seller">
                <Button
                  data-ocid="home.sell.secondary_button"
                  size="lg"
                  variant="outline"
                  className="gap-2 border-border hover:bg-secondary/60"
                >
                  Start Selling
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ──────────────────────────────────────── */}
      <section
        data-ocid="home.categories.section"
        className="container mx-auto px-4 py-16 sm:px-6"
      >
        <div className="mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
            Browse by Category
          </h2>
          <p className="text-muted-foreground">
            Find exactly what you're looking for across 8 digital product
            categories.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {CATEGORIES.map((category) => {
            const meta = CATEGORY_META[category];
            return (
              <button
                type="button"
                key={category}
                data-ocid="home.category.button"
                onClick={() =>
                  navigate({
                    to: "/catalog",
                    search: { category } as Record<string, string>,
                  })
                }
                className="group relative rounded-xl p-4 sm:p-5 card-glass hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-card text-left cursor-pointer"
              >
                <div
                  className="text-3xl mb-3 transition-transform duration-300 group-hover:scale-110 inline-block"
                  role="img"
                  aria-label={category}
                >
                  {meta.icon}
                </div>
                <h3 className="font-display font-semibold text-foreground text-sm sm:text-base">
                  {category}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {meta.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Featured Products ────────────────────────────────── */}
      <section
        data-ocid="home.featured.section"
        className="container mx-auto px-4 pb-16 sm:px-6"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
              Featured Products
            </h2>
            <p className="text-muted-foreground">
              Handpicked digital products for you
            </p>
          </div>
          <Link to="/catalog">
            <Button
              data-ocid="home.view-all.link"
              variant="ghost"
              className="gap-2 text-primary hover:text-primary/80 hidden sm:flex"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div
            data-ocid="home.featured.loading_state"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {["a", "b", "c", "d", "e", "f", "g", "h"].map((k) => (
              <div
                key={k}
                className="rounded-xl overflow-hidden card-glass p-4 space-y-3"
              >
                <Skeleton className="aspect-video w-full rounded-lg bg-secondary/50" />
                <Skeleton className="h-4 w-3/4 bg-secondary/50" />
                <Skeleton className="h-3 w-full bg-secondary/50" />
                <Skeleton className="h-3 w-2/3 bg-secondary/50" />
              </div>
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div
            data-ocid="home.featured.empty_state"
            className="text-center py-16 card-glass rounded-xl"
          >
            <div className="text-5xl mb-4">🛍️</div>
            <h3 className="font-display text-lg font-semibold mb-2">
              No products yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Be the first to list a digital product on DigiTech.
            </p>
            <Link to="/seller">
              <Button
                data-ocid="home.start-selling.button"
                size="sm"
                className="bg-primary text-primary-foreground"
              >
                Start Selling
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i + 1} />
            ))}
          </div>
        )}
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section
        data-ocid="home.features.section"
        className="py-16 border-t border-border"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, oklch(0.12 0.025 264 / 0.5) 50%, transparent 100%)",
        }}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
              Why DigiTech?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              The most powerful platform for digital product creators and
              buyers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl p-5 card-glass hover:border-primary/20 transition-all"
              >
                <div className="p-2 rounded-lg bg-secondary/60 w-fit mb-3">
                  {f.icon}
                </div>
                <h3 className="font-display font-semibold mb-1 text-foreground">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section
        data-ocid="home.cta.section"
        className="container mx-auto px-4 py-16 sm:px-6"
      >
        <div
          className="rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.78 0.18 195 / 0.1) 0%, oklch(0.65 0.22 295 / 0.1) 100%)",
            border: "1px solid oklch(0.78 0.18 195 / 0.2)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 50%, oklch(0.78 0.18 195 / 0.05) 0%, transparent 70%)",
            }}
          />
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="font-display text-2xl sm:text-4xl font-bold">
              Ready to Launch Your{" "}
              <span className="text-gradient-cyan">Digital Business?</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of creators selling digital products. Set up your
              store in minutes.
            </p>
            <Link to="/seller">
              <Button
                data-ocid="home.cta.primary_button"
                size="lg"
                className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-lg"
              >
                Become a Seller <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
