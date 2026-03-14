import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type Product,
  createCheckoutSession,
  getProduct,
} from "@/services/backend";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Loader2,
  Lock,
  Shield,
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

interface ProductDetailProps {
  productId: string;
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

export function ProductDetail({ productId, onNavigate }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getProduct(productId).then((p) => {
      setProduct(p);
      setLoading(false);
    });
  }, [productId]);

  const handleBuyNow = async () => {
    if (!product) return;
    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const successUrl = `${window.location.origin}/#success`;
      const cancelUrl = `${window.location.origin}/#products/${product.id}`;
      const session = await createCheckoutSession(
        product.id,
        successUrl,
        cancelUrl,
      );
      // Navigate to success page with order ID (mock mode)
      const orderId =
        new URL(session.url).searchParams.get("order") ?? "unknown";
      onNavigate("success");
      // Store the order ID in sessionStorage for the success page
      sessionStorage.setItem("lastOrderId", orderId);
    } catch (err) {
      setCheckoutError(
        err instanceof Error
          ? err.message
          : "Checkout failed. Please try again.",
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Skeleton className="rounded-2xl h-80 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-12 w-full rounded-md mt-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">
            Product Not Found
          </h2>
          <p className="text-muted-foreground mb-6">
            This product doesn't exist or has been removed.
          </p>
          <Button
            onClick={() => onNavigate("products")}
            className="bg-primary text-primary-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => onNavigate("products")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          data-ocid="product.back_button"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative rounded-2xl overflow-hidden border border-border aspect-video lg:aspect-square max-h-[480px]">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />
              {product.popular && (
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-primary-foreground text-sm font-semibold px-3 py-1.5 rounded-full glow-cyan-sm">
                    ⚡ Most Popular
                  </span>
                </div>
              )}
            </div>

            {/* Stripe Trust Badge */}
            <div className="mt-6 rounded-xl border border-border bg-card/50 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="stripe-badge rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-white" />
                  <span className="text-white text-xs font-semibold">
                    Stripe
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Secure Payment
                  </p>
                  <p className="text-xs text-muted-foreground">
                    256-bit SSL encryption
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <Lock className="w-3.5 h-3.5 text-primary" />
              </div>
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            <span
              className={`inline-flex self-start text-xs font-medium px-2.5 py-0.5 rounded-full border mb-4 ${CATEGORY_COLORS[product.category] ?? "bg-secondary text-secondary-foreground border-transparent"}`}
            >
              {product.category}
            </span>

            <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-4 leading-tight">
              {product.name}
            </h1>

            <p className="text-muted-foreground leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Features */}
            <div className="space-y-2.5 mb-8">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                What's Included
              </h3>
              {product.features.map((feature) => (
                <div key={feature} className="flex items-start gap-2.5">
                  <div className="mt-0.5 w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            {/* Price & CTA */}
            <div className="mt-auto">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-display font-bold text-5xl text-foreground">
                  ${product.price.toFixed(2)}
                </span>
                {product.category === "Subscription" && (
                  <span className="text-muted-foreground text-lg">/ month</span>
                )}
              </div>

              {checkoutError && (
                <Alert
                  variant="destructive"
                  className="mb-4"
                  data-ocid="checkout.error_state"
                >
                  <AlertDescription>{checkoutError}</AlertDescription>
                </Alert>
              )}

              {checkoutLoading ? (
                <div
                  className="flex flex-col items-center justify-center gap-3 py-8 rounded-xl border border-primary/20 bg-primary/5"
                  data-ocid="checkout.loading_state"
                >
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    Creating secure checkout session...
                  </p>
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={handleBuyNow}
                  disabled={checkoutLoading}
                  data-ocid="product.buy_button"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan h-14 text-base font-semibold"
                >
                  <Zap className="w-5 h-5 mr-2" fill="currentColor" />
                  Buy Now — ${product.price.toFixed(2)}
                  {product.category === "Subscription" ? "/mo" : ""}
                </Button>
              )}

              <p className="text-center text-xs text-muted-foreground mt-3">
                By purchasing, you agree to our Terms of Service. All sales are
                final.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
