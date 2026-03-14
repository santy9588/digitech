import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Eye, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAddToCart } from "../hooks/useQueries";
import { CATEGORY_META } from "../lib/categoryMeta";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 1 }: ProductCardProps) {
  const addToCart = useAddToCart();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const meta = CATEGORY_META[product.category] ?? CATEGORY_META.Other;
  const price = (Number(product.priceCents) / 100).toFixed(2);
  const thumbnailUrl = product.thumbnail.getDirectURL();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to your cart");
      return;
    }
    try {
      await addToCart.mutateAsync(product.id);
      toast.success(`"${product.title}" added to cart`);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <div
      data-ocid={`catalog.product.card.${index}`}
      className="group relative rounded-xl overflow-hidden card-glass hover:border-primary/40 transition-all duration-300 hover:shadow-glow hover:-translate-y-1"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={thumbnailUrl || meta.fallbackImage}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = meta.fallbackImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
        <Badge
          className="absolute top-3 left-3 text-xs font-medium"
          style={{ background: meta.color, color: "#fff" }}
        >
          {meta.icon} {product.category}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-display font-semibold text-foreground line-clamp-1 text-sm sm:text-base">
            {product.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gradient-cyan font-mono">
            ${price}
          </span>
          <div className="flex items-center gap-2">
            <Link to="/product/$id" params={{ id: product.id }}>
              <Button
                data-ocid={`catalog.product.view.${index}`}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              data-ocid={`catalog.product.cart.${index}`}
              size="sm"
              onClick={handleAddToCart}
              disabled={addToCart.isPending}
              className="h-8 gap-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all border border-primary/30"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
