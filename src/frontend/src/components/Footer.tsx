import { Zap } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname = window.location.hostname;
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer className="border-t border-border/60 bg-card/40 py-8 mt-auto">
      <div className="container flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/20">
            <Zap className="h-3 w-3 text-primary" strokeWidth={2.5} />
          </div>
          <span className="font-display font-semibold text-sm text-foreground">
            Digitech
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          © {year}. Built with <span className="text-destructive">♥</span> using{" "}
          <a
            href={caffeineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline underline-offset-2"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
