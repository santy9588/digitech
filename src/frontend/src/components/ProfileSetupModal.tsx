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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
} from "../hooks/useQueries";

export default function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.user);

  const isAuthenticated = !!identity;
  const showModal =
    isAuthenticated && !isLoading && isFetched && profile === null;

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
      toast.success("Profile created!");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  if (!showModal) return null;

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent
        data-ocid="profile-setup.dialog"
        className="sm:max-w-md bg-card border-border"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-gradient-cyan">
            Welcome to DigiTech!
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Set up your profile to get started. Choose how you'd like to use the
            platform.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Your Name</Label>
            <Input
              id="profile-name"
              data-ocid="profile-setup.input"
              placeholder="Enter your display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="bg-secondary/50 border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-role">Account Type</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger
                id="profile-role"
                data-ocid="profile-setup.select"
                className="bg-secondary/50 border-border"
              >
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.user}>
                  Buyer — browse & purchase
                </SelectItem>
                <SelectItem value={UserRole.admin}>
                  Seller — upload & sell products
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            data-ocid="profile-setup.submit_button"
            onClick={handleSave}
            disabled={saveProfile.isPending || !name.trim()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              "Get Started"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
