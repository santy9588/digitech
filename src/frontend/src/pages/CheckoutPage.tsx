import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { CreditCard, Loader2, ShieldCheck, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product, ShoppingItem } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateCheckoutSession,
  useCreatePayPalCheckoutSession,
  useGetCart,
  useGetEnabledGateways,
  useGetProduct,
  useIsStripeConfigured,
} from "../hooks/useQueries";
import { CATEGORY_META } from "../lib/categoryMeta";

// ── Payment gateway definitions ──────────────────────────────────

type GatewayId = "card" | "googlepay" | "applepay" | "paypal";

interface GatewayDef {
  id: GatewayId;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  buttonClass: string;
  buttonLabel: (total: string) => string;
}

const GATEWAYS: GatewayDef[] = [
  {
    id: "card",
    label: "Credit / Debit Card",
    sublabel: "Visa, Mastercard, Amex, and more",
    icon: (
      <div className="flex items-center gap-1">
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#1A1F71] text-white">
          VISA
        </span>
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EB001B] text-white">
          MC
        </span>
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#2E77BC] text-white">
          AMEX
        </span>
      </div>
    ),
    buttonClass:
      "bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow",
    buttonLabel: (t) => `Pay $${t} with Card`,
  },
  {
    id: "googlepay",
    label: "Google Pay",
    sublabel: "Fast & secure via Stripe",
    icon: (
      <span className="font-bold text-sm tracking-tight">
        <span style={{ color: "#4285F4" }}>G</span>
        <span style={{ color: "#EA4335" }}>o</span>
        <span style={{ color: "#FBBC05" }}>o</span>
        <span style={{ color: "#4285F4" }}>g</span>
        <span style={{ color: "#34A853" }}>l</span>
        <span style={{ color: "#EA4335" }}>e</span>
        <span className="ml-1 text-foreground"> Pay</span>
      </span>
    ),
    buttonClass:
      "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50",
    buttonLabel: (t) => `Pay $${t} with Google Pay`,
  },
  {
    id: "applepay",
    label: "Apple Pay",
    sublabel: "Fast & secure via Stripe",
    icon: (
      <span
        className="font-semibold text-sm"
        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}
      >
        🍎 Apple Pay
      </span>
    ),
    buttonClass: "bg-black text-white hover:bg-zinc-900 border border-zinc-800",
    buttonLabel: (t) => `Pay $${t} with Apple Pay`,
  },
  {
    id: "paypal",
    label: "PayPal",
    sublabel: "Pay with your PayPal account",
    icon: (
      <span className="font-bold text-sm">
        <span style={{ color: "#003087" }}>Pay</span>
        <span style={{ color: "#009CDE" }}>Pal</span>
      </span>
    ),
    buttonClass: "text-white hover:opacity-90",
    buttonLabel: (t) => `Pay $${t} with PayPal`,
  },
];

// ── Order Item ───────────────────────────────────────────────────

function OrderItem({ productId }: { productId: string }) {
  const { data: product } = useGetProduct(productId);
  const meta = product
    ? (CATEGORY_META[product.category] ?? CATEGORY_META.Other)
    : null;
  const price = product ? (Number(product.priceCents) / 100).toFixed(2) : "—";

  if (!product)
    return (
      <div className="flex justify-between items-center py-2">
        <Skeleton className="h-4 w-48 bg-secondary/50" />
        <Skeleton className="h-4 w-16 bg-secondary/50" />
      </div>
    );

  return (
    <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
      <div className="min-w-0">
        <p className="font-medium text-sm truncate">{product.title}</p>
        <p className="text-xs text-muted-foreground">
          {meta?.icon} {product.category}
        </p>
      </div>
      <span className="font-mono text-primary font-semibold ml-4 flex-shrink-0">
        ${price}
      </span>
    </div>
  );
}

// ── Product list hook ─────────────────────────────────────────────

function useProductList(productIds: string[]) {
  const p1 = useGetProduct(productIds[0] ?? "");
  const p2 = useGetProduct(productIds[1] ?? "");
  const p3 = useGetProduct(productIds[2] ?? "");
  const p4 = useGetProduct(productIds[3] ?? "");
  const p5 = useGetProduct(productIds[4] ?? "");
  const p6 = useGetProduct(productIds[5] ?? "");
  const p7 = useGetProduct(productIds[6] ?? "");
  const p8 = useGetProduct(productIds[7] ?? "");
  const p9 = useGetProduct(productIds[8] ?? "");
  const p10 = useGetProduct(productIds[9] ?? "");

  const allQueries = [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10];
  const products = allQueries
    .slice(0, productIds.length)
    .map((q) => q.data)
    .filter((p): p is Product => !!p);
  const allLoaded = products.length === productIds.length;

  return { products, allLoaded };
}

// ── Gateway Selector Card ─────────────────────────────────────────

function GatewayCard({
  gateway,
  selected,
  onSelect,
}: {
  gateway: GatewayDef;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      data-ocid={`checkout.gateway.${gateway.id}.button`}
      onClick={onSelect}
      className={`w-full text-left rounded-xl p-4 border transition-all duration-200 ${
        selected
          ? "border-primary bg-primary/10 shadow-glow-sm"
          : "border-border bg-secondary/20 hover:border-primary/40 hover:bg-secondary/40"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`h-4 w-4 rounded-full border-2 flex-shrink-0 transition-all ${
              selected
                ? "border-primary bg-primary"
                : "border-muted-foreground/40"
            }`}
          >
            {selected && (
              <div className="h-full w-full rounded-full scale-50 bg-primary-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm">{gateway.label}</p>
            <p className="text-xs text-muted-foreground">{gateway.sublabel}</p>
          </div>
        </div>
        <div className="flex-shrink-0">{gateway.icon}</div>
      </div>
    </button>
  );
}

// ── Checkout Content ──────────────────────────────────────────────

function CheckoutContent({
  productIds,
  stripeConfigured,
}: {
  productIds: string[];
  stripeConfigured: boolean;
}) {
  const createCheckout = useCreateCheckoutSession();
  const createPayPalCheckout = useCreatePayPalCheckoutSession();
  const { data: enabledGateways } = useGetEnabledGateways();
  const { products, allLoaded } = useProductList(productIds);

  const [selectedGateway, setSelectedGateway] = useState<GatewayId>("card");

  const totalCents = products.reduce((acc, p) => acc + Number(p.priceCents), 0);
  const total = (totalCents / 100).toFixed(2);

  // Filter to only enabled gateways (fallback: show all)
  const visibleGateways = GATEWAYS.filter((g) =>
    enabledGateways ? enabledGateways.includes(g.id) : true,
  );

  const selectedDef =
    GATEWAYS.find((g) => g.id === selectedGateway) ?? GATEWAYS[0];

  const isPending = createCheckout.isPending || createPayPalCheckout.isPending;

  const handlePay = async () => {
    if (!stripeConfigured) {
      toast.error(
        "Payment is not configured yet. Please contact the store admin.",
      );
      return;
    }

    const shoppingItems: ShoppingItem[] = products.map((p) => ({
      productName: p.title,
      currency: "usd",
      quantity: BigInt(1),
      priceInCents: p.priceCents,
      productDescription: p.description.slice(0, 200),
    }));

    try {
      if (selectedGateway === "paypal") {
        const session = await createPayPalCheckout.mutateAsync(shoppingItems);
        if (!session?.url) throw new Error("Session URL missing");
        window.location.href = session.url;
      } else {
        // Card, Google Pay, Apple Pay — all handled by Stripe
        const session = await createCheckout.mutateAsync(shoppingItems);
        if (!session?.url) throw new Error("Session URL missing");
        window.location.href = session.url;
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to create checkout session",
      );
    }
  };

  // Dynamic button style for PayPal
  const paypalStyle =
    selectedGateway === "paypal"
      ? { backgroundColor: "#003087", borderColor: "#003087" }
      : undefined;

  return (
    <div
      data-ocid="checkout.page"
      className="container mx-auto px-4 py-10 sm:px-6 max-w-lg"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-lg bg-primary/10">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Checkout</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Choose how you'd like to pay
          </p>
        </div>
      </div>

      {/* Order Summary */}
      <div className="card-glass rounded-xl p-6 mb-6">
        <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" /> Order Summary
        </h2>
        <div className="space-y-0 divide-y divide-border">
          {productIds.map((id) => (
            <OrderItem key={id} productId={id} />
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
          <span className="font-display text-lg font-semibold">Total</span>
          <span className="font-display text-2xl font-bold text-gradient-cyan">
            {allLoaded ? `$${total}` : "…"}
          </span>
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="card-glass rounded-xl p-6 mb-6">
        <h2 className="font-display text-lg font-semibold mb-4">
          Select Payment Method
        </h2>
        <div className="space-y-3" data-ocid="checkout.gateway.list">
          {visibleGateways.map((gateway) => (
            <GatewayCard
              key={gateway.id}
              gateway={gateway}
              selected={selectedGateway === gateway.id}
              onSelect={() => setSelectedGateway(gateway.id)}
            />
          ))}
        </div>

        {/* Info notice */}
        <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground bg-secondary/30 rounded-lg p-3">
          <ShieldCheck className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
          <span>
            Google Pay, Apple Pay, and PayPal availability depends on your
            Stripe configuration and browser support. All payments are processed
            securely.
          </span>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <Badge
          variant="outline"
          className="text-xs border-primary/30 text-muted-foreground gap-1"
        >
          <ShieldCheck className="h-3 w-3 text-primary" />
          Secure checkout
        </Badge>
        <Badge
          variant="outline"
          className="text-xs border-border text-muted-foreground"
        >
          256-bit SSL encryption
        </Badge>
        <Badge
          variant="outline"
          className="text-xs border-border text-muted-foreground"
        >
          Global payments
        </Badge>
      </div>

      {!stripeConfigured && (
        <div
          data-ocid="checkout.stripe.error_state"
          className="rounded-xl p-4 mb-4 bg-destructive/10 border border-destructive/30 text-sm text-destructive"
        >
          Payment is not configured. Please contact the store admin to set up
          Stripe.
        </div>
      )}

      {/* Pay Button */}
      <Button
        data-ocid="checkout.pay.primary_button"
        size="lg"
        className={`w-full gap-2 font-semibold ${selectedDef.buttonClass}`}
        style={paypalStyle}
        onClick={handlePay}
        disabled={isPending || !allLoaded || !stripeConfigured}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Processing…
          </>
        ) : (
          <>{selectedDef.buttonLabel(allLoaded ? total : "…")}</>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground mt-4">
        {selectedGateway === "paypal"
          ? "You'll be redirected to PayPal to complete your payment"
          : "You'll be redirected to Stripe's secure checkout page"}
      </p>
    </div>
  );
}

export default function CheckoutPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: cart, isLoading: cartLoading } = useGetCart();
  const { data: stripeConfigured } = useIsStripeConfigured();

  const productIds = cart?.products ?? [];

  if (!isAuthenticated) {
    return (
      <div
        className="container mx-auto px-4 py-20 text-center max-w-md"
        data-ocid="checkout.page"
      >
        <h2 className="font-display text-2xl font-bold mb-4">
          Sign in to checkout
        </h2>
        <Link to="/">
          <Button className="bg-primary text-primary-foreground">
            Go Home
          </Button>
        </Link>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div
        data-ocid="checkout.loading_state"
        className="container mx-auto px-4 py-10 max-w-lg"
      >
        <Skeleton className="h-8 w-48 mb-6 bg-secondary/50" />
        <Skeleton className="h-48 w-full rounded-xl bg-secondary/50" />
      </div>
    );
  }

  if (productIds.length === 0) {
    return (
      <div
        data-ocid="checkout.page"
        className="container mx-auto px-4 py-20 text-center max-w-md"
      >
        <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">
          Your cart is empty
        </h2>
        <p className="text-muted-foreground mb-6">
          Add some products before checking out.
        </p>
        <Link to="/catalog">
          <Button
            data-ocid="checkout.browse.primary_button"
            className="bg-primary text-primary-foreground"
          >
            Browse Catalog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <CheckoutContent
      productIds={productIds.slice(0, 10)}
      stripeConfigured={stripeConfigured ?? false}
    />
  );
}
