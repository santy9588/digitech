import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  ArrowRight,
  Package,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import LoginPrompt from "../components/LoginPrompt";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useLocalProducts } from "../hooks/useLocalProducts";
import { useCreateOrderAndCheckout, useProducts } from "../hooks/useQueries";
import { formatPrice } from "../utils/format";

// Sample product data for when backend has no products yet
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "prod_starter",
    name: "Starter Plan",
    description:
      "Perfect for individuals and small projects. Includes 10k API calls/month, email support, and basic analytics dashboard.",
    currency: "usd",
    priceInCents: 999n,
  },
  {
    id: "prod_pro",
    name: "Professional Plan",
    description:
      "Designed for growing teams. Unlimited API calls, priority support, advanced analytics, and team collaboration tools.",
    currency: "usd",
    priceInCents: 4999n,
  },
  {
    id: "prod_enterprise",
    name: "Enterprise Plan",
    description:
      "Full-featured for large organizations. Custom integrations, dedicated account manager, SLA guarantees, and SSO support.",
    currency: "usd",
    priceInCents: 19999n,
  },
  {
    id: "prod_addon_sms",
    name: "SMS Notifications Add-on",
    description:
      "Add real-time SMS notifications to your account. Get alerts for payments, refunds, and critical events instantly.",
    currency: "usd",
    priceInCents: 299n,
  },
  {
    id: "prod_addon_analytics",
    name: "Advanced Analytics Pack",
    description:
      "Deep-dive into payment metrics with cohort analysis, funnel tracking, revenue forecasting, and custom report exports.",
    currency: "usd",
    priceInCents: 1499n,
  },
  {
    id: "prod_addon_webhooks",
    name: "Webhook Relay Service",
    description:
      "Reliable webhook delivery with automatic retries, delivery logs, and endpoint health monitoring.",
    currency: "usd",
    priceInCents: 599n,
  },
];

function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4">
      <Skeleton className="h-5 w-3/4 bg-muted/60" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-3.5 w-full bg-muted/40" />
        <Skeleton className="h-3.5 w-5/6 bg-muted/40" />
        <Skeleton className="h-3.5 w-4/5 bg-muted/40" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-6 w-20 bg-muted/60" />
        <Skeleton className="h-9 w-24 bg-muted/60" />
      </div>
    </div>
  );
}

function ProductCard({
  product,
  index,
  onBuy,
  isBuying,
}: {
  product: Product;
  index: number;
  onBuy: (product: Product) => void;
  isBuying: boolean;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: "easeOut" }}
      className="group relative rounded-xl border border-border bg-card p-6 flex flex-col gap-4 card-glow cursor-default"
      data-ocid={`products.item.${index + 1}`}
    >
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px rounded-t-xl bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
          <Package className="h-4 w-4 text-primary" />
        </div>
        <span className="price-display text-xl font-bold text-foreground ml-auto">
          {formatPrice(product.priceInCents, product.currency)}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2">
        <h3 className="font-display font-semibold text-base text-foreground leading-snug">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {product.description}
        </p>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-border/50">
        <Button
          onClick={() => onBuy(product)}
          disabled={isBuying}
          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold group/btn"
          size="sm"
          data-ocid={`products.buy_button.${index + 1}`}
        >
          {isBuying ? (
            <>
              <Zap className="h-3.5 w-3.5 animate-pulse" />
              Redirecting…
            </>
          ) : (
            <>
              <ShoppingCart className="h-3.5 w-3.5" />
              Buy Now
              <ArrowRight className="h-3.5 w-3.5 ml-auto transition-transform group-hover/btn:translate-x-0.5" />
            </>
          )}
        </Button>
      </div>
    </motion.article>
  );
}

export default function ProductsPage() {
  const { data: backendProducts, isLoading, isError } = useProducts();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const { mutate: createOrderAndCheckout, isPending } =
    useCreateOrderAndCheckout();
  const { locallyAdded, locallyDeleted } = useLocalProducts();

  const isAuthenticated = !!identity;

  // Merge: backend products + locally added, minus locally deleted
  const mergedBackendProducts =
    backendProducts && backendProducts.length > 0
      ? backendProducts
      : SAMPLE_PRODUCTS;

  const displayProducts = [...mergedBackendProducts, ...locallyAdded].filter(
    (p) => !locallyDeleted.has(p.id),
  );

  // Set of backend product IDs for quick lookup
  const backendProductIds = new Set(mergedBackendProducts.map((p) => p.id));

  const handleBuy = (product: Product) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to purchase products.");
      return;
    }

    const sessionIdPlaceholder = "{CHECKOUT_SESSION_ID}";
    const successUrl = `${window.location.origin}/success?session_id=${sessionIdPlaceholder}`;
    const cancelUrl = `${window.location.origin}/`;

    const isLocalProduct = !backendProductIds.has(product.id);

    if (isLocalProduct) {
      // Locally-added product: skip createOrder, go straight to checkout
      if (!actor) {
        toast.error("Not connected. Please try again.");
        return;
      }
      actor
        .createCheckoutSession(
          [
            {
              productName: product.name,
              currency: product.currency,
              quantity: 1n,
              priceInCents: product.priceInCents,
              productDescription: product.description,
            },
          ],
          successUrl,
          cancelUrl,
        )
        .then((checkoutUrl) => {
          window.location.href = checkoutUrl;
        })
        .catch((error) => {
          toast.error("Failed to start checkout. Please try again.", {
            description:
              error instanceof Error ? error.message : "Unknown error",
          });
        });
    } else {
      createOrderAndCheckout(
        {
          productId: product.id,
          items: [
            {
              productName: product.name,
              currency: product.currency,
              quantity: 1n,
              priceInCents: product.priceInCents,
              productDescription: product.description,
            },
          ],
          successUrl,
          cancelUrl,
        },
        {
          onSuccess: (checkoutUrl) => {
            window.location.href = checkoutUrl;
          },
          onError: (error) => {
            toast.error("Failed to start checkout. Please try again.", {
              description:
                error instanceof Error ? error.message : "Unknown error",
            });
          },
        },
      );
    }
  };

  return (
    <div className="relative">
      {/* Hero section */}
      <section className="relative overflow-hidden border-b border-border/40 bg-mesh">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="container relative py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Zap className="h-3 w-3" />
              Secure Payment Processing
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground leading-tight mb-4">
              Choose the plan{" "}
              <span className="text-primary">that fits your needs</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
              All plans include secure Stripe-powered checkout, instant
              activation, and a 14-day money-back guarantee.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Products grid */}
      <section className="container py-12">
        {/* Loading */}
        {isLoading && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            data-ocid="products.loading_state"
          >
            {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((k) => (
              <ProductCardSkeleton key={k} />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div
            className="flex flex-col items-center gap-4 py-20 text-center"
            data-ocid="products.error_state"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 ring-1 ring-destructive/20">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="font-display font-semibold text-foreground mb-1">
                Failed to load products
              </p>
              <p className="text-sm text-muted-foreground">
                Something went wrong while fetching products. Please refresh.
              </p>
            </div>
          </div>
        )}

        {/* Products or empty */}
        {!isLoading && (
          <AnimatePresence mode="wait">
            {!isError && (
              <>
                {!isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3"
                  >
                    <Zap className="h-4 w-4 text-primary flex-shrink-0" />
                    <p className="text-sm text-foreground">
                      Sign in to purchase any product below.
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const btn = document.querySelector<HTMLButtonElement>(
                          '[data-ocid="nav.login_button"]',
                        );
                        btn?.click();
                      }}
                      className="ml-auto text-primary hover:text-primary hover:bg-primary/10 flex-shrink-0"
                    >
                      Sign In
                    </Button>
                  </motion.div>
                )}

                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                  data-ocid="products.list"
                >
                  {displayProducts.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={i}
                      onBuy={handleBuy}
                      isBuying={isPending}
                    />
                  ))}
                </div>

                {displayProducts.length === 0 && (
                  <div
                    className="flex flex-col items-center gap-4 py-20 text-center"
                    data-ocid="products.empty_state"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted ring-1 ring-border">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-foreground mb-1">
                        No products available
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Check back soon for available products.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </AnimatePresence>
        )}
      </section>
    </div>
  );
}
