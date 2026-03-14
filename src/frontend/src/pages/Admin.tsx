import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  type Order,
  type OrderStatus,
  type Product,
  type ProductCategory,
  addProduct,
  deleteProduct,
  getAllOrders,
  getProducts,
  markOrderPaid,
  updateProduct,
} from "@/services/backend";
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  LogIn,
  Package,
  Pencil,
  Plus,
  Settings,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Page =
  | "home"
  | "products"
  | "orders"
  | "admin"
  | "product-detail"
  | "success";

interface AdminProps {
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
  });
}

const CATEGORIES: ProductCategory[] = [
  "Subscription",
  "Software",
  "Analytics",
  "Storage",
  "API",
  "Marketing",
];

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: ProductCategory;
  imageUrl: string;
  features: string;
}

const EMPTY_FORM: ProductFormData = {
  name: "",
  description: "",
  price: "",
  category: "Software",
  imageUrl: "",
  features: "",
};

export function Admin({ onNavigate: _onNavigate }: AdminProps) {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isLoggedIn = !!identity;

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Add/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    Promise.all([
      getProducts().then((data) => {
        setProducts(data);
        setLoadingProducts(false);
      }),
      getAllOrders().then((data) => {
        setOrders(data);
        setLoadingOrders(false);
      }),
    ]);
  }, [isLoggedIn]);

  const openAddDialog = () => {
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      imageUrl: product.imageUrl,
      features: product.features.join("\n"),
    });
    setDialogOpen(true);
  };

  const handleFormSubmit = async () => {
    if (!formData.name || !formData.price) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setFormLoading(true);
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        category: formData.category,
        imageUrl:
          formData.imageUrl ||
          "/assets/generated/product-pro-plan.dim_400x300.jpg",
        features: formData.features
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
        popular: false,
      };

      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, productData);
        if (updated) {
          setProducts((prev) =>
            prev.map((p) => (p.id === editingProduct.id ? updated : p)),
          );
          toast.success("Product updated successfully");
        }
      } else {
        const newProduct = await addProduct(productData);
        setProducts((prev) => [newProduct, ...prev]);
        toast.success("Product added successfully");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      await deleteProduct(deleteConfirm.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteConfirm.id));
      toast.success(`"${deleteConfirm.name}" deleted`);
      setDeleteConfirm(null);
    } catch {
      toast.error("Failed to delete product.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleMarkPaid = async (orderId: string) => {
    try {
      const updated = await markOrderPaid(orderId);
      if (updated) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
        toast.success("Order marked as paid");
      }
    } catch {
      toast.error("Failed to update order status.");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-secondary flex items-center justify-center mb-6">
            <Settings className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="font-display font-bold text-2xl text-foreground mb-2">
            Admin Access Required
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Sign in to access the admin panel and manage products and orders.
          </p>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            data-ocid="admin.login_button"
            className="bg-primary text-primary-foreground"
          >
            <LogIn className="w-4 h-4 mr-2" />
            {isLoggingIn ? "Connecting..." : "Sign In to Admin"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-primary text-sm font-medium font-mono mb-2">
              — ADMIN PANEL
            </p>
            <h1 className="font-display font-bold text-4xl text-foreground">
              Management
            </h1>
          </div>
          <Button
            onClick={openAddDialog}
            data-ocid="admin.add_product_button"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        <Tabs defaultValue="products">
          <TabsList className="bg-secondary mb-6">
            <TabsTrigger
              value="products"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Package className="w-4 h-4 mr-2" />
              Products ({products.length})
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Orders ({orders.length})
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            {loadingProducts ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border border-border overflow-hidden"
              >
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">
                        Product
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Category
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Price
                      </TableHead>
                      <TableHead className="text-muted-foreground text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product, idx) => (
                      <TableRow
                        key={product.id}
                        className="border-border hover:bg-secondary/50"
                        data-ocid={`admin.product.item.${idx + 1}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium text-foreground text-sm">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md">
                            {product.category}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-display font-semibold text-foreground">
                            ${product.price.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(product)}
                              data-ocid={`admin.product.edit_button.${idx + 1}`}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirm(product)}
                              data-ocid={`admin.product.delete_button.${idx + 1}`}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </motion.div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            {loadingOrders ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No orders found.</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border border-border overflow-hidden"
              >
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">
                        Order ID
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Product
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Amount
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Status
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Date
                      </TableHead>
                      <TableHead className="text-muted-foreground text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order, idx) => (
                      <TableRow
                        key={order.id}
                        className="border-border hover:bg-secondary/50"
                        data-ocid={`admin.orders.item.${idx + 1}`}
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
                        <TableCell className="text-right">
                          {order.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkPaid(order.id)}
                              className="text-[oklch(0.72_0.17_150)] hover:text-[oklch(0.72_0.17_150)] text-xs"
                            >
                              <CheckCircle className="w-3.5 h-3.5 mr-1" />
                              Mark Paid
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="bg-card border-border max-w-lg"
          data-ocid="admin.add_product.modal"
        >
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="product-name" className="text-sm font-medium">
                Product Name *
              </Label>
              <Input
                id="product-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Professional SEO Suite"
                className="bg-secondary border-border"
                data-ocid="admin.add_product.name_input"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="product-description"
                className="text-sm font-medium"
              >
                Description
              </Label>
              <Textarea
                id="product-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe your product..."
                rows={3}
                className="bg-secondary border-border resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="product-price" className="text-sm font-medium">
                  Price (USD) *
                </Label>
                <Input
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: e.target.value }))
                  }
                  placeholder="29.99"
                  className="bg-secondary border-border"
                  data-ocid="admin.add_product.price_input"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: v as ProductCategory,
                    }))
                  }
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="product-image" className="text-sm font-medium">
                Image URL
              </Label>
              <Input
                id="product-image"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
                }
                placeholder="https://example.com/image.jpg"
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="product-features" className="text-sm font-medium">
                Features (one per line)
              </Label>
              <Textarea
                id="product-features"
                value={formData.features}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, features: e.target.value }))
                }
                placeholder={
                  "Unlimited API calls\nPriority support\nAdvanced analytics"
                }
                rows={4}
                className="bg-secondary border-border resize-none font-mono text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="admin.add_product.cancel_button"
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              onClick={handleFormSubmit}
              disabled={formLoading}
              data-ocid="admin.add_product.submit_button"
              className="bg-primary text-primary-foreground"
            >
              {formLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingProduct ? (
                "Save Changes"
              ) : (
                "Add Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Product
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete{" "}
            <span className="text-foreground font-medium">
              "{deleteConfirm?.name}"
            </span>
            ? This action cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={deleteLoading}
              data-ocid="admin.add_product.cancel_button"
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
