import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCart,
  useGetProduct,
  useRemoveFromCart,
} from "../hooks/useQueries";
import { CATEGORY_META } from "../lib/categoryMeta";

function CartItem({
  productId,
  index,
  onRemove,
}: {
  productId: string;
  index: number;
  onRemove: (id: string) => void;
}) {
  const { data: product, isLoading } = useGetProduct(productId);
  const meta = product
    ? (CATEGORY_META[product.category] ?? CATEGORY_META.Other)
    : null;

  if (isLoading) {
    return (
      <div className="flex gap-4 p-4 card-glass rounded-xl animate-pulse">
        <Skeleton className="w-24 h-16 rounded-lg bg-secondary/50 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3 bg-secondary/50" />
          <Skeleton className="h-3 w-1/3 bg-secondary/50" />
        </div>
      </div>
    );
  }

  if (!product) return null;

  const price = (Number(product.priceCents) / 100).toFixed(2);
  const thumbnailUrl = product.thumbnail.getDirectURL();

  return (
    <div
      data-ocid={`cart.item.${index}`}
      className="flex gap-4 p-4 card-glass rounded-xl hover:border-primary/20 transition-colors"
    >
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="flex-shrink-0"
      >
        <img
          src={thumbnailUrl || meta?.fallbackImage}
          alt={product.title}
          className="w-24 h-16 object-cover rounded-lg"
          onError={(e) => {
            const t = e.target as HTMLImageElement;
            t.src = meta?.fallbackImage ?? "";
          }}
        />
      </Link>

      <div className="flex-1 min-w-0">
        <Link to="/product/$id" params={{ id: product.id }}>
          <h3 className="font-display font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
            {product.title}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground mt-0.5">
          {meta?.icon} {product.category}
        </p>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="font-mono font-bold text-primary">${price}</span>
        <Button
          data-ocid={`cart.remove.delete_button.${index}`}
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(product.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: cart, isLoading: cartLoading } = useGetCart();
  const removeFromCart = useRemoveFromCart();

  const productIds = cart?.products ?? [];

  const handleRemove = async (productId: string) => {
    try {
      await removeFromCart.mutateAsync(productId);
      toast.success("Removed from cart");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        data-ocid="cart.page"
        className="container mx-auto px-4 py-20 text-center max-w-md"
      >
        <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">
          Sign in to view your cart
        </h2>
        <p className="text-muted-foreground mb-6">
          You need to be signed in to add items to your cart.
        </p>
        <Link to="/">
          <Button
            data-ocid="cart.signin.primary_button"
            className="bg-primary text-primary-foreground"
          >
            Go Home
          </Button>
        </Link>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div
        data-ocid="cart.loading_state"
        className="container mx-auto px-4 py-10 sm:px-6 max-w-2xl"
      >
        <Skeleton className="h-8 w-32 mb-6 bg-secondary/50" />
        <div className="space-y-3">
          {["a", "b", "c"].map((k) => (
            <Skeleton
              key={k}
              className="h-20 w-full rounded-xl bg-secondary/50"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      data-ocid="cart.page"
      className="container mx-auto px-4 py-10 sm:px-6 max-w-2xl"
    >
      <h1 className="font-display text-3xl font-bold mb-8">
        Your Cart{" "}
        {productIds.length > 0 && (
          <span className="text-muted-foreground font-normal text-lg">
            ({productIds.length} item{productIds.length !== 1 ? "s" : ""})
          </span>
        )}
      </h1>

      {productIds.length === 0 ? (
        <div
          data-ocid="cart.empty_state"
          className="text-center py-16 card-glass rounded-xl"
        >
          <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold mb-2">
            Your cart is empty
          </h3>
          <p className="text-muted-foreground mb-6">
            Start adding some amazing digital products!
          </p>
          <Link to="/catalog">
            <Button
              data-ocid="cart.browse.primary_button"
              className="bg-primary text-primary-foreground"
            >
              Browse Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Cart Items */}
          <div className="space-y-3">
            {productIds.map((productId, i) => (
              <CartItem
                key={productId}
                productId={productId}
                index={i + 1}
                onRemove={handleRemove}
              />
            ))}
          </div>

          {/* Summary */}
          <div className="rounded-xl p-5 surface-elevated space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Items</span>
              <span className="font-medium">{productIds.length}</span>
            </div>
            <div className="pt-3 border-t border-border">
              <Link to="/checkout">
                <Button
                  data-ocid="cart.checkout.primary_button"
                  className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
                  size="lg"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
