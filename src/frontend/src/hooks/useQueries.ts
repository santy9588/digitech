import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ShoppingItem } from "../backend.d";
import { useActor } from "./useActor";

// ── Products ──────────────────────────────────────────────────────────────────

export function useProducts() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── User Orders ───────────────────────────────────────────────────────────────

export function useUserOrders() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["user-orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── All Orders (Admin) ────────────────────────────────────────────────────────

export function useAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["all-orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Is Admin ──────────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Is Stripe Configured ──────────────────────────────────────────────────────

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["stripe-configured"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Stripe Session Status ─────────────────────────────────────────────────────

export function useStripeSessionStatus(sessionId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["stripe-session", sessionId],
    queryFn: async () => {
      if (!actor || !sessionId) return null;
      return actor.getStripeSessionStatus(sessionId);
    },
    enabled: !!actor && !isFetching && !!sessionId,
    retry: false,
  });
}

// ── Create Order + Checkout Session ──────────────────────────────────────────

export function useCreateOrderAndCheckout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      items,
      successUrl,
      cancelUrl,
    }: {
      productId: string;
      items: Array<ShoppingItem>;
      successUrl: string;
      cancelUrl: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const [_orderId, checkoutUrl] = await Promise.all([
        actor.createOrder(productId),
        actor.createCheckoutSession(items, successUrl, cancelUrl),
      ]);
      return checkoutUrl;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["user-orders"] });
    },
  });
}

// ── Set Stripe Configuration ──────────────────────────────────────────────────

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      secretKey,
      allowedCountries,
    }: {
      secretKey: string;
      allowedCountries: Array<string>;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.setStripeConfiguration({ secretKey, allowedCountries });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["stripe-configured"] });
    },
  });
}
