import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { CartItem } from '../types';

interface CartContextType {
    items: CartItem[];
    itemCount: number;
    subtotal: number;
    addItem: (item: Omit<CartItem, 'subtotal'>) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    isInCart: (productId: string) => boolean;
    getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'kaysdrive_cart';

const calculateSubtotal = (items: CartItem[]): number =>
    parseFloat(items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        try {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    // Persist cart to localStorage on every change
    useEffect(() => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        } catch {
            // Ignore storage errors (e.g. private browsing limits)
        }
    }, [items]);

    const addItem = useCallback((newItem: Omit<CartItem, 'subtotal'>) => {
        setItems(prev => {
            const existing = prev.find(i => i.productId === newItem.productId);
            if (existing) {
                // Increase quantity, cap at stock
                const newQty = Math.min(existing.quantity + newItem.quantity, newItem.stock);
                return prev.map(i =>
                    i.productId === newItem.productId
                        ? { ...i, quantity: newQty, subtotal: parseFloat((i.price * newQty).toFixed(2)) }
                        : i
                );
            }
            return [...prev, {
                ...newItem,
                quantity: Math.min(newItem.quantity, newItem.stock),
                subtotal: parseFloat((newItem.price * Math.min(newItem.quantity, newItem.stock)).toFixed(2)),
            }];
        });
    }, []);

    const removeItem = useCallback((productId: string) => {
        setItems(prev => prev.filter(i => i.productId !== productId));
    }, []);

    const updateQuantity = useCallback((productId: string, quantity: number) => {
        if (quantity <= 0) {
            setItems(prev => prev.filter(i => i.productId !== productId));
            return;
        }
        setItems(prev =>
            prev.map(i =>
                i.productId === productId
                    ? { ...i, quantity: Math.min(quantity, i.stock), subtotal: parseFloat((i.price * Math.min(quantity, i.stock)).toFixed(2)) }
                    : i
            )
        );
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const isInCart = useCallback((productId: string) =>
        items.some(i => i.productId === productId), [items]);

    const getItemQuantity = useCallback((productId: string) =>
        items.find(i => i.productId === productId)?.quantity ?? 0, [items]);

    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = calculateSubtotal(items);

    return (
        <CartContext.Provider value={{
            items,
            itemCount,
            subtotal,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            isInCart,
            getItemQuantity,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within a CartProvider');
    return ctx;
}
