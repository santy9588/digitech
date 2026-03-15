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

// ── Gateway config ────────────────────────────────────────────────

interface GatewayToggleDef {
  id: string;
  label: string;
  description: string;
  color: string;
  section: "cards" | "upi" | "qr" | "other";
}

const GATEWAY_TOGGLES: GatewayToggleDef[] = [
  // Cards
  {
    id: "card",
    label: "Credit Card",
    description: "Visa, Mastercard, RuPay, Amex",
    color: "#1A1F71",
    section: "cards",
  },
  {
    id: "debit",
    label: "Debit Card",
    description: "All major bank debit cards",
    color: "#2563EB",
    section: "cards",
  },
  {
    id: "international",
    label: "International Cards",
    description: "International Visa / Mastercard",
    color: "#0ea5e9",
    section: "cards",
  },
  // UPI
  {
    id: "phonepe",
    label: "PhonePe",
    description: "India UPI wallet",
    color: "#5f259f",
    section: "upi",
  },
  {
    id: "googlepay",
    label: "Google Pay",
    description: "Fast & secure",
    color: "#34A853",
    section: "upi",
  },
  {
    id: "paytm",
    label: "Paytm",
    description: "Paytm wallet & UPI",
    color: "#00B9F1",
    section: "upi",
  },
  {
    id: "amazonpay",
    label: "Amazon Pay",
    description: "Amazon balance & linked cards",
    color: "#FF9900",
    section: "upi",
  },
  {
    id: "bhimupi",
    label: "BHIM UPI",
    description: "Government UPI app",
    color: "#1B3A6B",
    section: "upi",
  },
  {
    id: "upi",
    label: "UPI (Generic)",
    description: "Any UPI ID",
    color: "#097939",
    section: "upi",
  },
  // QR
  {
    id: "qrcode",
    label: "QR Code",
    description: "Scan to pay via any UPI app",
    color: "#0d9488",
    section: "qr",
  },
  // Other
  {
    id: "paypal",
    label: "PayPal",
    description: "PayPal account",
    color: "#003087",
    section: "other",
  },
  {
    id: "netbanking",
    label: "Net Banking",
    description: "All major banks",
    color: "#475569",
    section: "other",
  },
  {
    id: "applepay",
    label: "Apple Pay",
    description: "iOS & macOS devices",
    color: "#1c1c1e",
    section: "other",
  },
];

const SECTION_LABELS: Record<string, string> = {
  cards: "💳 Cards",
  upi: "📱 UPI & Mobile Wallets",
  qr: "🔲 QR Code",
  other: "🌐 Other Methods",
};

const GATEWAY_SECTIONS = (["cards", "upi", "qr", "other"] as const).map(
  (sec) => ({
    key: sec,
    label: SECTION_LABELS[sec],
    gateways: GATEWAY_TOGGLES.filter((g) => g.section === sec),
  }),
);

// ── Page ──────────────────────────────────────────────────────────

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
    "US, CA, GB, AU, DE, FR, JP, IN",
  );
  const [stripeOpen, setStripeOpen] = useState(false);

  // Gateway toggles — keyed by gateway id
  const [gatewayStates, setGatewayStates] = useState<Record<string, boolean>>(
    () => Object.fromEntries(GATEWAY_TOGGLES.map((g) => [g.id, true])),
  );
  const [gatewaySaving, setGatewaySaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setRole(profile.role);
    }
  }, [profile]);

  useEffect(() => {
    if (enabledGateways) {
      setGatewayStates(
        Object.fromEntries(
          GATEWAY_TOGGLES.map((g) => [g.id, enabledGateways.includes(g.id)]),
        ),
      );
    }
  }, [enabledGateways]);

  const handleGatewaySave = async () => {
    const selected = GATEWAY_TOGGLES.filter((g) => gatewayStates[g.id]).map(
      (g) => g.id,
    );
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
                      placeholder="US, CA, GB, IN..."
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
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {setStripeConfig.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Save Stripe Key"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  data-ocid="profile.stripe.open_modal_button"
                  variant="outline"
                  onClick={() => setStripeOpen(true)}
                  className="w-full border-border hover:border-primary/40"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {stripeConfigured ? "Update Stripe Key" : "Configure Stripe"}
                </Button>
              )}
            </div>
          )}

          {/* Payment Gateways (for admins) */}
          {isSeller && (
            <div className="card-glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-display font-semibold flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-primary" />
                    Payment Gateways
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Enable or disable payment methods for buyers
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {GATEWAY_SECTIONS.map((section, sIdx) => (
                  <div key={section.key}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      {section.label}
                    </p>
                    <div className="space-y-3">
                      {section.gateways.map((gw, gIdx) => {
                        const ocidIdx = sIdx * 10 + gIdx + 1;
                        return (
                          <div
                            key={gw.id}
                            data-ocid={`profile.gateway_toggle.${ocidIdx}`}
                            className="flex items-center justify-between rounded-lg bg-secondary/20 border border-border px-4 py-3 hover:bg-secondary/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0"
                                style={{ background: gw.color }}
                              >
                                <span className="text-white text-[9px] font-bold">
                                  {gw.label.slice(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  {gw.label}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {gw.description}
                                </p>
                              </div>
                            </div>
                            <Switch
                              checked={gatewayStates[gw.id] ?? false}
                              onCheckedChange={(checked) =>
                                setGatewayStates((prev) => ({
                                  ...prev,
                                  [gw.id]: checked,
                                }))
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                data-ocid="profile.gateways.save.submit_button"
                onClick={handleGatewaySave}
                disabled={gatewaySaving}
                className="w-full mt-5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {gatewaySaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Gateway Settings
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
