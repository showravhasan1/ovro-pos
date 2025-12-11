'use client';

import { CartItem } from '@/lib/api';
import { CheckCircle, X, Home } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ReceiptProps {
    items: CartItem[];
    total: number;
    subtotal: number;
    serviceCharge: number;
    discount: number;
    clientDetails: {
        clientName: string;
        clientPhone: string;
        clientOdo: string;
        paymentMethod: string;
    };
    date: string;
    orderId: string;
    onClose: () => void;
}

export default function Receipt({ items, total, subtotal, serviceCharge, discount, clientDetails, date, orderId, onClose }: ReceiptProps) {
    const [printTime, setPrintTime] = useState('');

    useEffect(() => {
        setPrintTime(new Date().toLocaleString('en-US', { hour12: true }));
    }, []);

    const handleGoHome = () => {
        window.location.href = '/';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            {/* Screen View */}
            <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300 my-8 print:hidden relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
                        <CheckCircle size={36} />
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900">Sale Complete!</h2>
                    <p className="text-zinc-500 text-sm mt-1">Order #{orderId}</p>
                </div>

                {/* Quick Summary */}
                <div className="bg-zinc-50 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-zinc-500">Items</span>
                        <span className="font-medium">{items.length}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-zinc-500">Payment</span>
                        <span className="font-medium">{clientDetails.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-zinc-200">
                        <span className="font-bold">Total</span>
                        <span className="font-black text-xl text-emerald-600">৳{total.toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleGoHome}
                        className="flex-1 flex items-center justify-center gap-2 bg-zinc-100 text-zinc-700 py-3 rounded-xl font-medium hover:bg-zinc-200 transition-colors"
                    >
                        <Home size={18} /> Home
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex-1 bg-zinc-900 text-white py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors"
                    >
                        Print Receipt
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                    >
                        New Sale
                    </button>
                </div>
            </div>

            {/* Thermal Receipt (Print Only) */}
            <div id="receipt-print-area" className="hidden print:block bg-white text-black font-mono text-[12px] leading-tight max-w-[80mm] mx-auto p-0">
                <div className="text-center mb-2">
                    <h1 className="text-xl font-bold mb-1">OVRO MOTORS</h1>
                    <p className="text-[10px]">Professional Motorcycle Workshop</p>
                    <p className="text-[10px]">Dhaka, Bangladesh</p>
                    <p className="text-[10px]">Hotline: 01700-000000</p>
                </div>

                <div className="text-center mb-2 border-b border-black pb-2 border-dashed">
                    <p className="font-bold text-sm">MONEY RECEIPT</p>
                </div>

                <div className="mb-2 text-[10px]">
                    <div className="flex justify-between">
                        <span>Date: {printTime}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Inv No: {orderId}</span>
                        <span>Sold By: Manager</span>
                    </div>
                </div>

                <div className="border-b border-black border-dashed mb-2"></div>

                {(clientDetails.clientName || clientDetails.clientPhone) && (
                    <div className="mb-2 text-[11px]">
                        {clientDetails.clientName && <p>Name: {clientDetails.clientName}</p>}
                        {clientDetails.clientPhone && <p>Cell: {clientDetails.clientPhone}</p>}
                        {clientDetails.clientOdo && <p>Odo: {clientDetails.clientOdo} km</p>}
                    </div>
                )}

                <div className="border-b border-black border-dashed mb-2"></div>

                <div className="flex justify-between font-bold mb-1 text-[11px]">
                    <span className="flex-1">Item</span>
                    <span className="w-8 text-center">Qty</span>
                    <span className="w-16 text-right">Amount</span>
                </div>

                <div className="border-b border-black border-dashed mb-2"></div>

                <div className="flex flex-col gap-1 mb-2">
                    {items.map((item) => (
                        <div key={item.id} className="flex flex-col">
                            <div className="flex justify-between items-start">
                                <span className="flex-1 font-bold">{item.name}</span>
                                <span className="w-16 text-right font-bold">৳{item.price * item.quantity}</span>
                            </div>
                            <div className="pl-2 text-[10px] text-gray-600">
                                Qty: {item.quantity} x ৳{item.price}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-b border-black border-dashed mb-2"></div>

                <div className="flex flex-col gap-1 text-[12px] mb-2">
                    <div className="flex justify-between">
                        <span>Sub Total:</span>
                        <span>৳{subtotal.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-red-600">
                            <span>Discount:</span>
                            <span>-৳{discount.toLocaleString()}</span>
                        </div>
                    )}
                    {serviceCharge > 0 && (
                        <div className="flex justify-between">
                            <span>Service Charge:</span>
                            <span>৳{serviceCharge.toLocaleString()}</span>
                        </div>
                    )}
                    <div className="border-t border-b border-black py-1 mt-1 font-bold text-sm flex justify-between">
                        <span>NET TOTAL:</span>
                        <span>৳{total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mt-1 text-[11px]">
                        <span>Pay Mode:</span>
                        <span className="font-bold uppercase">{clientDetails.paymentMethod || 'CASH'}</span>
                    </div>
                </div>

                <div className="border-b border-black border-dashed mb-4"></div>

                <div className="text-center text-[10px] space-y-1">
                    <p>*** ELECTRICAL GOODS NO RETURN ***</p>
                    <p>Thank you for choosing Ovro Motors!</p>
                    <p>Visit: facebook.com/ovromotors</p>
                    <p className="mt-4 text-[9px]">Software by Ovro Cloud POS</p>
                </div>
            </div>
        </div>
    );
}
