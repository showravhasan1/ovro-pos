'use client';

import { useState, useEffect } from 'react';
import { Product, getProducts } from '@/lib/api';
import { Package, Plus, Edit2, Trash2, Save, X, ArrowLeft, Check, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface InventoryViewProps {
    products: Product[];
    onUpdateProducts: (products: Product[]) => void;
    onBackToPos: () => void;
}

export default function InventoryView({ products, onUpdateProducts, onBackToPos }: InventoryViewProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<Product>>({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);
    const [newProduct, setNewProduct] = useState<Partial<Product>>({
        name: '',
        category: 'Parts',
        price: 0,
        buyPrice: 0,
        stock: 0
    });

    const handleAddProduct = () => {
        if (!newProduct.name || !newProduct.price) return;

        const product: Product = {
            id: `P${Date.now()}`,
            name: newProduct.name || '',
            category: newProduct.category || 'Parts',
            price: newProduct.price || 0,
            buyPrice: newProduct.buyPrice || 0,
            stock: newProduct.stock || 0
        };

        onUpdateProducts([...products, product]);
        setNewProduct({ name: '', category: 'Parts', price: 0, buyPrice: 0, stock: 0 });
        setShowAddForm(false);
    };

    const startEditing = (product: Product) => {
        setEditingId(product.id);
        setEditData({ ...product });
    };

    const saveEdit = () => {
        if (!editingId || !editData) return;
        const updatedProducts = products.map(p => p.id === editingId ? { ...p, ...editData } as Product : p);
        onUpdateProducts(updatedProducts);
        setEditingId(null);
        setEditData({});
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditData({});
    };

    const handleDeleteProduct = (id: string) => {
        if (confirm('Delete this product?')) {
            onUpdateProducts(products.filter(p => p.id !== id));
        }
    };

    const lowStockProducts = products.filter(p => p.stock <= 1);
    const displayProducts = showLowStockOnly ? lowStockProducts : products;

    return (
        <div className="h-full bg-zinc-100 dark:bg-black font-sans text-zinc-900 dark:text-zinc-100 flex flex-col">
            {/* Header */}
            <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex-shrink-0">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={onBackToPos} className="flex items-center gap-2 text-zinc-500 hover:text-blue-600 text-sm font-medium">
                            <ArrowLeft size={18} /> Back to POS
                        </button>
                        <span className="text-zinc-300 dark:text-zinc-700">|</span>
                        <div className="flex items-center gap-2">
                            <Package size={20} className="text-blue-600" />
                            <h1 className="text-lg font-bold">Inventory Management</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Low Stock Filter Toggle */}
                        <button
                            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${showLowStockOnly
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                                }`}
                        >
                            <AlertTriangle size={16} />
                            {showLowStockOnly ? `Low Stock (${lowStockProducts.length})` : 'Show Low Stock'}
                        </button>

                        <button
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold"
                        >
                            <Plus size={16} /> Add Product
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Low Stock Warning Banner */}
                    {showLowStockOnly && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-3">
                                <AlertTriangle size={20} className="text-red-600" />
                                <div>
                                    <h3 className="font-bold text-red-700 dark:text-red-400">Showing Low/Out of Stock Items Only</h3>
                                    <p className="text-sm text-red-600 dark:text-red-500">Items with stock ≤ 1 need restocking</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add Product Form */}
                    {showAddForm && (
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-bold">Add New Product</h2>
                                <button onClick={() => setShowAddForm(false)} className="p-1 text-zinc-400 hover:text-zinc-600">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                <input
                                    type="text"
                                    placeholder="Product Name *"
                                    value={newProduct.name}
                                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                    className="col-span-2 text-sm p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:border-blue-500"
                                />
                                <select
                                    value={newProduct.category}
                                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                    className="text-sm p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:border-blue-500"
                                >
                                    <option value="Parts">Parts</option>
                                    <option value="Lubricants">Lubricants</option>
                                    <option value="Service">Service</option>
                                    <option value="Electrical">Electrical</option>
                                    <option value="Brakes">Brakes</option>
                                </select>
                                <input
                                    type="number"
                                    placeholder="Sell Price *"
                                    value={newProduct.price || ''}
                                    onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                                    className="text-sm p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:border-blue-500"
                                />
                                <input
                                    type="number"
                                    placeholder="Buy Price"
                                    value={newProduct.buyPrice || ''}
                                    onChange={e => setNewProduct({ ...newProduct, buyPrice: parseFloat(e.target.value) })}
                                    className="text-sm p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:border-blue-500"
                                />
                                <input
                                    type="number"
                                    placeholder="Stock Qty"
                                    value={newProduct.stock || ''}
                                    onChange={e => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
                                    className="text-sm p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={handleAddProduct}
                                    disabled={!newProduct.name || !newProduct.price}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-zinc-300 text-white rounded-lg text-sm font-bold"
                                >
                                    <Save size={16} /> Save Product
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Products Table */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-zinc-50 dark:bg-zinc-800">
                                <tr>
                                    <th className="text-left p-4 font-semibold text-zinc-500">ID</th>
                                    <th className="text-left p-4 font-semibold text-zinc-500">Product Name</th>
                                    <th className="text-left p-4 font-semibold text-zinc-500">Category</th>
                                    <th className="text-right p-4 font-semibold text-zinc-500">Sell Price</th>
                                    <th className="text-right p-4 font-semibold text-zinc-500">Buy Price</th>
                                    <th className="text-right p-4 font-semibold text-zinc-500">Stock</th>
                                    <th className="text-right p-4 font-semibold text-zinc-500">Margin</th>
                                    <th className="text-center p-4 font-semibold text-zinc-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-zinc-400">
                                            {showLowStockOnly ? 'No low stock items. Great!' : 'No products found.'}
                                        </td>
                                    </tr>
                                ) : (
                                    displayProducts.map(product => (
                                        <tr key={product.id} className={`border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${product.stock <= 1 ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                                            {editingId === product.id ? (
                                                <>
                                                    <td className="p-4 font-mono text-zinc-500">{product.id}</td>
                                                    <td className="p-4">
                                                        <input
                                                            type="text"
                                                            value={editData.name || ''}
                                                            onChange={e => setEditData({ ...editData, name: e.target.value })}
                                                            className="w-full p-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-blue-500 rounded outline-none"
                                                        />
                                                    </td>
                                                    <td className="p-4">
                                                        <select
                                                            value={editData.category || ''}
                                                            onChange={e => setEditData({ ...editData, category: e.target.value })}
                                                            className="p-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-blue-500 rounded outline-none"
                                                        >
                                                            <option value="Parts">Parts</option>
                                                            <option value="Lubricants">Lubricants</option>
                                                            <option value="Service">Service</option>
                                                            <option value="Electrical">Electrical</option>
                                                            <option value="Brakes">Brakes</option>
                                                        </select>
                                                    </td>
                                                    <td className="p-4">
                                                        <input
                                                            type="number"
                                                            value={editData.price || ''}
                                                            onChange={e => setEditData({ ...editData, price: parseFloat(e.target.value) })}
                                                            className="w-20 p-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-blue-500 rounded outline-none text-right"
                                                        />
                                                    </td>
                                                    <td className="p-4">
                                                        <input
                                                            type="number"
                                                            value={editData.buyPrice || ''}
                                                            onChange={e => setEditData({ ...editData, buyPrice: parseFloat(e.target.value) })}
                                                            className="w-20 p-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-blue-500 rounded outline-none text-right"
                                                        />
                                                    </td>
                                                    <td className="p-4">
                                                        <input
                                                            type="number"
                                                            value={editData.stock || ''}
                                                            onChange={e => setEditData({ ...editData, stock: parseInt(e.target.value) })}
                                                            className="w-16 p-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-blue-500 rounded outline-none text-right"
                                                        />
                                                    </td>
                                                    <td className="p-4 text-right">-</td>
                                                    <td className="p-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button onClick={saveEdit} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                                                                <Check size={16} />
                                                            </button>
                                                            <button onClick={cancelEdit} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="p-4 font-mono text-zinc-500">{product.id}</td>
                                                    <td className="p-4 font-semibold">
                                                        {product.name}
                                                        {product.stock <= 1 && (
                                                            <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                                                                {product.stock === 0 ? 'OUT' : 'LOW'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-xs font-medium">
                                                            {product.category}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right font-bold">৳{product.price}</td>
                                                    <td className="p-4 text-right text-zinc-500">৳{product.buyPrice}</td>
                                                    <td className="p-4 text-right">
                                                        <span className={`font-bold ${product.stock <= 1 ? 'text-red-500' : 'text-green-600'}`}>
                                                            {product.stock}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <span className="text-green-600 font-bold">
                                                            {((product.price - product.buyPrice) / product.price * 100).toFixed(0)}%
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button
                                                                onClick={() => startEditing(product)}
                                                                className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteProduct(product.id)}
                                                                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary */}
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                            <p className="text-xs text-zinc-500 mb-1">Total Products</p>
                            <p className="text-2xl font-black">{products.length}</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                            <p className="text-xs text-zinc-500 mb-1">Total Stock Value</p>
                            <p className="text-2xl font-black">৳{products.reduce((s, p) => s + (p.buyPrice * p.stock), 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                            <p className="text-xs text-zinc-500 mb-1">Potential Revenue</p>
                            <p className="text-2xl font-black text-green-600">৳{products.reduce((s, p) => s + (p.price * p.stock), 0).toLocaleString()}</p>
                        </div>
                        <button onClick={() => setShowLowStockOnly(!showLowStockOnly)} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:border-red-300 transition-colors text-left">
                            <p className="text-xs text-zinc-500 mb-1">Low/Out of Stock</p>
                            <p className="text-2xl font-black text-red-500">{lowStockProducts.length}</p>
                            <p className="text-xs text-blue-600 font-medium mt-1">Click to filter →</p>
                        </button>
                    </div>

                    <p className="mt-4 text-xs text-zinc-400 text-center">
                        Note: Changes are stored in memory only. They will reset on page refresh. Database integration coming soon.
                    </p>
                </div>
            </main>
        </div>
    );
}
