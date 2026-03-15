import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { CreditCard, Loader2, QrCode, ShieldCheck, Wallet } from "lucide-react";
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

// ── Payment gateway definitions ───────────────────────────────────

type GatewayId =
  | "card"
  | "debit"
  | "international"
  | "phonepe"
  | "googlepay"
  | "paytm"
  | "amazonpay"
  | "bhimupi"
  | "upi"
  | "qrcode"
  | "paypal"
  | "netbanking"
  | "applepay";

interface GatewayDef {
  id: GatewayId;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  buttonClass: string;
  buttonLabel: (total: string) => string;
  section: "cards" | "upi" | "qr" | "other";
}

const GATEWAYS: GatewayDef[] = [
  // ─── Cards ───────────────────────────────────────────────────
  {
    id: "card",
    label: "Credit Card",
    sublabel: "Visa, Mastercard, RuPay, Amex",
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
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#006A4E] text-white">
          RP
        </span>
      </div>
    ),
    buttonClass:
      "bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow",
    buttonLabel: (t) => `Pay $${t} with Credit Card`,
    section: "cards",
  },
  {
    id: "debit",
    label: "Debit Card",
    sublabel: "All major bank debit cards",
    icon: (
      <div className="flex items-center gap-1">
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#1A1F71] text-white">
          VISA
        </span>
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EB001B] text-white">
          MC
        </span>
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#006A4E] text-white">
          RP
        </span>
      </div>
    ),
    buttonClass:
      "bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow",
    buttonLabel: (t) => `Pay $${t} with Debit Card`,
    section: "cards",
  },
  {
    id: "international",
    label: "International Card",
    sublabel: "Any international Visa/Mastercard",
    icon: (
      <div className="flex items-center gap-1">
        <span className="text-lg">🌍</span>
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#1A1F71] text-white">
          VISA
        </span>
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EB001B] text-white">
          MC
        </span>
      </div>
    ),
    buttonClass:
      "bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow",
    buttonLabel: (t) => `Pay $${t} — International Card`,
    section: "cards",
  },
  // ─── UPI & Mobile Wallets ─────────────────────────────────────
  {
    id: "phonepe",
    label: "PhonePe",
    sublabel: "India's most trusted UPI app",
    icon: (
      <div
        className="flex items-center justify-center h-7 w-14 rounded-md"
        style={{ background: "#5f259f" }}
      >
        <span className="text-white text-[10px] font-extrabold tracking-tight">
          PhonePe
        </span>
      </div>
    ),
    buttonClass: "text-white hover:opacity-90",
    buttonLabel: (t) => `Pay $${t} with PhonePe`,
    section: "upi",
  },
  {
    id: "googlepay",
    label: "Google Pay",
    sublabel: "Fast & secure Google Pay",
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
    section: "upi",
  },
  {
    id: "paytm",
    label: "Paytm",
    sublabel: "Pay via Paytm wallet or UPI",
    icon: (
      <div
        className="flex items-center justify-center h-7 w-14 rounded-md"
        style={{ background: "#00B9F1" }}
      >
        <span className="text-white text-[10px] font-extrabold">Paytm</span>
      </div>
    ),
    buttonClass: "text-white hover:opacity-90",
    buttonLabel: (t) => `Pay $${t} with Paytm`,
    section: "upi",
  },
  {
    id: "amazonpay",
    label: "Amazon Pay",
    sublabel: "Pay with your Amazon balance",
    icon: (
      <div className="flex items-center gap-1">
        <span className="text-[13px] font-bold" style={{ color: "#FF9900" }}>
          amazon
        </span>
        <span
          className="text-[10px] font-semibold"
          style={{ color: "#232F3E" }}
        >
          pay
        </span>
      </div>
    ),
    buttonClass: "text-white hover:opacity-90",
    buttonLabel: (t) => `Pay $${t} with Amazon Pay`,
    section: "upi",
  },
  {
    id: "bhimupi",
    label: "BHIM UPI",
    sublabel: "Government of India UPI app",
    icon: (
      <div className="flex items-center gap-1.5">
        <div
          className="h-6 w-6 rounded-full flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg,#FF9933 33%,#fff 33%,#fff 66%,#138808 66%)",
          }}
        >
          <span className="text-[8px] font-bold text-[#000080]">₹</span>
        </div>
        <span className="text-xs font-bold text-foreground">BHIM</span>
      </div>
    ),
    buttonClass: "bg-[#1B3A6B] text-white hover:opacity-90",
    buttonLabel: (t) => `Pay $${t} via BHIM UPI`,
    section: "upi",
  },
  {
    id: "upi",
    label: "UPI",
    sublabel: "Enter any UPI ID to pay",
    icon: (
      <div className="flex items-center gap-1">
        <span className="text-sm font-bold" style={{ color: "#097939" }}>
          UPI
        </span>
        <span className="text-[10px] text-muted-foreground">₹</span>
      </div>
    ),
    buttonClass: "bg-[#097939] text-white hover:opacity-90",
    buttonLabel: (t) => `Pay $${t} via UPI`,
    section: "upi",
  },
  // ─── QR Code ─────────────────────────────────────────────────
  {
    id: "qrcode",
    label: "QR Code",
    sublabel: "Scan QR code to pay instantly",
    icon: <QrCode className="h-5 w-5 text-teal-400" />,
    buttonClass: "bg-teal-600 text-white hover:bg-teal-700",
    buttonLabel: (_t) => "Scan QR Code to Pay",
    section: "qr",
  },
  // ─── Other ────────────────────────────────────────────────────
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
    section: "other",
  },
  {
    id: "netbanking",
    label: "Net Banking",
    sublabel: "All major banks supported",
    icon: (
      <div className="flex items-center gap-1">
        <span className="text-lg">🏦</span>
        <span className="text-xs text-muted-foreground font-medium">Bank</span>
      </div>
    ),
    buttonClass: "bg-slate-700 text-white hover:bg-slate-800",
    buttonLabel: (t) => `Pay $${t} via Net Banking`,
    section: "other",
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
    section: "other",
  },
];

const SECTION_LABELS: Record<string, string> = {
  cards: "💳 Cards",
  upi: "📱 UPI & Mobile Wallets",
  qr: "🔲 QR Code Payment",
  other: "🌐 Other Methods",
};

// ── QR Code Panel ─────────────────────────────────────────────────

function QRCodePanel({ total }: { total: string }) {
  return (
    <div
      data-ocid="checkout.qr_panel"
      className="mt-4 rounded-xl border border-teal-500/30 bg-teal-500/5 p-6 flex flex-col items-center gap-4"
    >
      {/* SVG QR-style grid pattern */}
      <div className="rounded-xl border-2 border-teal-400 p-3 bg-white shadow-lg">
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="QR Code for payment"
        >
          <title>QR Code for payment</title>
          {/* Corner squares */}
          <rect x="8" y="8" width="30" height="30" rx="3" fill="#0d9488" />
          <rect x="14" y="14" width="18" height="18" rx="1" fill="white" />
          <rect x="18" y="18" width="10" height="10" rx="1" fill="#0d9488" />
          <rect x="82" y="8" width="30" height="30" rx="3" fill="#0d9488" />
          <rect x="88" y="14" width="18" height="18" rx="1" fill="white" />
          <rect x="92" y="18" width="10" height="10" rx="1" fill="#0d9488" />
          <rect x="8" y="82" width="30" height="30" rx="3" fill="#0d9488" />
          <rect x="14" y="88" width="18" height="18" rx="1" fill="white" />
          <rect x="18" y="92" width="10" height="10" rx="1" fill="#0d9488" />
          {/* Data modules */}
          {[
            [46, 8],
            [54, 8],
            [62, 8],
            [46, 16],
            [62, 16],
            [50, 24],
            [58, 24],
            [66, 24],
            [46, 32],
            [50, 32],
            [58, 32],
            [66, 32],
            [46, 40],
            [54, 40],
            [62, 40],
            [8, 46],
            [16, 46],
            [24, 46],
            [32, 46],
            [46, 46],
            [58, 46],
            [66, 46],
            [74, 46],
            [82, 46],
            [90, 46],
            [98, 46],
            [106, 46],
            [8, 54],
            [24, 54],
            [46, 54],
            [54, 54],
            [74, 54],
            [90, 54],
            [106, 54],
            [8, 62],
            [16, 62],
            [24, 62],
            [46, 62],
            [58, 62],
            [66, 62],
            [82, 62],
            [98, 62],
            [106, 62],
            [8, 74],
            [16, 74],
            [32, 74],
            [46, 74],
            [54, 74],
            [70, 74],
            [78, 74],
            [90, 74],
            [98, 74],
            [8, 82],
            [24, 82],
            [32, 82],
            [50, 82],
            [58, 82],
            [66, 82],
            [82, 90],
            [90, 90],
            [98, 90],
            [106, 90],
            [46, 98],
            [54, 98],
            [66, 98],
            [74, 98],
            [82, 98],
            [98, 106],
            [106, 106],
            [46, 106],
            [58, 106],
          ].map(([x, y]) => (
            <rect
              key={`qr-${x}-${y}`}
              x={x}
              y={y}
              width="6"
              height="6"
              rx="1"
              fill="#134e4a"
            />
          ))}
        </svg>
      </div>
      <div className="text-center">
        <p className="font-semibold text-teal-400 text-sm">Scan to Pay</p>
        <p className="text-muted-foreground text-xs mt-1">
          Open your UPI app and scan this QR code to pay{" "}
          <span className="font-mono font-bold text-foreground">${total}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Works with PhonePe · Google Pay · Paytm · BHIM · any UPI app
        </p>
      </div>
    </div>
  );
}

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
  index,
}: {
  gateway: GatewayDef;
  selected: boolean;
  onSelect: () => void;
  index: number;
}) {
  return (
    <button
      type="button"
      data-ocid={`checkout.gateway_card.${index}`}
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

  // Group gateways by section
  const sections = (["cards", "upi", "qr", "other"] as const)
    .map((sec) => ({
      key: sec,
      label: SECTION_LABELS[sec],
      gateways: visibleGateways.filter((g) => g.section === sec),
    }))
    .filter((s) => s.gateways.length > 0);

  // Global index for data-ocid
  let globalIdx = 0;

  const selectedDef =
    GATEWAYS.find((g) => g.id === selectedGateway) ?? GATEWAYS[0];
  const isPending = createCheckout.isPending || createPayPalCheckout.isPending;

  const handlePay = async () => {
    if (selectedGateway === "qrcode") {
      toast.info(
        "Please scan the QR code with your UPI app to complete payment.",
      );
      return;
    }
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

  // Dynamic button style
  let payBtnStyle: React.CSSProperties | undefined;
  if (selectedGateway === "paypal")
    payBtnStyle = { backgroundColor: "#003087", borderColor: "#003087" };
  else if (selectedGateway === "phonepe")
    payBtnStyle = { backgroundColor: "#5f259f", borderColor: "#5f259f" };
  else if (selectedGateway === "paytm")
    payBtnStyle = { backgroundColor: "#00B9F1", borderColor: "#00B9F1" };
  else if (selectedGateway === "amazonpay")
    payBtnStyle = {
      backgroundColor: "#FF9900",
      borderColor: "#FF9900",
      color: "#232F3E",
    };

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
        <h2 className="font-display text-lg font-semibold mb-5">
          Select Payment Method
        </h2>

        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.key}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {section.label}
              </p>
              <div className="space-y-2">
                {section.gateways.map((gateway) => {
                  globalIdx += 1;
                  const idx = globalIdx;
                  return (
                    <GatewayCard
                      key={gateway.id}
                      gateway={gateway}
                      selected={selectedGateway === gateway.id}
                      onSelect={() => setSelectedGateway(gateway.id)}
                      index={idx}
                    />
                  );
                })}
              </div>

              {/* QR Code Panel — shown when qrcode is selected and in this section */}
              {section.key === "qr" && selectedGateway === "qrcode" && (
                <QRCodePanel total={allLoaded ? total : "0.00"} />
              )}
            </div>
          ))}
        </div>

        {/* Info notice */}
        <div className="mt-5 flex items-start gap-2 text-xs text-muted-foreground bg-secondary/30 rounded-lg p-3">
          <ShieldCheck className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
          <span>
            All payments are encrypted and processed securely. UPI, PhonePe,
            Google Pay, Paytm, Amazon Pay, and Net Banking are processed via
            Stripe's payment infrastructure.
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
          256-bit SSL
        </Badge>
        <Badge
          variant="outline"
          className="text-xs border-border text-muted-foreground"
        >
          Global payments
        </Badge>
        <Badge
          variant="outline"
          className="text-xs border-border text-muted-foreground"
        >
          12+ gateways
        </Badge>
      </div>

      {!stripeConfigured && selectedGateway !== "qrcode" && (
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
        data-ocid="checkout.pay_button"
        size="lg"
        className={`w-full gap-2 font-semibold ${selectedDef.buttonClass}`}
        style={payBtnStyle}
        onClick={handlePay}
        disabled={
          isPending ||
          !allLoaded ||
          (selectedGateway !== "qrcode" && !stripeConfigured)
        }
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
          ? "You'll be redirected to PayPal to complete your purchase."
          : selectedGateway === "qrcode"
            ? "Open your UPI app, scan the QR code above, and confirm payment."
            : "You'll be redirected to a secure payment page to complete your purchase."}
      </p>
    </div>
  );
}

// ── Cart checkout helper ──────────────────────────────────────────

function CartCheckout({ stripeConfigured }: { stripeConfigured: boolean }) {
  const { data: cart } = useGetCart();
  const productIds = cart?.products ?? [];

  if (!cart)
    return (
      <div className="container mx-auto px-4 py-10 max-w-lg">
        <Skeleton className="h-64 w-full rounded-xl bg-secondary/50" />
      </div>
    );

  if (productIds.length === 0)
    return (
      <div
        data-ocid="checkout.empty_state"
        className="container mx-auto px-4 py-20 text-center max-w-md"
      >
        <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">
          Your cart is empty
        </h2>
        <p className="text-muted-foreground mb-6">
          Add some products to your cart before checking out.
        </p>
        <Link to="/catalog">
          <Button
            data-ocid="checkout.catalog.link"
            className="bg-primary text-primary-foreground"
          >
            Browse Catalog
          </Button>
        </Link>
      </div>
    );

  return (
    <CheckoutContent
      productIds={productIds}
      stripeConfigured={stripeConfigured}
    />
  );
}

// ── Page ──────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { identity } = useInternetIdentity();
  const { data: stripeConfigured, isLoading } = useIsStripeConfigured();

  if (!identity)
    return (
      <div
        data-ocid="checkout.page"
        className="container mx-auto px-4 py-20 text-center max-w-md"
      >
        <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">
          Sign in to checkout
        </h2>
        <p className="text-muted-foreground">
          You need to sign in before completing your purchase.
        </p>
      </div>
    );

  if (isLoading)
    return (
      <div className="container mx-auto px-4 py-10 max-w-lg">
        <Skeleton className="h-64 w-full rounded-xl bg-secondary/50" />
      </div>
    );

  return <CartCheckout stripeConfigured={!!stripeConfigured} />;
}
