import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Calendar, Download, Loader2, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type Order, Variant_pending_paid_failed } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetMyOrders, useGetProduct } from "../hooks/useQueries";

function OrderProduct({ productId }: { productId: string }) {
  const { data: product } = useGetProduct(productId);
  const { actor } = useActor();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!actor || !product) return;
    setDownloading(true);
    try {
      const file = await actor.getProductFile(productId);
      const bytes = await file.getBytes();
      const blob = new Blob([bytes]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = product.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`"${product.title}" downloaded!`);
    } catch {
      toast.error("Download failed. You may not have access to this file.");
    } finally {
      setDownloading(false);
    }
  };

  if (!product) {
    return (
      <div className="flex items-center justify-between py-2">
        <Skeleton className="h-4 w-48 bg-secondary/50" />
        <Skeleton className="h-8 w-24 rounded-lg bg-secondary/50" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={product.thumbnail.getDirectURL()}
          alt={product.title}
          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
        />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{product.title}</p>
          <p className="text-xs text-muted-foreground">{product.category}</p>
        </div>
      </div>
      <Button
        data-ocid="orders.product.download_button"
        size="sm"
        variant="outline"
        onClick={handleDownload}
        disabled={downloading}
        className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10 flex-shrink-0"
      >
        {downloading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5" />
        )}
        Download
      </Button>
    </div>
  );
}

const PAYMENT_METHOD_CONFIG: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  card: { label: "Card", bg: "#2563EB", color: "#fff" },
  paypal: { label: "PayPal", bg: "#003087", color: "#fff" },
  googlepay: { label: "Google Pay", bg: "#34A853", color: "#fff" },
  applepay: { label: "Apple Pay", bg: "#1c1c1e", color: "#fff" },
};

function PaymentMethodBadge({ method }: { method?: string }) {
  const key = (method ?? "card").toLowerCase();
  const config = PAYMENT_METHOD_CONFIG[key] ?? PAYMENT_METHOD_CONFIG.card;
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold"
      style={{ background: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  );
}

function OrderCard({ order, index }: { order: Order; index: number }) {
  const date = new Date(Number(order.createdAt) / 1_000_000).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );
  const total = (Number(order.totalCents) / 100).toFixed(2);
  const paymentMethod = (order as any).paymentMethod as string | undefined;

  const statusColor: Record<Variant_pending_paid_failed, string> = {
    [Variant_pending_paid_failed.paid]: "oklch(0.7 0.2 145)",
    [Variant_pending_paid_failed.pending]: "oklch(0.82 0.16 85)",
    [Variant_pending_paid_failed.failed]: "oklch(0.62 0.22 25)",
  };

  return (
    <div
      data-ocid={`orders.order.item.${index}`}
      className="card-glass rounded-xl overflow-hidden"
    >
      {/* Order Header */}
      <div className="px-5 py-4 flex items-start justify-between gap-3 border-b border-border flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-muted-foreground">
              Order #{order.id.toString()}
            </span>
            <Badge
              className="text-xs"
              style={{ background: statusColor[order.status], color: "#fff" }}
            >
              {order.status}
            </Badge>
            <PaymentMethodBadge method={paymentMethod} />
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {date}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="font-mono font-bold text-primary">${total}</p>
        </div>
      </div>

      {/* Products */}
      <div className="px-5 py-3">
        {order.productIds.map((productId) => (
          <OrderProduct key={productId} productId={productId} />
        ))}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: orders, isLoading } = useGetMyOrders();

  if (!isAuthenticated) {
    return (
      <div
        data-ocid="orders.page"
        className="container mx-auto px-4 py-20 text-center max-w-md"
      >
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">
          Sign in to view orders
        </h2>
        <p className="text-muted-foreground">
          You need to be signed in to see your purchase history.
        </p>
      </div>
    );
  }

  return (
    <div
      data-ocid="orders.page"
      className="container mx-auto px-4 py-10 sm:px-6 max-w-2xl"
    >
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">My Orders</h1>
        <p className="text-muted-foreground mt-1">
          Your purchase history and downloads
        </p>
      </div>

      {isLoading ? (
        <div data-ocid="orders.loading_state" className="space-y-4">
          {["a", "b", "c"].map((k) => (
            <Skeleton
              key={k}
              className="h-40 w-full rounded-xl bg-secondary/50"
            />
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div
          data-ocid="orders.empty_state"
          className="text-center py-16 card-glass rounded-xl"
        >
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold mb-2">
            No orders yet
          </h3>
          <p className="text-muted-foreground mb-6">
            Your purchased products will appear here after checkout.
          </p>
          <Link to="/catalog">
            <Button
              data-ocid="orders.browse.primary_button"
              className="bg-primary text-primary-foreground"
            >
              Browse Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => (
            <OrderCard key={order.id.toString()} order={order} index={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
