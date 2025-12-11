'use client';

import { CartItem } from '@/lib/api';
import { Trash2, ShoppingBag, CreditCard, User, Wrench, Banknote, ChevronDown, ChevronUp, Percent, Edit2, Check, X, Pause, Play } from 'lucide-react';
import { useState } from 'react';

interface CartProps {
    items: CartItem[];
    onUpdateQuantity: (id: string, delta: number) => void;
    onUpdatePrice: (id: string, newPrice: number) => void;
    onRemove: (id: string) => void;
    onCheckout: (details: { clientName: string; clientPhone: string; clientOdo: string; serviceCharge: number; paymentMethod: string; discount: number }) => void;
    onClearCart: () => void;
    onHoldOrder: () => void;
    heldOrdersCount: number;
    onRecallOrder: () => void;
}

export default function Cart({
    items,
    onUpdateQuantity,
    onUpdatePrice,
    onRemove,
    onCheckout,
    onClearCart,
    onHoldOrder,
    heldOrdersCount,
    onRecallOrder
}: CartProps) {
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [clientOdo, setClientOdo] = useState('');
    const [serviceCharge, setServiceCharge] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [showClientDetails, setShowClientDetails] = useState(false);
    const [discountPercent, setDiscountPercent] = useState('');
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editPrice, setEditPrice] = useState('');

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = subtotal * (parseFloat(discountPercent) || 0) / 100;
    const serviceChargeAmount = parseFloat(serviceCharge) || 0;
    const total = subtotal - discountAmount + serviceChargeAmount;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const handleCheckoutClick = () => {
        onCheckout({
            clientName,
            clientPhone,
            clientOdo,
            serviceCharge: serviceChargeAmount,
            paymentMethod,
            discount: discountAmount
        });
    };

    const startEditingPrice = (item: CartItem) => {
        setEditingItemId(item.id);
        setEditPrice(item.price.toString());
    };

    const saveEditedPrice = (id: string) => {
        const newPrice = parseFloat(editPrice);
        if (!isNaN(newPrice) && newPrice > 0) {
            onUpdatePrice(id, newPrice);
        }
        setEditingItemId(null);
        setEditPrice('');
    };

    const cancelEditingPrice = () => {
        setEditingItemId(null);
        setEditPrice('');
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800">
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ShoppingBag size={22} className="text-blue-600" />
                    <h2 className="text-base font-bold text-zinc-900 dark:text-white">Cart</h2>
                    <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
                        {itemCount}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {items.length > 0 && (
                        <>
                            <button
                                onClick={onHoldOrder}
                                className="p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg"
                                title="Hold Order (F8)"
                            >
                                <Pause size={16} />
                            </button>
                            <button onClick={onClearCart} className="text-sm text-red-500 hover:text-red-600 font-medium px-2">
                                Clear
                            </button>
                        </>
                    )}
                    {heldOrdersCount > 0 && (
                        <button
                            onClick={onRecallOrder}
                            className="flex items-center gap-1 p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg text-sm font-medium"
                            title="Recall Order (F9)"
                        >
                            <Play size={16} />
                            <span className="font-bold">{heldOrdersCount}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Collapsible Client Details */}
            <div className="border-b border-zinc-100 dark:border-zinc-800">
                <button
                    onClick={() => setShowClientDetails(!showClientDetails)}
                    className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                    <div className="flex items-center gap-2">
                        <User size={16} className="text-blue-500" />
                        <span>Client Details</span>
                        {clientName && <span className="text-blue-600 font-semibold">({clientName})</span>}
                    </div>
                    {showClientDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showClientDetails && (
                    <div className="px-4 pb-4 pt-2 grid grid-cols-2 gap-3">
                        <input
                            type="text"
                            value={clientName}
                            onChange={e => setClientName(e.target.value)}
                            placeholder="Name"
                            className="col-span-2 text-sm p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:border-blue-500"
                        />
                        <input
                            type="text"
                            value={clientPhone}
                            onChange={e => setClientPhone(e.target.value)}
                            placeholder="Phone"
                            className="text-sm p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:border-blue-500"
                        />
                        <input
                            type="text"
                            value={clientOdo}
                            onChange={e => setClientOdo(e.target.value)}
                            placeholder="Odometer"
                            className="text-sm p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:border-blue-500"
                        />
                    </div>
                )}
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                        <ShoppingBag size={48} className="mb-3 opacity-20" />
                        <p className="text-sm">Empty cart</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{item.name}</h4>

                                {/* Editable Price */}
                                {editingItemId === item.id ? (
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm text-zinc-500">৳</span>
                                        <input
                                            type="number"
                                            value={editPrice}
                                            onChange={e => setEditPrice(e.target.value)}
                                            className="w-20 text-sm p-1 bg-white dark:bg-zinc-900 border border-blue-500 rounded outline-none"
                                            autoFocus
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') saveEditedPrice(item.id);
                                                if (e.key === 'Escape') cancelEditingPrice();
                                            }}
                                        />
                                        <button onClick={() => saveEditedPrice(item.id)} className="text-green-600 hover:text-green-700">
                                            <Check size={16} />
                                        </button>
                                        <button onClick={cancelEditingPrice} className="text-red-500 hover:text-red-600">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm text-blue-600 font-bold">
                                            ৳{item.price} × {item.quantity} = ৳{(item.price * item.quantity).toLocaleString()}
                                        </span>
                                        <button
                                            onClick={() => startEditingPrice(item)}
                                            className="text-zinc-400 hover:text-blue-500"
                                            title="Edit price"
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                    <button
                                        onClick={() => onUpdateQuantity(item.id, -1)}
                                        className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-bold rounded-l-lg"
                                    >-</button>
                                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                    <button
                                        onClick={() => onUpdateQuantity(item.id, 1)}
                                        className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-bold rounded-r-lg"
                                    >+</button>
                                </div>
                                <button
                                    onClick={() => onRemove(item.id)}
                                    className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-red-500"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                {/* Service Charge, Discount %, Payment */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center gap-2 text-sm bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2">
                        <Wrench size={14} className="text-orange-500" />
                        <input
                            type="number"
                            value={serviceCharge}
                            onChange={e => setServiceCharge(e.target.value)}
                            placeholder="Service"
                            className="flex-1 w-full bg-transparent outline-none text-right font-medium"
                        />
                    </div>

                    {/* Discount % */}
                    <div className="flex items-center gap-2 text-sm bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2">
                        <Percent size={14} className="text-purple-500" />
                        <input
                            type="number"
                            value={discountPercent}
                            onChange={e => setDiscountPercent(e.target.value)}
                            placeholder="Disc %"
                            className="flex-1 w-full bg-transparent outline-none text-right font-medium"
                            max="100"
                        />
                    </div>

                    <div className="flex items-center gap-2 text-sm bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2">
                        <Banknote size={14} className="text-green-500" />
                        <select
                            value={paymentMethod}
                            onChange={e => setPaymentMethod(e.target.value)}
                            className="flex-1 w-full bg-transparent outline-none text-right font-bold appearance-none"
                        >
                            <option value="Cash">Cash</option>
                            <option value="bKash">bKash</option>
                            <option value="Card">Card</option>
                        </select>
                    </div>
                </div>

                {/* Totals Breakdown */}
                <div className="text-sm space-y-1 py-3 border-t border-b border-zinc-200 dark:border-zinc-700">
                    <div className="flex justify-between text-zinc-500">
                        <span>Subtotal</span>
                        <span>৳{subtotal.toLocaleString()}</span>
                    </div>
                    {discountAmount > 0 && (
                        <div className="flex justify-between text-purple-600">
                            <span>Discount ({discountPercent}%)</span>
                            <span>-৳{discountAmount.toLocaleString()}</span>
                        </div>
                    )}
                    {serviceChargeAmount > 0 && (
                        <div className="flex justify-between text-orange-600">
                            <span>Service Charge</span>
                            <span>+৳{serviceChargeAmount.toLocaleString()}</span>
                        </div>
                    )}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center">
                    <span className="text-base text-zinc-600 dark:text-zinc-400 font-medium">Total</span>
                    <span className="font-black text-2xl text-zinc-900 dark:text-white">৳{total.toLocaleString()}</span>
                </div>

                {/* CHECKOUT */}
                <button
                    onClick={handleCheckoutClick}
                    disabled={items.length === 0}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-emerald-500/30 transition-all active:scale-98"
                >
                    <CreditCard size={20} />
                    COMPLETE SALE
                </button>
            </div>
        </div>
    );
}
