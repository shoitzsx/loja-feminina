"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { products } from "@/lib/data";
import type { CartLine } from "@/lib/types";

type CartContextValue = {
  items: CartLine[];
  count: number;
  addItem: (line: CartLine) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  toast: string | null;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "barbs_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setItems(JSON.parse(saved) as CartLine[]);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const addItem = useCallback((line: CartLine) => {
    setItems((current) => {
      const product = products.find((candidate) => candidate.id === line.productId);
      const variant = product?.variants.find((candidate) => candidate.id === line.variantId);
      const availableStock = variant?.stock ?? 0;
      const existing = current.find((item) => item.variantId === line.variantId);

      if (existing) {
        return current.map((item) =>
          item.variantId === line.variantId ? { ...item, quantity: Math.min(availableStock, item.quantity + line.quantity) } : item
        );
      }

      return [...current, { ...line, quantity: Math.min(availableStock, Math.max(1, line.quantity)) }];
    });
    setToast("Produto adicionado ao carrinho.");
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    setItems((current) =>
      current
        .map((item) => {
          if (item.variantId !== variantId) return item;
          const product = products.find((candidate) => candidate.id === item.productId);
          const variant = product?.variants.find((candidate) => candidate.id === variantId);
          return { ...item, quantity: Math.min(variant?.stock ?? quantity, Math.max(1, quantity)) };
        })
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setItems((current) => current.filter((item) => item.variantId !== variantId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((total, item) => total + item.quantity, 0),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      toast
    }),
    [addItem, clearCart, items, removeItem, toast, updateQuantity]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 animate-soft-pop -translate-x-1/2 rounded-lg bg-[linear-gradient(135deg,#ff1689,#5a1238)] px-4 py-3 text-sm font-bold text-white shadow-glow" role="status">
          {toast}
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
