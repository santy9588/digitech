import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/sonner";
import { Admin } from "@/pages/Admin";
import { CheckoutSuccess } from "@/pages/CheckoutSuccess";
import { Home } from "@/pages/Home";
import { Orders } from "@/pages/Orders";
import { ProductDetail } from "@/pages/ProductDetail";
import { Products } from "@/pages/Products";
import { useState } from "react";

export type Page =
  | "home"
  | "products"
  | "orders"
  | "admin"
  | "product-detail"
  | "success";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [currentProductId, setCurrentProductId] = useState<string | undefined>(
    undefined,
  );

  const navigate = (page: Page, productId?: string) => {
    setCurrentPage(page);
    if (productId !== undefined) {
      setCurrentProductId(productId);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Home onNavigate={navigate} />;
      case "products":
        return <Products onNavigate={navigate} />;
      case "product-detail":
        return currentProductId ? (
          <ProductDetail productId={currentProductId} onNavigate={navigate} />
        ) : (
          <Products onNavigate={navigate} />
        );
      case "success":
        return <CheckoutSuccess onNavigate={navigate} />;
      case "orders":
        return <Orders onNavigate={navigate} />;
      case "admin":
        return <Admin onNavigate={navigate} />;
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage={currentPage} onNavigate={navigate} />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "bg-card border-border text-foreground",
            success: "border-[oklch(0.72_0.17_150/0.5)]",
            error: "border-destructive/50",
          },
        }}
      />
    </div>
  );
}
