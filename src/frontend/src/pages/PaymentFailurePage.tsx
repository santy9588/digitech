import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ShoppingCart, XCircle } from "lucide-react";

export default function PaymentFailurePage() {
  return (
    <div
      data-ocid="payment-failure.page"
      className="container mx-auto px-4 py-20 text-center max-w-md"
    >
      <div className="relative inline-flex items-center justify-center mb-6">
        <div className="p-5 rounded-full bg-destructive/10 border border-destructive/30">
          <XCircle className="h-12 w-12 text-destructive" />
        </div>
      </div>

      <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
        Payment Cancelled
      </h1>
      <p className="text-muted-foreground text-lg mb-8">
        Your payment was cancelled or failed. Your cart is still saved — you can
        try again at any time.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/cart">
          <Button
            data-ocid="payment-failure.cart.primary_button"
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <ShoppingCart className="h-4 w-4" />
            Return to Cart
          </Button>
        </Link>
        <Link to="/catalog">
          <Button
            data-ocid="payment-failure.catalog.secondary_button"
            variant="outline"
            className="gap-2 border-border"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Catalog
          </Button>
        </Link>
      </div>
    </div>
  );
}
