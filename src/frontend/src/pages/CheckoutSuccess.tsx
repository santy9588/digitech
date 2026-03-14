import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Home, Package } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

type Page =
  | "home"
  | "products"
  | "orders"
  | "admin"
  | "product-detail"
  | "success";

interface CheckoutSuccessProps {
  onNavigate: (page: Page, productId?: string) => void;
}

export function CheckoutSuccess({ onNavigate }: CheckoutSuccessProps) {
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Get order ID from sessionStorage (set during checkout)
    const stored = sessionStorage.getItem("lastOrderId");
    if (stored) {
      setOrderId(stored);
      sessionStorage.removeItem("lastOrderId");
    }
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <div
        className="max-w-lg mx-auto px-4 text-center"
        data-ocid="checkout.success_state"
      >
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center glow-cyan mb-6">
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-foreground mb-4">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
            Your order has been confirmed and is being processed. You'll receive
            an email confirmation shortly.
          </p>

          {orderId && (
            <div className="mb-8 bg-card border border-border rounded-xl p-4 inline-block">
              <p className="text-xs text-muted-foreground mb-1">
                Order Reference
              </p>
              <p className="font-mono text-sm text-primary font-medium">
                {orderId}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl p-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium text-sm text-foreground">
                  Instant Access
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Your digital product is ready. Check your email for access
                credentials.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium text-sm text-foreground">
                  Secure Payment
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Transaction secured and verified by Stripe's payment
                infrastructure.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => onNavigate("orders")}
              data-ocid="success.orders_button"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              View My Orders
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onNavigate("home")}
              data-ocid="success.home_button"
              className="border-border"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
