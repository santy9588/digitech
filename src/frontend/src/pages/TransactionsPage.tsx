import { Badge } from "@/components/ui/badge";
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
import {
  ArrowUpDown,
  BarChart3,
  CreditCard,
  DollarSign,
  Loader2,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Variant_pending_paid_failed } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetAllOrders, useIsCallerAdmin } from "../hooks/useQueries";

// ── Types ─────────────────────────────────────────────────────────

type AnyOrder = {
  id: bigint;
  status: Variant_pending_paid_failed;
  productIds: string[];
  createdAt: bigint;
  totalCents: bigint;
  stripePaymentId: string;
  buyer: { toString(): string };
  paymentMethod?: string;
};

// ── Payment method badge ──────────────────────────────────────────

const METHOD_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  card: { label: "Credit Card", color: "#fff", bg: "#1A1F71" },
  debit: { label: "Debit Card", color: "#fff", bg: "#2563EB" },
  international: { label: "Intl Card", color: "#fff", bg: "#0ea5e9" },
  phonepe: { label: "PhonePe", color: "#fff", bg: "#5f259f" },
  googlepay: { label: "Google Pay", color: "#fff", bg: "#34A853" },
  paytm: { label: "Paytm", color: "#fff", bg: "#00B9F1" },
  amazonpay: { label: "Amazon Pay", color: "#232F3E", bg: "#FF9900" },
  bhimupi: { label: "BHIM UPI", color: "#fff", bg: "#1B3A6B" },
  upi: { label: "UPI", color: "#fff", bg: "#097939" },
  qrcode: { label: "QR Code", color: "#fff", bg: "#0d9488" },
  paypal: { label: "PayPal", color: "#fff", bg: "#003087" },
  netbanking: { label: "Net Banking", color: "#fff", bg: "#475569" },
  applepay: { label: "Apple Pay", color: "#fff", bg: "#1c1c1e" },
};

function MethodBadge({ method }: { method?: string }) {
  const key = (method ?? "card").toLowerCase();
  const config = METHOD_CONFIG[key] ?? {
    label: method ?? "Card",
    color: "#fff",
    bg: "#2563EB",
  };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold"
      style={{ background: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  );
}

// ── Status badge ──────────────────────────────────────────────────

const STATUS_CONFIG = {
  [Variant_pending_paid_failed.paid]: {
    label: "Paid",
    class: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 border",
  },
  [Variant_pending_paid_failed.pending]: {
    label: "Pending",
    class: "bg-amber-500/15 text-amber-400 border-amber-500/30 border",
  },
  [Variant_pending_paid_failed.failed]: {
    label: "Failed",
    class: "bg-red-500/15 text-red-400 border-red-500/30 border",
  },
};

function StatusBadge({ status }: { status: Variant_pending_paid_failed }) {
  const cfg =
    STATUS_CONFIG[status] ?? STATUS_CONFIG[Variant_pending_paid_failed.pending];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${cfg.class}`}
    >
      {cfg.label}
    </span>
  );
}

// ── Stats card ────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="card-glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {label}
        </p>
        <div className="p-1.5 rounded-lg bg-primary/10">{icon}</div>
      </div>
      <p className="font-display text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

// ── Filter tabs ───────────────────────────────────────────────────

type FilterType =
  | "all"
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
  | "applepay"
  | "paid"
  | "pending"
  | "failed";

const FILTER_TABS: { id: FilterType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "card", label: "Credit Card" },
  { id: "debit", label: "Debit Card" },
  { id: "international", label: "Intl Card" },
  { id: "phonepe", label: "PhonePe" },
  { id: "googlepay", label: "Google Pay" },
  { id: "paytm", label: "Paytm" },
  { id: "amazonpay", label: "Amazon Pay" },
  { id: "bhimupi", label: "BHIM UPI" },
  { id: "upi", label: "UPI" },
  { id: "qrcode", label: "QR Code" },
  { id: "paypal", label: "PayPal" },
  { id: "netbanking", label: "Net Banking" },
  { id: "applepay", label: "Apple Pay" },
  { id: "paid", label: "Paid" },
  { id: "pending", label: "Pending" },
  { id: "failed", label: "Failed" },
];

const GATEWAY_FILTER_IDS = new Set([
  "card",
  "debit",
  "international",
  "phonepe",
  "googlepay",
  "paytm",
  "amazonpay",
  "bhimupi",
  "upi",
  "qrcode",
  "paypal",
  "netbanking",
  "applepay",
]);

function filterOrders(orders: AnyOrder[], filter: FilterType): AnyOrder[] {
  if (filter === "all") return orders;
  if (GATEWAY_FILTER_IDS.has(filter)) {
    return orders.filter(
      (o) => (o.paymentMethod ?? "card").toLowerCase() === filter,
    );
  }
  if (filter === "paid")
    return orders.filter((o) => o.status === Variant_pending_paid_failed.paid);
  if (filter === "pending")
    return orders.filter(
      (o) => o.status === Variant_pending_paid_failed.pending,
    );
  if (filter === "failed")
    return orders.filter(
      (o) => o.status === Variant_pending_paid_failed.failed,
    );
  return orders;
}

// ── Shorten principal ─────────────────────────────────────────────

function shortenPrincipal(p: string) {
  if (p.length <= 20) return p;
  return `${p.slice(0, 10)}…${p.slice(-6)}`;
}

// ── Main page ─────────────────────────────────────────────────────

export default function TransactionsPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: rawOrders, isLoading: ordersLoading } = useGetAllOrders();

  const [filter, setFilter] = useState<FilterType>("all");

  const orders: AnyOrder[] = ((rawOrders as AnyOrder[]) ?? [])
    .slice()
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

  const filtered = filterOrders(orders, filter);

  // Stats
  const totalRevenue = orders
    .filter((o) => o.status === Variant_pending_paid_failed.paid)
    .reduce((acc, o) => acc + Number(o.totalCents), 0);
  const pendingCount = orders.filter(
    (o) => o.status === Variant_pending_paid_failed.pending,
  ).length;
  const failedCount = orders.filter(
    (o) => o.status === Variant_pending_paid_failed.failed,
  ).length;

  if (!identity) {
    return (
      <div
        data-ocid="transactions.page"
        className="container mx-auto px-4 py-20 text-center max-w-md"
      >
        <ArrowUpDown className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">
          Sign in required
        </h2>
        <p className="text-muted-foreground">
          You need to be signed in to view transactions.
        </p>
      </div>
    );
  }

  if (adminLoading) {
    return (
      <div
        data-ocid="transactions.loading_state"
        className="container mx-auto px-4 py-10 max-w-5xl"
      >
        <Skeleton className="h-8 w-64 mb-6 bg-secondary/50" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((k) => (
            <Skeleton key={k} className="h-28 rounded-xl bg-secondary/50" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl bg-secondary/50" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        data-ocid="transactions.page"
        className="container mx-auto px-4 py-20 text-center max-w-md"
      >
        <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">
          Admin Access Required
        </h2>
        <p className="text-muted-foreground mb-6">
          The Transactions dashboard is only accessible to admins. Update your
          account type in your profile.
        </p>
        <Link to="/profile">
          <Button
            data-ocid="transactions.profile.link"
            className="bg-primary text-primary-foreground"
          >
            Go to Profile
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      data-ocid="transactions.page"
      className="container mx-auto px-4 py-10 sm:px-6 max-w-6xl"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-primary/10">
            <ArrowUpDown className="h-5 w-5 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold">Transactions</h1>
        </div>
        <p className="text-muted-foreground ml-12">
          Payment history across all users
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Revenue"
          value={`$${(totalRevenue / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-4 w-4 text-primary" />}
          sub="From paid orders"
        />
        <StatCard
          label="Total Orders"
          value={orders.length.toString()}
          icon={<ShoppingBag className="h-4 w-4 text-primary" />}
          sub="All time"
        />
        <StatCard
          label="Pending"
          value={pendingCount.toString()}
          icon={<Loader2 className="h-4 w-4 text-amber-400" />}
          sub="Awaiting confirmation"
        />
        <StatCard
          label="Failed"
          value={failedCount.toString()}
          icon={<XCircle className="h-4 w-4 text-destructive" />}
          sub="Requires attention"
        />
      </div>

      {/* Filter bar */}
      <div
        data-ocid="transactions.filter.list"
        className="flex flex-wrap gap-2 mb-6"
      >
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            data-ocid="transactions.filter.tab"
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === tab.id
                ? "bg-primary text-primary-foreground shadow-glow-sm"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.id === "all" && (
              <span className="ml-1.5 opacity-60">{orders.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      {ordersLoading ? (
        <div data-ocid="transactions.loading_state" className="space-y-3">
          {[1, 2, 3, 4, 5].map((k) => (
            <Skeleton
              key={k}
              className="h-14 w-full rounded-xl bg-secondary/50"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="transactions.empty_state"
          className="card-glass rounded-xl py-20 text-center"
        >
          <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold mb-2">
            No transactions found
          </h3>
          <p className="text-muted-foreground text-sm">
            {filter === "all"
              ? "No orders have been placed yet."
              : `No transactions match the "${FILTER_TABS.find((t) => t.id === filter)?.label}" filter.`}
          </p>
        </div>
      ) : (
        <div className="card-glass rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs font-semibold">
                  Order ID
                </TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">
                  Method
                </TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">
                  Status
                </TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">
                  Amount
                </TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold hidden md:table-cell">
                  Date
                </TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold hidden lg:table-cell">
                  Buyer
                </TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold hidden md:table-cell">
                  Items
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order, i) => {
                const date = new Date(
                  Number(order.createdAt) / 1_000_000,
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });
                const amount = (Number(order.totalCents) / 100).toFixed(2);

                return (
                  <TableRow
                    key={order.id.toString()}
                    data-ocid={`transactions.order.item.${i + 1}`}
                    className="border-border hover:bg-secondary/20 transition-colors"
                  >
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">
                        #{order.id.toString().slice(0, 12)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <MethodBadge method={order.paymentMethod} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-semibold text-primary text-sm">
                        ${amount}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                      {date}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="font-mono text-xs text-muted-foreground">
                        {shortenPrincipal(order.buyer.toString())}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant="outline"
                        className="text-xs border-border text-muted-foreground"
                      >
                        {order.productIds.length}{" "}
                        {order.productIds.length === 1 ? "item" : "items"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
