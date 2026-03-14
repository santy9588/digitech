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
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { type Order, type OrderStatus, getMyOrders } from "@/services/backend";
import { ArrowRight, LogIn, RefreshCw, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

type Page =
  | "home"
  | "products"
  | "orders"
  | "admin"
  | "product-detail"
  | "success";

interface OrdersProps {
  onNavigate: (page: Page, productId?: string) => void;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending:
    "bg-[oklch(0.78_0.18_70/0.15)] text-[oklch(0.78_0.18_70)] border border-[oklch(0.78_0.18_70/0.3)]",
  paid: "bg-[oklch(0.72_0.17_150/0.15)] text-[oklch(0.72_0.17_150)] border border-[oklch(0.72_0.17_150/0.3)]",
  failed:
    "bg-[oklch(0.62_0.22_28/0.15)] text-[oklch(0.72_0.22_28)] border border-[oklch(0.62_0.22_28/0.3)]",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function Orders({ onNavigate }: OrdersProps) {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = !!identity;

  useEffect(() => {
    if (!isLoggedIn) return;
    setLoading(true);
    getMyOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, [isLoggedIn]);

  const handleRefresh = () => {
    setLoading(true);
    getMyOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-secondary flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="font-display font-bold text-2xl text-foreground mb-2">
            Sign In Required
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Please sign in to view your order history.
          </p>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            data-ocid="orders.login_button"
            className="bg-primary text-primary-foreground"
          >
            <LogIn className="w-4 h-4 mr-2" />
            {isLoggingIn ? "Connecting..." : "Sign In to View Orders"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-primary text-sm font-medium font-mono mb-2">
              — ORDER HISTORY
            </p>
            <h1 className="font-display font-bold text-4xl text-foreground">
              My Orders
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="border-border"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 rounded-2xl border border-dashed border-border"
            data-ocid="orders.empty_state"
          >
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display font-semibold text-xl text-foreground mb-2">
              No orders yet
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              Browse our catalog and find the perfect digital tool for your
              needs.
            </p>
            <Button
              onClick={() => onNavigate("products")}
              className="bg-primary text-primary-foreground"
            >
              Browse Products
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="rounded-xl border border-border overflow-hidden">
              <Table data-ocid="orders.table">
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-medium">
                      Order ID
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Product
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Amount
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Status
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, idx) => (
                    <TableRow
                      key={order.id}
                      className="border-border hover:bg-secondary/50"
                      data-ocid={`orders.item.${idx + 1}`}
                    >
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">
                          {order.id}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-foreground text-sm">
                          {order.productName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-display font-semibold text-foreground">
                          ${order.amount.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_STYLES[order.status]}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              order.status === "paid"
                                ? "bg-[oklch(0.72_0.17_150)]"
                                : order.status === "pending"
                                  ? "bg-[oklch(0.78_0.18_70)]"
                                  : "bg-[oklch(0.72_0.22_28)]"
                            }`}
                          />
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              Showing {orders.length} order{orders.length !== 1 ? "s" : ""}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
