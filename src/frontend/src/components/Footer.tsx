import { Link } from "@tanstack/react-router";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer className="border-t border-border bg-background/60 mt-auto">
      <div className="container mx-auto px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <img
                src="/assets/generated/digitech-logo-transparent.dim_120x120.png"
                alt="DigiTech"
                className="h-7 w-7 object-contain"
              />
              <span className="font-display text-lg font-bold text-gradient-cyan">
                DigiTech
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Your global marketplace for premium digital products — audio,
              ebooks, videos, music, photos, and more.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-foreground">
              Marketplace
            </h3>
            <ul className="space-y-2">
              {[
                { to: "/catalog", label: "Browse Catalog" },
                { to: "/blog", label: "Blog" },
                { to: "/cart", label: "Cart" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-foreground">
              Account
            </h3>
            <ul className="space-y-2">
              {[
                { to: "/profile", label: "Profile" },
                { to: "/orders", label: "Orders" },
                { to: "/seller", label: "Sell Products" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {year}. Built with ❤️ using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by Internet Computer
          </p>
        </div>
      </div>
    </footer>
  );
}
