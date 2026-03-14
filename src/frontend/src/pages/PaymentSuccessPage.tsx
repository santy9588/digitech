import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Package } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <div
      data-ocid="payment-success.page"
      className="container mx-auto px-4 py-20 text-center max-w-md"
    >
      <div className="relative inline-flex items-center justify-center mb-6">
        <div
          className="absolute inset-0 rounded-full animate-pulse-glow"
          style={{
            background: "oklch(0.78 0.18 195 / 0.2)",
            borderRadius: "9999px",
          }}
        />
        <div className="relative p-5 rounded-full bg-primary/10 border border-primary/30">
          <CheckCircle2 className="h-12 w-12 text-primary" />
        </div>
      </div>

      <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
        Payment Successful! 🎉
      </h1>
      <p className="text-muted-foreground text-lg mb-8">
        Your order has been processed. Your digital products are now available
        for download.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/orders">
          <Button
            data-ocid="payment-success.orders.primary_button"
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
          >
            <Package className="h-4 w-4" />
            View My Orders
          </Button>
        </Link>
        <Link to="/catalog">
          <Button
            data-ocid="payment-success.catalog.secondary_button"
            variant="outline"
            className="gap-2 border-border"
          >
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
