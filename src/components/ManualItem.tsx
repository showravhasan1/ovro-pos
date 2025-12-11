'use client';

import { useState, useEffect, useRef } from 'react';
import { Product } from '@/lib/api';
import { X, Package } from 'lucide-react';

interface ManualItemProps {
    onAddItem: (product: Product) => void;
    onClose: () => void;
}

export default function ManualItem({ onAddItem, onClose }: ManualItemProps) {
    const [name, setName] = useState('');
    const [sellPrice, setSellPrice] = useState('');
    const [buyPrice, setBuyPrice] = useState('');
    const nameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        nameInputRef.current?.focus();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !sellPrice) return;

        const newProduct: Product = {
            id: `manual-${Date.now()}`,
            name,
            category: 'Parts',
            price: parseFloat(sellPrice) || 0,
            buyPrice: parseFloat(buyPrice) || 0,
            stock: 999
        };

        onAddItem(newProduct);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200"
            >
                <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <Package size={20} className="text-blue-600" />
                        <h2 className="text-base font-bold text-zinc-900 dark:text-white">Add Manual Item</h2>
                    </div>
                    <button type="button" onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-3">
                    <div>
                        <label className="text-xs font-medium text-zinc-500 mb-1 block">Item Name *</label>
                        <input
                            ref={nameInputRef}
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Engine Oil (Shell Advance)"
                            required
                            className="w-full text-sm p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-zinc-500 mb-1 block">Sell Price *</label>
                            <input
                                type="number"
                                value={sellPrice}
                                onChange={(e) => setSellPrice(e.target.value)}
                                placeholder="৳550"
                                required
                                className="w-full text-sm p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-zinc-500 mb-1 block">Buy Price (Hidden)</label>
                            <input
                                type="number"
                                value={buyPrice}
                                onChange={(e) => setBuyPrice(e.target.value)}
                                placeholder="৳420"
                                className="w-full text-sm p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:border-blue-500 text-zinc-400"
                            />
                        </div>
                    </div>

                    <div className="text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-800 p-2 rounded-lg">
                        Category: <span className="font-medium text-zinc-600">Parts</span> (Auto-assigned)
                    </div>
                </div>

                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 py-3 rounded-xl font-medium text-sm transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!name || !sellPrice}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-sm transition-colors"
                    >
                        Add to Cart
                    </button>
                </div>
            </form>
        </div>
    );
}
