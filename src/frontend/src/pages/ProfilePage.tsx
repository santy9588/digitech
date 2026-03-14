import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Link } from "@tanstack/react-router";
import {
  CreditCard,
  Loader2,
  Save,
  Shield,
  ShoppingBag,
  User,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useGetEnabledGateways,
  useIsStripeConfigured,
  useSaveCallerUserProfile,
  useSetEnabledGateways,
  useSetStripeConfiguration,
} from "../hooks/useQueries";

export default function ProfilePage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: profile, isLoading } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const { data: stripeConfigured } = useIsStripeConfigured();
  const setStripeConfig = useSetStripeConfiguration();
  const { data: enabledGateways } = useGetEnabledGateways();
  const setEnabledGateways = useSetEnabledGateways();

  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.user);

  // Stripe config
  const [stripeKey, setStripeKey] = useState("");
  const [stripeCountries, setStripeCountries] = useState(
    "US, CA, GB, AU, DE, FR, JP",
  );
  const [stripeOpen, setStripeOpen] = useState(false);

  // Gateway toggles
  const [gatewayCard, setGatewayCard] = useState(true);
  const [gatewayPaypal, setGatewayPaypal] = useState(true);
  const [gatewayGooglepay, setGatewayGooglepay] = useState(true);
  const [gatewayApplepay, setGatewayApplepay] = useState(true);
  const [gatewaySaving, setGatewaySaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setRole(profile.role);
    }
  }, [profile]);

  useEffect(() => {
    if (enabledGateways) {
      setGatewayCard(enabledGateways.includes("card"));
      setGatewayPaypal(enabledGateways.includes("paypal"));
      setGatewayGooglepay(enabledGateways.includes("googlepay"));
      setGatewayApplepay(enabledGateways.includes("applepay"));
    }
  }, [enabledGateways]);

  const handleGatewaySave = async () => {
    const selected: string[] = [];
    if (gatewayCard) selected.push("card");
    if (gatewayPaypal) selected.push("paypal");
    if (gatewayGooglepay) selected.push("googlepay");
    if (gatewayApplepay) selected.push("applepay");
    if (selected.length === 0) {
      toast.error("Please enable at least one payment gateway");
      return;
    }
    setGatewaySaving(true);
    try {
      await setEnabledGateways.mutateAsync(selected);
      toast.success("Payment gateways updated!");
    } catch {
      toast.error("Failed to update payment gateways");
    } finally {
      setGatewaySaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        data-ocid="profile.page"
        className="container mx-auto px-4 py-20 text-center max-w-md"
      >
        <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">
          Sign in to view profile
        </h2>
        <p className="text-muted-foreground">
          You need to sign in to manage your profile.
        </p>
      </div>
    );
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!identity) return;
    try {
      await saveProfile.mutateAsync({
        principal: identity.getPrincipal(),
        name: name.trim(),
        role,
      });
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleStripeSave = async () => {
    if (!stripeKey.startsWith("sk_")) {
      toast.error("Please enter a valid Stripe secret key");
      return;
    }
    const countries = stripeCountries
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);
    try {
      await setStripeConfig.mutateAsync({
        secretKey: stripeKey,
        allowedCountries: countries,
      });
      toast.success("Stripe configured!");
      setStripeOpen(false);
      setStripeKey("");
    } catch {
      toast.error("Failed to configure Stripe");
    }
  };

  const isSeller = profile?.role === UserRole.admin;

  return (
    <div
      data-ocid="profile.page"
      className="container mx-auto px-4 py-10 sm:px-6 max-w-2xl"
    >
      <h1 className="font-display text-3xl font-bold mb-8">My Profile</h1>

      {isLoading ? (
        <div data-ocid="profile.loading_state" className="space-y-4">
          <Skeleton className="h-48 w-full rounded-xl bg-secondary/50" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="card-glass rounded-xl p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <User className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold">
                  {profile?.name ?? "Anonymous"}
                </h2>
                <p className="text-xs text-muted-foreground font-mono">
                  {identity.getPrincipal().toString().slice(0, 28)}…
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Display Name</Label>
                <Input
                  id="profile-name"
                  data-ocid="profile.name.input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your display name"
                  className="bg-secondary/50 border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-role">Account Type</Label>
                <Select
                  value={role}
                  onValueChange={(v) => setRole(v as UserRole)}
                >
                  <SelectTrigger
                    id="profile-role"
                    data-ocid="profile.role.select"
                    className="bg-secondary/50 border-border"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.user}>
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4" />
                        Buyer — browse & purchase
                      </div>
                    </SelectItem>
                    <SelectItem value={UserRole.admin}>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Seller / Admin — upload & sell
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                data-ocid="profile.save.submit_button"
                onClick={handleSave}
                disabled={saveProfile.isPending}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saveProfile.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link to="/orders">
              <div className="card-glass rounded-xl p-4 hover:border-primary/30 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">My Orders</p>
                    <p className="text-xs text-muted-foreground">
                      View purchases & downloads
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {isSeller && (
              <Link to="/seller">
                <div className="card-glass rounded-xl p-4 hover:border-primary/30 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Seller Dashboard</p>
                      <p className="text-xs text-muted-foreground">
                        Manage your products
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* Stripe Config (for admins) */}
          {isSeller && (
            <div className="card-glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-semibold">
                    Payment Configuration
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {stripeConfigured
                      ? "Stripe is configured and ready"
                      : "Set up Stripe to accept payments"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: stripeConfigured
                        ? "oklch(0.7 0.2 145)"
                        : "oklch(0.62 0.22 25)",
                    }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {stripeConfigured ? "Active" : "Not configured"}
                  </span>
                </div>
              </div>

              {stripeOpen ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Stripe Secret Key</Label>
                    <Input
                      data-ocid="profile.stripe.key.input"
                      type="password"
                      placeholder="sk_live_... or sk_test_..."
                      value={stripeKey}
                      onChange={(e) => setStripeKey(e.target.value)}
                      className="bg-secondary/50 border-border font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Allowed Countries</Label>
                    <Input
                      data-ocid="profile.stripe.countries.input"
                      placeholder="US, CA, GB..."
                      value={stripeCountries}
                      onChange={(e) => setStripeCountries(e.target.value)}
                      className="bg-secondary/50 border-border"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      data-ocid="profile.stripe.cancel_button"
                      variant="outline"
                      onClick={() => setStripeOpen(false)}
                      className="flex-1 border-border"
                    >
                      Cancel
                    </Button>
                    <Button
                      data-ocid="profile.stripe.save.submit_button"
                      onClick={handleStripeSave}
                      disabled={setStripeConfig.isPending}
                      className="flex-1 bg-primary text-primary-foreground"
                    >
                      {setStripeConfig.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  data-ocid="profile.stripe.configure.button"
                  variant="outline"
                  onClick={() => setStripeOpen(true)}
                  className="w-full border-border"
                >
                  {stripeConfigured
                    ? "Update Stripe Config"
                    : "Configure Stripe"}
                </Button>
              )}
            </div>
          )}

          {/* Payment Gateways (for admins) */}
          {isSeller && (
            <div className="card-glass rounded-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">
                    Payment Gateways
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Choose which payment methods to offer at checkout
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Card */}
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Credit / Debit Card</p>
                      <p className="text-xs text-muted-foreground">
                        Visa, Mastercard, Amex — via Stripe
                      </p>
                    </div>
                  </div>
                  <Switch
                    data-ocid="profile.gateway.card.switch"
                    checked={gatewayCard}
                    onCheckedChange={setGatewayCard}
                  />
                </div>

                {/* PayPal */}
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold">
                      <span style={{ color: "#003087" }}>Pay</span>
                      <span style={{ color: "#009CDE" }}>Pal</span>
                    </span>
                    <div>
                      <p className="text-sm font-medium">PayPal</p>
                      <p className="text-xs text-muted-foreground">
                        PayPal checkout — requires Stripe PayPal integration
                      </p>
                    </div>
                  </div>
                  <Switch
                    data-ocid="profile.gateway.paypal.switch"
                    checked={gatewayPaypal}
                    onCheckedChange={setGatewayPaypal}
                  />
                </div>

                {/* Google Pay */}
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold">
                      <span style={{ color: "#4285F4" }}>G</span>
                      <span style={{ color: "#EA4335" }}>o</span>
                      <span style={{ color: "#FBBC05" }}>o</span>
                      <span style={{ color: "#4285F4" }}>g</span>
                      <span style={{ color: "#34A853" }}>l</span>
                      <span style={{ color: "#EA4335" }}>e</span>
                    </span>
                    <div>
                      <p className="text-sm font-medium">Google Pay</p>
                      <p className="text-xs text-muted-foreground">
                        Handled automatically by Stripe
                      </p>
                    </div>
                  </div>
                  <Switch
                    data-ocid="profile.gateway.googlepay.switch"
                    checked={gatewayGooglepay}
                    onCheckedChange={setGatewayGooglepay}
                  />
                </div>

                {/* Apple Pay */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm">🍎</span>
                    <div>
                      <p className="text-sm font-medium">Apple Pay</p>
                      <p className="text-xs text-muted-foreground">
                        Handled automatically by Stripe
                      </p>
                    </div>
                  </div>
                  <Switch
                    data-ocid="profile.gateway.applepay.switch"
                    checked={gatewayApplepay}
                    onCheckedChange={setGatewayApplepay}
                  />
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-secondary/30 text-xs text-muted-foreground">
                Google Pay and Apple Pay are handled automatically by Stripe
                when enabled. Availability depends on buyer's browser and
                device.
              </div>

              <Button
                data-ocid="profile.gateways.save.submit_button"
                onClick={handleGatewaySave}
                disabled={gatewaySaving}
                className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {gatewaySaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  "Save Gateway Settings"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
