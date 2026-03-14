import { Button } from "@/components/ui/button";
import { LogIn, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface LoginPromptProps {
  title?: string;
  description?: string;
}

export default function LoginPrompt({
  title = "Authentication Required",
  description = "Sign in to access this feature.",
}: LoginPromptProps) {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col items-center justify-center gap-6 py-24 px-4 text-center"
    >
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-muted ring-1 ring-border">
        <ShieldAlert className="h-7 w-7 text-muted-foreground" />
      </div>
      <div className="max-w-xs">
        <h2 className="font-display text-xl font-semibold text-foreground mb-2">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
      <Button
        onClick={login}
        disabled={isLoggingIn}
        className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6"
        data-ocid="nav.login_button"
      >
        <LogIn className="h-4 w-4" />
        {isLoggingIn ? "Signing in…" : "Sign In"}
      </Button>
    </motion.div>
  );
}
