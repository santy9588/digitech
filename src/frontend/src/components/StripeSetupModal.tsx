import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { CreditCard } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useIsStripeConfigured,
  useSetStripeConfiguration,
} from "../hooks/useQueries";

export default function StripeSetupModal() {
  const { identity } = useInternetIdentity();
  const { data: profile } = useGetCallerUserProfile();
  const { data: stripeConfigured } = useIsStripeConfigured();
  const setStripeConfig = useSetStripeConfiguration();

  const [secretKey, setSecretKey] = useState("");
  const [countries, setCountries] = useState("US, CA, GB, AU, DE, FR, JP, SG");
  const [open, setOpen] = useState(true);

  const isAdmin = profile?.role === UserRole.admin;
  const isAuthenticated = !!identity;

  const showModal =
    isAuthenticated && isAdmin && stripeConfigured === false && open;

  const handleSave = async () => {
    if (!secretKey.startsWith("sk_")) {
      toast.error("Please enter a valid Stripe secret key (starts with sk_)");
      return;
    }
    const allowedCountries = countries
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);

    try {
      await setStripeConfig.mutateAsync({ secretKey, allowedCountries });
      toast.success("Stripe configured successfully!");
      setOpen(false);
    } catch {
      toast.error("Failed to configure Stripe. Please try again.");
    }
  };

  if (!showModal) return null;

  return (
    <Dialog open={true} onOpenChange={setOpen}>
      <DialogContent
        data-ocid="stripe-setup.dialog"
        className="sm:max-w-lg bg-card border-border"
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="font-display text-xl">
              Configure Stripe Payments
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Set up Stripe to accept payments globally. You can find your secret
            key in the Stripe Dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="stripe-key">Stripe Secret Key</Label>
            <Input
              id="stripe-key"
              data-ocid="stripe-setup.input"
              type="password"
              placeholder="sk_live_... or sk_test_..."
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="bg-secondary/50 border-border font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stripe-countries">
              Allowed Countries (comma-separated)
            </Label>
            <Input
              id="stripe-countries"
              data-ocid="stripe-setup.countries.input"
              placeholder="US, CA, GB, AU..."
              value={countries}
              onChange={(e) => setCountries(e.target.value)}
              className="bg-secondary/50 border-border"
            />
          </div>

          <div className="flex gap-3">
            <Button
              data-ocid="stripe-setup.cancel_button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-border"
            >
              Skip for now
            </Button>
            <Button
              data-ocid="stripe-setup.submit_button"
              onClick={handleSave}
              disabled={setStripeConfig.isPending || !secretKey}
              className="flex-1 bg-primary text-primary-foreground"
            >
              {setStripeConfig.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                "Save Configuration"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
