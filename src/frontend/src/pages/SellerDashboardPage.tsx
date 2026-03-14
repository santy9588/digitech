import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import {
  DollarSign,
  Edit,
  Loader2,
  Package,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob, type Product } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddProduct,
  useDeleteProduct,
  useGetProductsBySeller,
  useUpdateProduct,
} from "../hooks/useQueries";
import { useGetCallerUserProfile } from "../hooks/useQueries";
import { CATEGORIES, CATEGORY_META } from "../lib/categoryMeta";

type ProductFormData = {
  title: string;
  description: string;
  category: string;
  priceCents: string;
  thumbnailFile: File | null;
  productFile: File | null;
};

const EMPTY_FORM: ProductFormData = {
  title: "",
  description: "",
  category: "",
  priceCents: "",
  thumbnailFile: null,
  productFile: null,
};

interface UploadProgressState {
  thumbnail: number;
  file: number;
}

export default function SellerDashboardPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  useGetCallerUserProfile();

  const { data: products, isLoading } = useGetProductsBySeller();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressState>({
    thumbnail: 0,
    file: 0,
  });
  const [isUploading, setIsUploading] = useState(false);

  if (!isAuthenticated) {
    return (
      <div
        data-ocid="seller.page"
        className="container mx-auto px-4 py-20 text-center max-w-md"
      >
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">
          Sign in to access your dashboard
        </h2>
        <p className="text-muted-foreground mb-4">
          You need to be signed in to sell products.
        </p>
      </div>
    );
  }

  const openAddDialog = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setForm({
      title: product.title,
      description: product.description,
      category: product.category,
      priceCents: (Number(product.priceCents) / 100).toFixed(2),
      thumbnailFile: null,
      productFile: null,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.category || !form.priceCents) {
      toast.error("Please fill in all required fields");
      return;
    }

    const priceCents = Math.round(Number.parseFloat(form.priceCents) * 100);
    if (Number.isNaN(priceCents) || priceCents <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setIsUploading(true);
    try {
      let thumbnailBlob: ExternalBlob;
      let fileBlob: ExternalBlob;

      if (editingProduct) {
        // Editing - use existing blobs if no new files uploaded
        thumbnailBlob = form.thumbnailFile
          ? await uploadFile(form.thumbnailFile, (p) =>
              setUploadProgress((prev) => ({ ...prev, thumbnail: p })),
            )
          : editingProduct.thumbnail;

        fileBlob = form.productFile
          ? await uploadFile(form.productFile, (p) =>
              setUploadProgress((prev) => ({ ...prev, file: p })),
            )
          : editingProduct.file;
      } else {
        // New product - both required
        if (!form.thumbnailFile || !form.productFile) {
          toast.error("Please upload both a thumbnail and the product file");
          setIsUploading(false);
          return;
        }
        [thumbnailBlob, fileBlob] = await Promise.all([
          uploadFile(form.thumbnailFile, (p) =>
            setUploadProgress((prev) => ({ ...prev, thumbnail: p })),
          ),
          uploadFile(form.productFile, (p) =>
            setUploadProgress((prev) => ({ ...prev, file: p })),
          ),
        ]);
      }

      if (editingProduct) {
        await updateProduct.mutateAsync({
          ...editingProduct,
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          priceCents: BigInt(priceCents),
          thumbnail: thumbnailBlob,
          file: fileBlob,
        });
        toast.success("Product updated!");
      } else {
        await addProduct.mutateAsync({
          id: crypto.randomUUID(),
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          priceCents: BigInt(priceCents),
          thumbnail: thumbnailBlob,
          file: fileBlob,
          active: true,
          createdAt: BigInt(Date.now()) * BigInt(1_000_000),
          seller: identity!.getPrincipal(),
        });
        toast.success("Product added successfully!");
      }

      setDialogOpen(false);
      setForm(EMPTY_FORM);
      setUploadProgress({ thumbnail: 0, file: 0 });
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save product",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct.mutateAsync(productId);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const totalRevenue =
    products?.reduce((acc, p) => acc + Number(p.priceCents), 0) ?? 0;

  return (
    <div
      data-ocid="seller.page"
      className="container mx-auto px-4 py-10 sm:px-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Seller Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your digital products and track performance
          </p>
        </div>
        <Button
          data-ocid="seller.add-product.open_modal_button"
          onClick={openAddDialog}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl p-5 surface-elevated">
          <p className="text-sm text-muted-foreground mb-1">Total Products</p>
          <p className="font-display text-3xl font-bold text-foreground">
            {products?.length ?? 0}
          </p>
        </div>
        <div className="rounded-xl p-5 surface-elevated">
          <p className="text-sm text-muted-foreground mb-1">Active Listings</p>
          <p className="font-display text-3xl font-bold text-primary">
            {products?.filter((p) => p.active).length ?? 0}
          </p>
        </div>
        <div className="rounded-xl p-5 surface-elevated">
          <p className="text-sm text-muted-foreground mb-1">
            Total Catalog Value
          </p>
          <p className="font-display text-3xl font-bold text-gradient-cyan">
            ${(totalRevenue / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Products List */}
      {isLoading ? (
        <div data-ocid="seller.products.loading_state" className="space-y-3">
          {["a", "b", "c"].map((k) => (
            <Skeleton
              key={k}
              className="h-24 w-full rounded-xl bg-secondary/50"
            />
          ))}
        </div>
      ) : (products?.length ?? 0) === 0 ? (
        <div
          data-ocid="seller.products.empty_state"
          className="text-center py-16 card-glass rounded-xl"
        >
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold mb-2">
            No products yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Upload your first digital product to start selling.
          </p>
          <Button
            data-ocid="seller.first-product.open_modal_button"
            onClick={openAddDialog}
            className="gap-2 bg-primary text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            Add Your First Product
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {products!.map((product, i) => {
            const meta = CATEGORY_META[product.category] ?? CATEGORY_META.Other;
            const price = (Number(product.priceCents) / 100).toFixed(2);
            const thumbnailUrl = product.thumbnail.getDirectURL();

            return (
              <div
                key={product.id}
                data-ocid={`seller.product.item.${i + 1}`}
                className="flex items-center gap-4 p-4 card-glass rounded-xl hover:border-primary/20 transition-colors"
              >
                <img
                  src={thumbnailUrl || meta.fallbackImage}
                  alt={product.title}
                  className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => {
                    const t = e.target as HTMLImageElement;
                    t.src = meta.fallbackImage;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-semibold text-sm truncate">
                      {product.title}
                    </h3>
                    <Badge
                      className="text-xs flex-shrink-0"
                      style={{ background: meta.color, color: "#fff" }}
                    >
                      {product.category}
                    </Badge>
                    {!product.active && (
                      <Badge
                        variant="secondary"
                        className="text-xs flex-shrink-0"
                      >
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {product.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-mono font-bold text-primary text-sm hidden sm:block">
                    ${price}
                  </span>
                  <Button
                    data-ocid={`seller.product.edit_button.${i + 1}`}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => openEditDialog(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        data-ocid={`seller.product.delete_button.${i + 1}`}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent
                      data-ocid="seller.delete.dialog"
                      className="bg-card border-border"
                    >
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{product.title}"?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          data-ocid="seller.delete.cancel_button"
                          className="border-border"
                        >
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          data-ocid="seller.delete.confirm_button"
                          onClick={() => handleDelete(product.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          data-ocid="seller.product-form.modal"
          className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="prod-title">Title *</Label>
              <Input
                id="prod-title"
                data-ocid="seller.product-form.title.input"
                placeholder="e.g. Complete Web Design Course"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="bg-secondary/50 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prod-desc">Description *</Label>
              <Textarea
                id="prod-desc"
                data-ocid="seller.product-form.description.textarea"
                placeholder="Describe your product…"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="bg-secondary/50 border-border min-h-[80px] resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prod-category">Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger
                    id="prod-category"
                    data-ocid="seller.product-form.category.select"
                    className="bg-secondary/50 border-border"
                  >
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {CATEGORY_META[cat].icon} {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prod-price">Price (USD) *</Label>
                <Input
                  id="prod-price"
                  data-ocid="seller.product-form.price.input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="9.99"
                  value={form.priceCents}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, priceCents: e.target.value }))
                  }
                  className="bg-secondary/50 border-border"
                />
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <Label>Thumbnail Image {!editingProduct && "*"}</Label>
              <label
                data-ocid="seller.product-form.thumbnail.upload_button"
                className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/40 hover:bg-secondary/30 transition-colors"
              >
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {form.thumbnailFile
                    ? form.thumbnailFile.name
                    : editingProduct
                      ? "Upload new thumbnail (optional)"
                      : "Click to upload thumbnail"}
                </span>
                {uploadProgress.thumbnail > 0 &&
                  uploadProgress.thumbnail < 100 && (
                    <div className="w-full bg-secondary/50 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all"
                        style={{ width: `${uploadProgress.thumbnail}%` }}
                      />
                    </div>
                  )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setForm((f) => ({ ...f, thumbnailFile: file }));
                  }}
                />
              </label>
            </div>

            {/* Product File Upload */}
            <div className="space-y-2">
              <Label>Product File {!editingProduct && "*"}</Label>
              <label
                data-ocid="seller.product-form.file.upload_button"
                className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/40 hover:bg-secondary/30 transition-colors"
              >
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {form.productFile
                    ? form.productFile.name
                    : editingProduct
                      ? "Upload new file (optional)"
                      : "Click to upload your digital product"}
                </span>
                {uploadProgress.file > 0 && uploadProgress.file < 100 && (
                  <div className="w-full bg-secondary/50 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${uploadProgress.file}%` }}
                    />
                  </div>
                )}
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setForm((f) => ({ ...f, productFile: file }));
                  }}
                />
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              data-ocid="seller.product-form.cancel_button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isUploading}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              data-ocid="seller.product-form.submit_button"
              onClick={handleSubmit}
              disabled={
                isUploading || addProduct.isPending || updateProduct.isPending
              }
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading…
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
    </div>
  );
}

async function uploadFile(
  file: File,
  onProgress: (p: number) => void,
): Promise<ExternalBlob> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  return ExternalBlob.fromBytes(bytes).withUploadProgress(onProgress);
}
