import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import LoginPrompt from "../components/LoginPrompt";
import StatusBadge from "../components/StatusBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useUserOrders } from "../hooks/useQueries";
import { formatDate, formatPrice } from "../utils/format";

function TableRowSkeleton({ index }: { index: number }) {
  return (
    <TableRow className="border-border/50" data-ocid={`orders.row.${index}`}>
      <TableCell>
        <Skeleton className="h-4 w-12 bg-muted/50" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24 bg-muted/50" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16 bg-muted/50" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-20 rounded-full bg-muted/50" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24 bg-muted/50" />
      </TableCell>
    </TableRow>
  );
}

export default function OrdersPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: orders, isLoading, isError } = useUserOrders();

  if (!isAuthenticated) {
    return (
      <LoginPrompt
        title="Sign in to view your orders"
        description="Your order history is private and requires authentication."
      />
    );
  }

  return (
    <div className="container py-10 sm:py-14">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
            <ShoppingBag className="h-4 w-4 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            My Orders
          </h1>
        </div>
        <p className="text-sm text-muted-foreground ml-12">
          Track all your purchases and payment history.
        </p>
      </motion.div>

      {/* Error */}
      {isError && (
        <div
          className="flex flex-col items-center gap-4 py-16 text-center"
          data-ocid="orders.error_state"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 ring-1 ring-destructive/20">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="font-display font-semibold text-foreground mb-1">
              Failed to load orders
            </p>
            <p className="text-sm text-muted-foreground">
              Something went wrong. Please refresh the page.
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {!isError && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
          className="rounded-xl border border-border overflow-hidden"
        >
          <Table data-ocid="orders.table">
            <TableHeader>
              <TableRow className="border-border/60 bg-card/80 hover:bg-card/80">
                <TableHead className="text-muted-foreground font-medium text-xs uppercase tracking-wider w-20">
                  Order ID
                </TableHead>
                <TableHead className="text-muted-foreground font-medium text-xs uppercase tracking-wider">
                  Product
                </TableHead>
                <TableHead className="text-muted-foreground font-medium text-xs uppercase tracking-wider">
                  Amount
                </TableHead>
                <TableHead className="text-muted-foreground font-medium text-xs uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="text-muted-foreground font-medium text-xs uppercase tracking-wider">
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <tr
                  data-ocid="orders.loading_state"
                  style={{ display: "contents" }}
                >
                  {(["sk1", "sk2", "sk3", "sk4", "sk5"] as const).map(
                    (k, i) => (
                      <TableRowSkeleton key={k} index={i + 1} />
                    ),
                  )}
                </tr>
              )}

              {!isLoading &&
                orders &&
                orders.length > 0 &&
                orders.map((order, i) => (
                  <TableRow
                    key={order.id.toString()}
                    className="border-border/40 hover:bg-card/60 transition-colors"
                    data-ocid={`orders.row.${i + 1}`}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{order.id.toString().padStart(4, "0")}
                    </TableCell>
                    <TableCell className="font-medium text-sm text-foreground">
                      {order.productId}
                    </TableCell>
                    <TableCell className="price-display text-sm font-semibold text-foreground">
                      {formatPrice(order.amount, order.currency)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {/* Empty state */}
          {!isLoading && (!orders || orders.length === 0) && (
            <div
              className="flex flex-col items-center gap-5 py-16 text-center"
              data-ocid="orders.empty_state"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted ring-1 ring-border">
                <ShoppingBag className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-display font-semibold text-foreground mb-1">
                  No orders yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Your completed purchases will appear here.
                </p>
              </div>
              <Button
                asChild
                size="sm"
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link to="/">
                  Browse Products
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
