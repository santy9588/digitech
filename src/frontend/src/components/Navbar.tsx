import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useRouter } from "@tanstack/react-router";
import { Loader2, LogIn, LogOut, ShieldCheck, Zap } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";

export default function Navbar() {
  const { login, clear, identity, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  const isAuthenticated = !!identity;

  const navLinkClass = (path: string) =>
    cn(
      "relative text-sm font-medium transition-colors duration-150 px-1 py-0.5",
      "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:rounded-full after:transition-all after:duration-200",
      currentPath === path
        ? "text-primary after:bg-primary"
        : "text-muted-foreground hover:text-foreground after:bg-transparent hover:after:bg-primary/40",
    );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <nav className="container flex h-16 items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 select-none">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/30">
            <Zap className="h-4 w-4 text-primary" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-foreground">
            Digitech
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className={navLinkClass("/")}
            data-ocid="nav.products_link"
          >
            Products
          </Link>

          {isAuthenticated && (
            <Link
              to="/orders"
              className={navLinkClass("/orders")}
              data-ocid="nav.orders_link"
            >
              My Orders
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className={cn(navLinkClass("/admin"), "flex items-center gap-1")}
              data-ocid="nav.admin_link"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}
        </div>

        {/* Auth */}
        <div className="flex items-center">
          {isInitializing ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              onClick={clear}
              className="gap-2 border-border/60 bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
              data-ocid="nav.logout_button"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              data-ocid="nav.login_button"
            >
              {isLoggingIn ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogIn className="h-3.5 w-3.5" />
              )}
              {isLoggingIn ? "Signing in…" : "Sign In"}
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
