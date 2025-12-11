'use client';

import { Product } from '@/lib/api';
import { Plus } from 'lucide-react';

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
    return (
        <button
            onClick={() => onAddToCart(product)}
            className="group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 text-left hover:border-blue-500 hover:shadow-lg transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
                    {product.name}
                </h3>
                <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus size={16} />
                </span>
            </div>

            <div className="flex items-center justify-between mt-3">
                <span className="text-lg font-black text-blue-600">৳{product.price}</span>
                <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{product.stock} in stock</span>
            </div>

            <div className="mt-2 text-xs text-zinc-500 font-medium">{product.category}</div>
        </button>
    );
}
