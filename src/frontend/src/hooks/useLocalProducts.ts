import { useCallback, useEffect, useState } from "react";
import type { Product } from "../backend.d";

const LOCAL_PRODUCTS_KEY = "digitech_local_products";
const DELETED_PRODUCTS_KEY = "digitech_deleted_products";

function readLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<{
      id: string;
      name: string;
      description: string;
      currency: string;
      priceInCents: string;
    }>;
    // bigint is not JSON-serialisable natively, stored as string
    return parsed.map((p) => ({ ...p, priceInCents: BigInt(p.priceInCents) }));
  } catch {
    return [];
  }
}

function writeLocalProducts(products: Product[]): void {
  try {
    const serialisable = products.map((p) => ({
      ...p,
      priceInCents: p.priceInCents.toString(),
    }));
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(serialisable));
  } catch {
    // ignore storage errors
  }
}

function readDeletedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_PRODUCTS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function writeDeletedIds(ids: Set<string>): void {
  try {
    localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore storage errors
  }
}

export function useLocalProducts() {
  const [locallyAdded, setLocallyAdded] =
    useState<Product[]>(readLocalProducts);
  const [locallyDeleted, setLocallyDeleted] =
    useState<Set<string>>(readDeletedIds);

  // Sync state with localStorage whenever another tab writes
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_PRODUCTS_KEY) {
        setLocallyAdded(readLocalProducts());
      }
      if (e.key === DELETED_PRODUCTS_KEY) {
        setLocallyDeleted(readDeletedIds());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const addProduct = useCallback((product: Product) => {
    setLocallyAdded((prev) => {
      const next = [...prev, product];
      writeLocalProducts(next);
      return next;
    });
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setLocallyDeleted((prev) => {
      const next = new Set(prev);
      next.add(id);
      writeDeletedIds(next);
      return next;
    });
  }, []);

  return { locallyAdded, locallyDeleted, addProduct, deleteProduct };
}
