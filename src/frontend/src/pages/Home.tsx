import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { type Product, getProducts } from "@/services/backend";
import {
  ArrowRight,
  ChevronRight,
  CreditCard,
  Lock,
  RefreshCw,
  Shield,
  Star,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

type Page =
  | "home"
  | "products"
  | "orders"
  | "admin"
  | "product-detail"
  | "success";

interface HomeProps {
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

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

export function Home({ onNavigate }: HomeProps) {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then((all) => {
      setFeaturedProducts(
        all
          .filter((p) => p.popular)
          .slice(0, 3)
          .concat(all.filter((p) => !p.popular).slice(0, 1)),
      );
      setLoading(false);
    });
  }, []);

  const trustBadges = [
    { icon: Shield, label: "SSL Encrypted" },
    { icon: CreditCard, label: "Stripe Secure Payments" },
    { icon: RefreshCw, label: "30-Day Money Back" },
    { icon: Star, label: "5-Star Rated Products" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20">
        {/* Background */}
        <div
          className="absolute inset-0 grid-pattern opacity-40"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('/assets/generated/digitech-hero-bg.dim_1600x600.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center top",
            opacity: 0.25,
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-6">
              <Zap className="w-3 h-3" fill="currentColor" />
              <span>Powered by Stripe Payments</span>
            </div>

            <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-[1.05] mb-6">
              <span className="text-foreground">Digital Products</span>
              <br />
              <span className="text-gradient-cyan">Built for Scale</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed mb-8">
              Professional-grade digital tools, subscriptions, and services.
              Instant access. Secure checkout. Trusted by 10,000+ developers and
              businesses worldwide.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => onNavigate("products")}
                data-ocid="home.primary_button"
                className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan font-semibold px-8"
              >
                Browse Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigate("products")}
                data-ocid="home.secondary_button"
                className="border-border hover:border-primary/50 hover:bg-primary/5"
              >
                View Pricing
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 border-y border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 text-sm text-muted-foreground"
              >
                <Icon className="w-4 h-4 text-primary shrink-0" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-primary text-sm font-medium font-mono mb-2">
                — FEATURED PRODUCTS
              </p>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground">
                Most Popular Tools
              </h2>
            </div>
            <Button
              variant="ghost"
              onClick={() => onNavigate("products")}
              data-ocid="home.products_link"
              className="text-primary hover:text-primary/80 hidden sm:flex"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {featuredProducts.slice(0, 3).map((product, idx) => (
                <motion.div key={product.id} variants={itemVariants}>
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
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`inline-flex text-xs font-medium px-2.5 py-0.5 rounded-full border ${CATEGORY_COLORS[product.category] ?? "bg-secondary text-secondary-foreground border-transparent"}`}
                        >
                          {product.category}
                        </span>
                      </div>
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
                        Buy Now
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Button
              variant="outline"
              onClick={() => onNavigate("products")}
              className="border-border"
            >
              View All Products
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stripe Payment Banner */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div>
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-2">
                Secure Stripe Checkout
              </h3>
              <p className="text-muted-foreground text-sm max-w-md">
                All transactions are secured with 256-bit SSL encryption through
                Stripe — the world's most trusted payment infrastructure. Your
                financial data is always safe.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="stripe-badge rounded-xl px-6 py-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-white" />
                <span className="text-white font-semibold font-display">
                  Powered by Stripe
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" /> PCI Compliant
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3" /> 256-bit SSL
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
