'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product } from './products';
import { toast } from 'sonner';

export interface OrderListItem {
  product: Product;
  quantity: number;
}

interface OrderListContextType {
  items: OrderListItem[];
  totalItems: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearList: () => void;
}

const OrderListContext = createContext<OrderListContextType | undefined>(undefined);

const STORAGE_KEY = 'ah_electronics_order_list_v1';

export function OrderListProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<OrderListItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load order list', e);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save order list', e);
      }
    }
  }, [items, isInitialized]);

  const addItem = (product: Product, quantity: number = 1) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.id === product.id);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx].quantity += quantity;
        return next;
      }
      return [...prev, { product, quantity }];
    });
    toast.success(`${product.name} added to your Order List`);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearList = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <OrderListContext.Provider
      value={{
        items,
        totalItems,
        isOpen,
        setIsOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearList,
      }}
    >
      {children}
    </OrderListContext.Provider>
  );
}

export function useOrderList() {
  const context = useContext(OrderListContext);
  if (!context) {
    throw new Error('useOrderList must be used within an OrderListProvider');
  }
  return context;
}
