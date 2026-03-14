import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  LogIn,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Page =
  | "home"
  | "products"
  | "orders"
  | "admin"
  | "product-detail"
  | "success";

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page, productId?: string) => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoggedIn = !!identity;
  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}...${principal.slice(-3)}`
    : "";

  const navLinks = [
    { label: "Home", page: "home" as Page, show: true },
    { label: "Products", page: "products" as Page, show: true },
    { label: "My Orders", page: "orders" as Page, show: isLoggedIn },
    { label: "Admin", page: "admin" as Page, show: isLoggedIn },
  ];

  const handleNav = (page: Page) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[oklch(0.09_0.008_240/0.95)] backdrop-blur-md border-b border-[oklch(0.25_0.015_240)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            type="button"
            onClick={() => handleNav("home")}
            data-ocid="nav.home_link"
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center glow-cyan-sm">
              <Zap
                className="w-4 h-4 text-primary-foreground"
                fill="currentColor"
              />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-gradient-cyan">
              DigiTech
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks
              .filter((l) => l.show)
              .map((link) => (
                <button
                  type="button"
                  key={link.page}
                  data-ocid={
                    link.page === "products"
                      ? "nav.products_link"
                      : link.page === "orders"
                        ? "nav.orders_link"
                        : link.page === "admin"
                          ? "nav.admin_link"
                          : "nav.home_link"
                  }
                  onClick={() => handleNav(link.page)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === link.page
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </button>
              ))}
          </nav>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isInitializing ? (
              <div className="h-9 w-24 bg-secondary animate-pulse rounded-md" />
            ) : isLoggedIn ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-1 rounded">
                  {shortPrincipal}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clear}
                  data-ocid="nav.logout_button"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={login}
                disabled={isLoggingIn}
                data-ocid="nav.login_button"
                className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan-sm"
              >
                {isLoggingIn ? (
                  <>
                    <span className="w-3 h-3 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-1.5" />
                    Sign In
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-[oklch(0.09_0.008_240/0.98)] overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks
                .filter((l) => l.show)
                .map((link) => (
                  <button
                    type="button"
                    key={link.page}
                    onClick={() => handleNav(link.page)}
                    className={`w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      currentPage === link.page
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    {link.page === "home" && <Zap className="w-4 h-4" />}
                    {link.page === "products" && (
                      <Package className="w-4 h-4" />
                    )}
                    {link.page === "orders" && (
                      <ShoppingBag className="w-4 h-4" />
                    )}
                    {link.page === "admin" && <Settings className="w-4 h-4" />}
                    {link.label}
                  </button>
                ))}
              <div className="pt-2 pb-1">
                {isLoggedIn ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      clear();
                      setMobileOpen(false);
                    }}
                    data-ocid="nav.logout_button"
                    className="w-full justify-start text-muted-foreground"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out ({shortPrincipal})
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      login();
                      setMobileOpen(false);
                    }}
                    disabled={isLoggingIn}
                    data-ocid="nav.login_button"
                    className="w-full bg-primary text-primary-foreground"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
