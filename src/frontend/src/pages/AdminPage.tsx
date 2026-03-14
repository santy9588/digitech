import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Loader2,
  Package,
  PackagePlus,
  Settings,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import LoginPrompt from "../components/LoginPrompt";
import StatusBadge from "../components/StatusBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useLocalProducts } from "../hooks/useLocalProducts";
import {
  useAllOrders,
  useIsAdmin,
  useProducts,
  useSetStripeConfiguration,
} from "../hooks/useQueries";
import { formatDate, formatPrice, truncatePrincipal } from "../utils/format";

function StatsCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="price-display text-2xl font-bold text-foreground">
            {value}
          </p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const {
    data: orders,
    isLoading: ordersLoading,
    isError: ordersError,
  } = useAllOrders();
  const { mutate: setStripeConfig, isPending: isSavingStripe } =
    useSetStripeConfiguration();
  const { data: backendProducts, isLoading: productsLoading } = useProducts();
  const { locallyAdded, locallyDeleted, addProduct, deleteProduct } =
    useLocalProducts();

  // Stripe config form state
  const [secretKey, setSecretKey] = useState("");
  const [countries, setCountries] = useState("");
  const [stripeSuccess, setStripeSuccess] = useState(false);

  // Add product form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCurrency, setProductCurrency] = useState("usd");
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  if (!isAuthenticated) {
    return (
      <LoginPrompt
        title="Admin access required"
        description="Sign in with an admin account to access the admin panel."
      />
    );
  }

  if (isAdminLoading) {
    return (
      <div className="container py-14 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-24 flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 ring-1 ring-destructive/20">
          <ShieldCheck className="h-6 w-6 text-destructive" />
        </div>
        <h2 className="font-display text-xl font-semibold text-foreground">
          Access Denied
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          You don't have admin privileges for this application.
        </p>
      </div>
    );
  }

  const totalRevenue = orders
    ? orders.reduce(
        (sum, o) => sum + (o.status === "succeeded" ? o.amount : 0n),
        0n,
      )
    : 0n;

  const succeededOrders =
    orders?.filter((o) => o.status === "succeeded").length ?? 0;
  const pendingOrders =
    orders?.filter((o) => o.status === "pending").length ?? 0;

  // Merged product list: backend + locally added, minus locally deleted
  const allProducts = [...(backendProducts ?? []), ...locallyAdded].filter(
    (p) => !locallyDeleted.has(p.id),
  );

  const handleStripeSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!secretKey.trim()) {
      toast.error("Please enter a Stripe secret key.");
      return;
    }
    setStripeSuccess(false);

    const allowedCountries = countries
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);

    setStripeConfig(
      { secretKey: secretKey.trim(), allowedCountries },
      {
        onSuccess: () => {
          toast.success("Stripe configuration saved successfully.");
          setStripeSuccess(true);
          setSecretKey("");
        },
        onError: (error) => {
          toast.error("Failed to save Stripe configuration.", {
            description:
              error instanceof Error ? error.message : "Unknown error",
          });
        },
      },
    );
  };

  const handleAddProductSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      toast.error("Product name is required.");
      return;
    }
    if (!productDescription.trim()) {
      toast.error("Product description is required.");
      return;
    }
    const priceNum = Number.parseFloat(productPrice);
    if (!productPrice || Number.isNaN(priceNum) || priceNum < 0.01) {
      toast.error("Please enter a valid price (minimum $0.01).");
      return;
    }

    setIsAddingProduct(true);
    const newProduct = {
      id: `prod_${Date.now()}`,
      name: productName.trim(),
      description: productDescription.trim(),
      currency: productCurrency,
      priceInCents: BigInt(Math.round(priceNum * 100)),
    };

    addProduct(newProduct);
    toast.success(`"${newProduct.name}" added successfully.`);

    // Reset form
    setProductName("");
    setProductDescription("");
    setProductPrice("");
    setProductCurrency("usd");
    setShowAddForm(false);
    setIsAddingProduct(false);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    deleteProduct(id);
    toast.success(`"${name}" removed from product listings.`);
  };

  return (
    <div className="container py-10 sm:py-14 space-y-10">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Admin Dashboard
          </h1>
        </div>
        <p className="text-sm text-muted-foreground ml-12">
          Manage products, orders, and payment settings.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.4, ease: "easeOut" }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <StatsCard
          icon={CreditCard}
          label="Total Orders"
          value={orders?.length ?? "—"}
          sub="All time"
        />
        <StatsCard
          icon={CheckCircle2}
          label="Succeeded"
          value={succeededOrders}
          sub={pendingOrders > 0 ? `${pendingOrders} pending` : undefined}
        />
        <StatsCard
          icon={Users}
          label="Total Revenue"
          value={
            orders && orders.length > 0
              ? formatPrice(totalRevenue, orders[0]?.currency ?? "usd")
              : "$0.00"
          }
          sub="Completed payments"
        />
      </motion.div>

      {/* Tabbed admin sections */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, duration: 0.4, ease: "easeOut" }}
      >
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-card border border-border h-auto p-1 gap-1">
            <TabsTrigger
              value="products"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-ocid="admin.products_tab"
            >
              <Package className="h-3.5 w-3.5" />
              Products
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-ocid="admin.orders_tab"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-ocid="admin.settings_tab"
            >
              <Settings className="h-3.5 w-3.5" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* ── Products Tab ── */}
          <TabsContent value="products" className="space-y-6 mt-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Product Listings
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Browse, upload, and manage your products.
                </p>
              </div>
              <Button
                onClick={() => setShowAddForm((v) => !v)}
                variant={showAddForm ? "outline" : "default"}
                size="sm"
                className="gap-2 shrink-0"
                data-ocid="admin.add_product_form"
              >
                <PackagePlus className="h-3.5 w-3.5" />
                {showAddForm ? "Cancel" : "Add Product"}
              </Button>
            </div>

            {/* Add Product Form */}
            {showAddForm && (
              <motion.form
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleAddProductSubmit}
                className="rounded-xl border border-primary/30 bg-card p-6 space-y-4"
                data-ocid="admin.add_product_form"
              >
                <div className="flex items-center gap-2 mb-2">
                  <PackagePlus className="h-4 w-4 text-primary" />
                  <h3 className="font-display text-sm font-semibold text-foreground">
                    New Product
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="product-name"
                      className="text-sm font-medium text-foreground"
                    >
                      Product Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="product-name"
                      type="text"
                      placeholder="e.g. Cloud Storage Pro"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      required
                      className="bg-input border-border/60 focus:border-primary/60 focus:ring-primary/20 text-sm"
                      data-ocid="admin.product_name_input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label
                        htmlFor="product-price"
                        className="text-sm font-medium text-foreground"
                      >
                        Price <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="product-price"
                        type="number"
                        placeholder="9.99"
                        min="0.01"
                        step="0.01"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        required
                        className="bg-input border-border/60 focus:border-primary/60 focus:ring-primary/20 text-sm font-mono"
                        data-ocid="admin.product_price_input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="product-currency"
                        className="text-sm font-medium text-foreground"
                      >
                        Currency
                      </Label>
                      <Select
                        value={productCurrency}
                        onValueChange={setProductCurrency}
                      >
                        <SelectTrigger
                          id="product-currency"
                          className="bg-input border-border/60 text-sm"
                          data-ocid="admin.product_currency_select"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="usd">USD ($)</SelectItem>
                          <SelectItem value="eur">EUR (€)</SelectItem>
                          <SelectItem value="gbp">GBP (£)</SelectItem>
                          <SelectItem value="inr">INR (₹)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="product-description"
                    className="text-sm font-medium text-foreground"
                  >
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="product-description"
                    placeholder="Describe what's included in this product or plan…"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    required
                    rows={3}
                    className="bg-input border-border/60 focus:border-primary/60 focus:ring-primary/20 text-sm resize-none"
                    data-ocid="admin.product_description_textarea"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                    className="text-muted-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isAddingProduct}
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                    data-ocid="admin.product_submit_button"
                  >
                    {isAddingProduct ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Adding…
                      </>
                    ) : (
                      <>
                        <PackagePlus className="h-3.5 w-3.5" />
                        Add Product
                      </>
                    )}
                  </Button>
                </div>
              </motion.form>
            )}

            {/* Products Table */}
            <div className="rounded-xl border border-border overflow-hidden">
              <Table data-ocid="admin.products_table">
                <TableHeader>
                  <TableRow className="border-border/60 bg-card/80 hover:bg-card/80">
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium">
                      Name
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium w-28">
                      Price
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium w-20">
                      Currency
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium">
                      Description
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium w-16 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsLoading &&
                    (["sk1", "sk2", "sk3"] as const).map((k, _i) => (
                      <TableRow key={k} className="border-border/40">
                        <TableCell>
                          <Skeleton className="h-3.5 w-32 bg-muted/50" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-3.5 w-16 bg-muted/50" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-3.5 w-12 bg-muted/50" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-3.5 w-full bg-muted/50" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-7 w-7 bg-muted/50 rounded ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))}

                  {!productsLoading &&
                    allProducts.map((product, i) => (
                      <TableRow
                        key={product.id}
                        className="border-border/40 hover:bg-card/60 transition-colors"
                        data-ocid={`admin.products.row.${i + 1}`}
                      >
                        <TableCell className="font-medium text-sm text-foreground">
                          {product.name}
                        </TableCell>
                        <TableCell className="price-display text-sm font-semibold text-foreground">
                          {formatPrice(product.priceInCents, product.currency)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground uppercase">
                          {product.currency}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[280px] truncate">
                          {product.description}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            onClick={() =>
                              handleDeleteProduct(product.id, product.name)
                            }
                            title={`Remove ${product.name}`}
                            data-ocid={`admin.product_delete_button.${i + 1}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>

              {!productsLoading && allProducts.length === 0 && (
                <div
                  className="flex flex-col items-center gap-4 py-12 text-center"
                  data-ocid="admin.products.empty_state"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted ring-1 ring-border">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      No products yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Click "Add Product" to create your first listing.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Orders Tab ── */}
          <TabsContent value="orders" className="space-y-4 mt-0">
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">
                All Orders
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Complete order history across all users.
              </p>
            </div>

            {ordersError && (
              <div
                className="flex flex-col items-center gap-4 py-12 text-center"
                data-ocid="admin.orders_table"
              >
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-muted-foreground">
                  Failed to load orders. Please refresh.
                </p>
              </div>
            )}

            {!ordersError && (
              <div className="rounded-xl border border-border overflow-hidden">
                <Table data-ocid="admin.orders_table">
                  <TableHeader>
                    <TableRow className="border-border/60 bg-card/80 hover:bg-card/80">
                      <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium w-20">
                        ID
                      </TableHead>
                      <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium">
                        User
                      </TableHead>
                      <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium">
                        Product
                      </TableHead>
                      <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium">
                        Amount
                      </TableHead>
                      <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium">
                        Status
                      </TableHead>
                      <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium">
                        Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersLoading &&
                      (["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"] as const).map(
                        (k, i) => (
                          <TableRow
                            key={k}
                            className="border-border/40"
                            data-ocid={`orders.row.${i + 1}`}
                          >
                            <TableCell>
                              <Skeleton className="h-3.5 w-10 bg-muted/50" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-3.5 w-28 bg-muted/50" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-3.5 w-20 bg-muted/50" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-3.5 w-16 bg-muted/50" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-5 w-20 rounded-full bg-muted/50" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-3.5 w-20 bg-muted/50" />
                            </TableCell>
                          </TableRow>
                        ),
                      )}

                    {!ordersLoading &&
                      orders?.map((order, i) => (
                        <TableRow
                          key={order.id.toString()}
                          className="border-border/40 hover:bg-card/60 transition-colors"
                          data-ocid={`orders.row.${i + 1}`}
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            #{order.id.toString().padStart(4, "0")}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground max-w-[180px] truncate">
                            {truncatePrincipal(order.userId.toString())}
                          </TableCell>
                          <TableCell className="text-sm font-medium text-foreground">
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

                {!ordersLoading && (!orders || orders.length === 0) && (
                  <div className="flex flex-col items-center gap-4 py-12 text-center">
                    <p className="text-sm text-muted-foreground">
                      No orders found.
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* ── Settings Tab ── */}
          <TabsContent value="settings" className="mt-0">
            <div className="max-w-xl space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Settings className="h-4 w-4 text-primary" />
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Stripe Configuration
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  Configure your Stripe integration for payment processing.
                </p>
              </div>

              <form
                onSubmit={handleStripeSubmit}
                className="space-y-4 rounded-xl border border-border bg-card p-6"
                data-ocid="admin.stripe_config_form"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="secret-key"
                    className="text-sm font-medium text-foreground"
                  >
                    Stripe Secret Key
                  </Label>
                  <Input
                    id="secret-key"
                    type="password"
                    placeholder="sk_live_… or sk_test_…"
                    value={secretKey}
                    onChange={(e) => {
                      setSecretKey(e.target.value);
                      setStripeSuccess(false);
                    }}
                    className="font-mono text-sm bg-input border-border/60 focus:border-primary/60 focus:ring-primary/20"
                    autoComplete="off"
                    data-ocid="admin.secret_key_input"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Stripe secret key from the Dashboard. Never share this
                    publicly.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="countries"
                    className="text-sm font-medium text-foreground"
                  >
                    Allowed Countries{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="countries"
                    type="text"
                    placeholder="US, CA, GB, AU"
                    value={countries}
                    onChange={(e) => setCountries(e.target.value)}
                    className="text-sm bg-input border-border/60 focus:border-primary/60 focus:ring-primary/20"
                    data-ocid="admin.countries_input"
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated ISO 3166-1 alpha-2 country codes. Leave
                    empty to allow all countries.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <Button
                    type="submit"
                    disabled={isSavingStripe}
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                    data-ocid="admin.stripe_config_submit_button"
                  >
                    {isSavingStripe ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Settings className="h-3.5 w-3.5" />
                        Save Configuration
                      </>
                    )}
                  </Button>
                  {stripeSuccess && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-1.5 text-xs font-medium text-success"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Saved!
                    </motion.div>
                  )}
                </div>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
