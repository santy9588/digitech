import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, ShoppingCart, Tag, User } from "lucide-react";
import { toast } from "sonner";
import ProductCard from "../components/ProductCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddToCart,
  useGetProduct,
  useGetProductsByCategory,
} from "../hooks/useQueries";
import { CATEGORY_META } from "../lib/categoryMeta";

export default function ProductDetailPage() {
  const { id } = useParams({ from: "/layout/product/$id" });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: product, isLoading } = useGetProduct(id);
  const { data: relatedProducts } = useGetProductsByCategory(
    product?.category ?? "",
  );
  const addToCart = useAddToCart();

  const meta = product
    ? (CATEGORY_META[product.category] ?? CATEGORY_META.Other)
    : null;
  const price = product
    ? (Number(product.priceCents) / 100).toFixed(2)
    : "0.00";
  const thumbnailUrl = product?.thumbnail.getDirectURL() ?? "";

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to your cart");
      return;
    }
    if (!product) return;
    try {
      await addToCart.mutateAsync(product.id);
      toast.success(`"${product.title}" added to cart`);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in first");
      return;
    }
    if (!product) return;
    await addToCart.mutateAsync(product.id);
    navigate({ to: "/cart" });
  };

  const related = relatedProducts?.filter((p) => p.id !== id).slice(0, 4) ?? [];

  if (isLoading) {
    return (
      <div
        data-ocid="product-detail.loading_state"
        className="container mx-auto px-4 py-10 sm:px-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <Skeleton className="aspect-video w-full rounded-2xl bg-secondary/50" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4 bg-secondary/50" />
            <Skeleton className="h-4 w-full bg-secondary/50" />
            <Skeleton className="h-4 w-5/6 bg-secondary/50" />
            <Skeleton className="h-12 w-48 bg-secondary/50" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        data-ocid="product-detail.error_state"
        className="container mx-auto px-4 py-20 text-center"
      >
        <div className="text-5xl mb-4">📦</div>
        <h2 className="font-display text-2xl font-bold mb-2">
          Product not found
        </h2>
        <p className="text-muted-foreground mb-6">
          This product may have been removed or doesn't exist.
        </p>
        <Link to="/catalog">
          <Button
            data-ocid="product-detail.back.button"
            className="bg-primary text-primary-foreground"
          >
            Back to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto px-4 py-10 sm:px-6"
      data-ocid="product-detail.page"
    >
      {/* Back */}
      <button
        type="button"
        data-ocid="product-detail.back.button"
        onClick={() => navigate({ to: "/catalog" })}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Catalog
      </button>

      {/* Main */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {/* Thumbnail */}
        <div className="relative rounded-2xl overflow-hidden aspect-video card-glass">
          <img
            src={thumbnailUrl || meta?.fallbackImage}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const t = e.target as HTMLImageElement;
              t.src = meta?.fallbackImage ?? "";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/30 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Details */}
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              {meta && (
                <Badge
                  className="mb-2 text-xs"
                  style={{ background: meta.color, color: "#fff" }}
                >
                  {meta.icon} {product.category}
                </Badge>
              )}
              <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
                {product.title}
              </h1>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              {product.category}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {product.seller.toString().slice(0, 16)}…
            </span>
          </div>

          {/* Price & Actions */}
          <div className="rounded-xl p-5 surface-elevated space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Price
              </p>
              <p className="font-display text-4xl font-bold text-gradient-cyan">
                ${price}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                data-ocid="product-detail.cart.button"
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
                variant="outline"
                className="flex-1 gap-2 border-primary/30 text-primary hover:bg-primary/10"
              >
                {addToCart.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingCart className="h-4 w-4" />
                )}
                Add to Cart
              </Button>
              <Button
                data-ocid="product-detail.buy.primary_button"
                onClick={handleBuyNow}
                disabled={addToCart.isPending}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold mb-6">
            More in {product.category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
