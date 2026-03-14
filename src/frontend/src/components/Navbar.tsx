import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpDown,
  BookOpen,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingCart,
  User,
} from "lucide-react";
import { UserRole } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";
import { useGetCart } from "../hooks/useQueries";

export default function Navbar() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";
  const queryClient = useQueryClient();

  const { data: profile } = useGetCallerUserProfile();
  const { data: cart } = useGetCart();

  const cartCount = cart?.products?.length ?? 0;
  const isSeller =
    profile?.role === UserRole.admin || profile?.role === UserRole.user;
  const isAdmin = profile?.role === UserRole.admin;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          to="/"
          data-ocid="nav.home.link"
          className="flex items-center gap-2.5 group"
        >
          <img
            src="/assets/generated/digitech-logo-transparent.dim_120x120.png"
            alt="DigiTech"
            className="h-8 w-8 object-contain"
          />
          <span className="font-display text-xl font-bold text-gradient-cyan">
            DigiTech
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            data-ocid="nav.home.tab"
            className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            activeProps={{ className: "text-foreground bg-secondary/60" }}
          >
            Home
          </Link>
          <Link
            to="/catalog"
            data-ocid="nav.catalog.link"
            className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            activeProps={{ className: "text-foreground bg-secondary/60" }}
          >
            Catalog
          </Link>
          <Link
            to="/blog"
            data-ocid="nav.blog.link"
            className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            activeProps={{ className: "text-foreground bg-secondary/60" }}
          >
            Blog
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <Link to="/cart" data-ocid="nav.cart.link">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Auth */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  data-ocid="nav.user.dropdown_menu"
                  className="gap-2 border-border text-foreground hover:bg-secondary"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {profile?.name ?? "Account"}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link
                    to="/profile"
                    data-ocid="nav.profile.link"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/orders"
                    data-ocid="nav.orders.link"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Package className="h-4 w-4" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                {isSeller && (
                  <DropdownMenuItem asChild>
                    <Link
                      to="/seller"
                      data-ocid="nav.seller.link"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Seller Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link
                      to="/transactions"
                      data-ocid="nav.transactions.link"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <ArrowUpDown className="h-4 w-4" />
                      Transactions
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  data-ocid="nav.logout.button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-destructive cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              data-ocid="nav.login.button"
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
              className="bg-primary text-primary-foreground hover:bg-primary/90 glow-sm transition-all"
            >
              {isLoggingIn ? "Connecting…" : "Sign In"}
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
