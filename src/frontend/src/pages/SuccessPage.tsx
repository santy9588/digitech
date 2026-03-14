import { Button } from "@/components/ui/button";
import { Link, useSearch } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useStripeSessionStatus } from "../hooks/useQueries";

export default function SuccessPage() {
  const search = useSearch({ strict: false }) as Record<string, string>;
  const sessionId = search?.session_id ?? null;

  const {
    data: sessionStatus,
    isLoading,
    isError,
  } = useStripeSessionStatus(sessionId);

  const isSuccess = sessionStatus?.__kind__ === "completed";
  const isFailed = sessionStatus?.__kind__ === "failed";

  return (
    <div
      className="container flex flex-col items-center justify-center py-24 px-4"
      data-ocid="success.page"
    >
      {/* Loading state */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6 text-center"
          data-ocid="success.loading_state"
        >
          <div className="relative flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 ring-2 ring-primary/30">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          </div>
          <div>
            <p className="font-display text-xl font-semibold text-foreground mb-1">
              Verifying your payment
            </p>
            <p className="text-sm text-muted-foreground">
              Please wait while we confirm your transaction…
            </p>
          </div>
        </motion.div>
      )}

      {/* Error state (network/API failure) */}
      {(isError || (!isLoading && !sessionId)) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col items-center gap-6 text-center max-w-sm"
          data-ocid="success.error_state"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 ring-2 ring-destructive/20">
            <XCircle className="h-9 w-9 text-destructive" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Unable to verify payment
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {!sessionId
                ? "No session ID found. This page requires a valid checkout session."
                : "Something went wrong while checking your payment status. Please try again."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              variant="outline"
              className="gap-2 border-border/60"
            >
              <Link to="/" data-ocid="success.products_link">
                <ArrowLeft className="h-4 w-4" />
                Back to Products
              </Link>
            </Button>
          </div>
        </motion.div>
      )}

      {/* Success state */}
      {!isLoading && !isError && isSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-6 text-center max-w-sm"
          data-ocid="success.success_state"
        >
          {/* Animated check */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.15,
              duration: 0.5,
              type: "spring",
              stiffness: 200,
            }}
            className="relative flex h-24 w-24 items-center justify-center"
          >
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/15 ring-2 ring-primary/40">
              <CheckCircle2 className="h-11 w-11 text-primary" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            <h1 className="font-display text-3xl font-bold text-foreground mb-3">
              Payment Successful!
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
              Your payment has been confirmed. Thank you for your purchase!
            </p>
            {sessionStatus.completed.userPrincipal && (
              <p className="text-xs text-muted-foreground/70 font-mono">
                Principal: {sessionStatus.completed.userPrincipal}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 w-full"
          >
            <Button
              asChild
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold flex-1"
            >
              <Link to="/orders" data-ocid="success.orders_link">
                <ShoppingBag className="h-4 w-4" />
                View My Orders
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="gap-2 border-border/60 flex-1"
            >
              <Link to="/" data-ocid="success.products_link">
                <ArrowLeft className="h-4 w-4" />
                Back to Products
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Failed payment state */}
      {!isLoading && !isError && isFailed && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col items-center gap-6 text-center max-w-sm"
          data-ocid="success.error_state"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 ring-2 ring-destructive/20">
            <XCircle className="h-9 w-9 text-destructive" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Payment Failed
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {sessionStatus.failed.error ||
                "Your payment could not be processed. Please try again."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              <Link to="/" data-ocid="success.products_link">
                <ArrowLeft className="h-4 w-4" />
                Try Again
              </Link>
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
