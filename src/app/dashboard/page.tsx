'use client';

import { useState, useEffect } from 'react';
import {
    getDashboardStats,
    getRecentTransactions,
    getTopItems,
    Stat,
    Transaction,
    Reminder
} from '@/lib/api';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Package,
    Clock,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    X,
    Eye,
    Bell,
    Phone,
    MessageCircle,
    CheckCircle,
    AlertTriangle,
    ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const [stats, setStats] = useState<Stat[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [topItems, setTopItems] = useState<{ name: string; sold: number; revenue: number }[]>([]);
    const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('today');
    const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [showReminders, setShowReminders] = useState(false);

    useEffect(() => {
        getDashboardStats().then(setStats);
        getRecentTransactions().then(setTransactions);
        getTopItems().then(setTopItems);

        // Load reminders from localStorage
        const savedReminders = localStorage.getItem('ovro_reminders');
        if (savedReminders) {
            setReminders(JSON.parse(savedReminders));
        }
    }, []);

    const getDueReminders = () => {
        const today = new Date();
        return reminders.filter(r => {
            const dueDate = new Date(r.dueDate);
            return r.status === 'pending' && dueDate <= today;
        });
    };

    const markReminderComplete = (id: string) => {
        const updated = reminders.map(r => r.id === id ? { ...r, status: 'completed' as const } : r);
        setReminders(updated);
        localStorage.setItem('ovro_reminders', JSON.stringify(updated));
    };

    const snoozeReminder = (id: string, days: number) => {
        const updated = reminders.map(r => {
            if (r.id === id) {
                const newDue = new Date();
                newDue.setDate(newDue.getDate() + days);
                return { ...r, dueDate: newDue.toISOString().split('T')[0] };
            }
            return r;
        });
        setReminders(updated);
        localStorage.setItem('ovro_reminders', JSON.stringify(updated));
    };

    const sendWhatsApp = (phone: string, clientName: string, product: string) => {
        // Format phone for BD (remove leading 0, add 88)
        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '88' + formattedPhone;
        } else if (!formattedPhone.startsWith('88')) {
            formattedPhone = '88' + formattedPhone;
        }

        const message = encodeURIComponent(
            `Assalamu Alaikum ${clientName}!\n\nThis is Ovro Motors. It's time for your ${product} service. Would you like to schedule a visit?\n\nCall us: 01700-000000`
        );

        window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
    };

    const getIcon = (label: string) => {
        if (label.includes('Sales')) return <DollarSign size={20} className="text-blue-500" />;
        if (label.includes('Profit')) return <TrendingUp size={20} className="text-green-500" />;
        if (label.includes('Expenses')) return <TrendingDown size={20} className="text-red-500" />;
        return <Package size={20} className="text-orange-500" />;
    };

    const dueReminders = getDueReminders();

    return (
        <div className="min-h-screen bg-zinc-100 dark:bg-black font-sans text-zinc-900 dark:text-zinc-100">
            {/* Header */}
            <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-xl font-black text-zinc-900 dark:text-white">
                            Ovro<span className="text-blue-600">POS</span>
                        </Link>
                        <span className="text-zinc-300 dark:text-zinc-700">|</span>
                        <h1 className="text-base font-bold text-zinc-600 dark:text-zinc-400">Owner Dashboard</h1>
                    </div>

                    {/* Reminder Bell */}
                    <button
                        onClick={() => setShowReminders(true)}
                        className="relative p-2 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg"
                    >
                        <Bell size={22} />
                        {dueReminders.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {dueReminders.length}
                            </span>
                        )}
                    </button>

                    {/* Time Filter */}
                    <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                        {(['today', 'week', 'month'] as const).map(filter => (
                            <button
                                key={filter}
                                onClick={() => setTimeFilter(filter)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${timeFilter === filter
                                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                                        : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                                    }`}
                            >
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="text-sm text-zinc-500 font-medium">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                </div>
            </header>

            {/* Due Reminders Alert */}
            {dueReminders.length > 0 && (
                <div className="max-w-7xl mx-auto px-6 pt-4">
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell size={20} className="text-orange-600" />
                                <span className="font-bold text-orange-700 dark:text-orange-400">
                                    {dueReminders.length} Follow-up Reminder{dueReminders.length > 1 ? 's' : ''} Due!
                                </span>
                            </div>
                            <button
                                onClick={() => setShowReminders(true)}
                                className="text-sm font-medium text-orange-600 hover:text-orange-700"
                            >
                                View All →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            className={`bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 ${stat.label.includes('Low Stock') ? 'cursor-pointer hover:border-red-300 transition-colors' : ''
                                }`}
                            onClick={() => {
                                if (stat.label.includes('Low Stock')) {
                                    window.location.href = '/inventory?filter=lowstock';
                                }
                            }}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                                    {getIcon(stat.label)}
                                </div>
                                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">{stat.label}</span>
                            </div>
                            <p className="text-2xl font-black">{stat.value}</p>
                            <div className={`text-xs mt-2 flex items-center gap-1 ${stat.positive ? 'text-green-600' : 'text-red-500'}`}>
                                {stat.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stat.trend}
                                {stat.label.includes('Low Stock') && (
                                    <span className="ml-2 text-blue-600 font-medium">Click to view →</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Top Selling Items */}
                    <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <BarChart3 size={20} className="text-blue-500" />
                            <h2 className="text-base font-bold">Top Selling Items</h2>
                            <span className="text-xs text-zinc-400 ml-auto">This {timeFilter}</span>
                        </div>
                        <div className="space-y-3">
                            {topItems.map((item, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <span className="w-8 h-8 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-bold">
                                        {i + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate">{item.name}</p>
                                        <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-1">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                                                style={{ width: `${(item.sold / topItems[0].sold) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">৳{item.revenue.toLocaleString()}</p>
                                        <p className="text-xs text-zinc-500">{item.sold} sold</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl p-5 text-white">
                        <h2 className="text-base font-bold mb-4">Quick Summary</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-400">Total Transactions</span>
                                <span className="text-xl font-bold">{transactions.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-400">Avg Transaction</span>
                                <span className="text-xl font-bold">৳{transactions.length > 0 ? Math.round(transactions.reduce((s, t) => s + t.total, 0) / transactions.length).toLocaleString() : 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-400">Total Revenue</span>
                                <span className="text-xl font-bold text-green-400">৳{transactions.reduce((s, t) => s + t.total, 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-400">Pending Follow-ups</span>
                                <span className="text-xl font-bold text-orange-400">{reminders.filter(r => r.status === 'pending').length}</span>
                            </div>
                        </div>
                        <Link href="/pos" className="mt-6 block w-full text-center bg-white text-zinc-900 py-3 rounded-xl font-bold hover:bg-zinc-100 transition-colors">
                            Go to POS
                        </Link>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Clock size={20} className="text-zinc-500" />
                            <h2 className="text-base font-bold">Recent Transactions</h2>
                        </div>
                        <span className="text-xs text-zinc-500">Click to view details</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                                    <th className="text-left py-3 font-semibold text-zinc-500">ID</th>
                                    <th className="text-left py-3 font-semibold text-zinc-500">Time</th>
                                    <th className="text-left py-3 font-semibold text-zinc-500">Customer</th>
                                    <th className="text-center py-3 font-semibold text-zinc-500">Items</th>
                                    <th className="text-right py-3 font-semibold text-zinc-500">Total</th>
                                    <th className="text-right py-3 font-semibold text-zinc-500">Profit</th>
                                    <th className="text-right py-3 font-semibold text-zinc-500">Payment</th>
                                    <th className="text-center py-3 font-semibold text-zinc-500">View</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((txn) => (
                                    <tr
                                        key={txn.id}
                                        className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer"
                                        onClick={() => setSelectedTxn(txn)}
                                    >
                                        <td className="py-3 font-mono text-zinc-500">{txn.id}</td>
                                        <td className="py-3">
                                            <span className="font-medium">{txn.time}</span>
                                            <span className="text-zinc-400 ml-2 text-xs">{txn.date === new Date().toISOString().split('T')[0] ? 'Today' : 'Yesterday'}</span>
                                        </td>
                                        <td className="py-3 font-semibold">{txn.customer}</td>
                                        <td className="py-3 text-center font-medium">{txn.items}</td>
                                        <td className="py-3 text-right font-bold">৳{txn.total.toLocaleString()}</td>
                                        <td className="py-3 text-right text-green-600 font-bold">+৳{txn.profit}</td>
                                        <td className="py-3 text-right">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${txn.paymentMethod === 'Cash' ? 'bg-green-100 text-green-700' :
                                                    txn.paymentMethod === 'bKash' ? 'bg-pink-100 text-pink-700' :
                                                        'bg-blue-100 text-blue-700'
                                                }`}>
                                                {txn.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="py-3 text-center">
                                            <button className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg">
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Transaction Detail Modal */}
            {selectedTxn && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800">
                            <h2 className="text-lg font-bold">Transaction Details</h2>
                            <button onClick={() => setSelectedTxn(null)} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-zinc-500 mb-1">Transaction ID</p>
                                    <p className="font-mono font-bold">{selectedTxn.id}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500 mb-1">Date & Time</p>
                                    <p className="font-medium">{selectedTxn.date} at {selectedTxn.time}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500 mb-1">Customer</p>
                                    <p className="font-semibold">{selectedTxn.customer}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500 mb-1">Payment Method</p>
                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${selectedTxn.paymentMethod === 'Cash' ? 'bg-green-100 text-green-700' :
                                            selectedTxn.paymentMethod === 'bKash' ? 'bg-pink-100 text-pink-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>
                                        {selectedTxn.paymentMethod}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Items Sold</span>
                                    <span className="font-bold">{selectedTxn.items}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Total Amount</span>
                                    <span className="font-bold text-lg">৳{selectedTxn.total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-zinc-200 dark:border-zinc-700">
                                    <span className="text-zinc-500">Profit</span>
                                    <span className="font-bold text-green-600">+৳{selectedTxn.profit.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t border-zinc-200 dark:border-zinc-800">
                            <button
                                onClick={() => setSelectedTxn(null)}
                                className="w-full bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white py-3 rounded-xl font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reminders Modal */}
            {showReminders && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center gap-3">
                                <Bell size={20} className="text-orange-500" />
                                <h2 className="text-lg font-bold">Follow-up Reminders</h2>
                            </div>
                            <button onClick={() => setShowReminders(false)} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-3">
                            {reminders.filter(r => r.status === 'pending').length === 0 ? (
                                <div className="text-center py-8 text-zinc-400">
                                    <Bell size={40} className="mx-auto mb-3 opacity-20" />
                                    <p>No pending reminders</p>
                                    <p className="text-xs mt-1">Reminders are created automatically when you sell Engine Oil, Filters, etc.</p>
                                </div>
                            ) : (
                                reminders.filter(r => r.status === 'pending').map(reminder => {
                                    const isOverdue = new Date(reminder.dueDate) <= new Date();
                                    return (
                                        <div key={reminder.id} className={`p-4 rounded-xl border ${isOverdue ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' : 'bg-zinc-50 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700'}`}>
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h4 className="font-bold">{reminder.clientName}</h4>
                                                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                                                        <Phone size={10} /> {reminder.clientPhone}
                                                    </p>
                                                </div>
                                                {isOverdue && (
                                                    <span className="flex items-center gap-1 text-xs font-bold text-red-600">
                                                        <AlertTriangle size={12} /> Overdue
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-sm mb-2">
                                                <span className="font-medium">{reminder.product}</span>
                                                <span className="text-zinc-500"> • Sold on {new Date(reminder.saleDate).toLocaleDateString()}</span>
                                            </p>

                                            <p className="text-xs text-zinc-500 mb-3">
                                                Due: {new Date(reminder.dueDate).toLocaleDateString()}
                                            </p>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => sendWhatsApp(reminder.clientPhone, reminder.clientName, reminder.product)}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs font-bold"
                                                >
                                                    <MessageCircle size={14} /> WhatsApp
                                                </button>
                                                <button
                                                    onClick={() => snoozeReminder(reminder.id, 7)}
                                                    className="px-3 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg text-xs font-medium"
                                                >
                                                    +7 Days
                                                </button>
                                                <button
                                                    onClick={() => markReminderComplete(reminder.id)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                    title="Mark as done"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="p-5 border-t border-zinc-200 dark:border-zinc-800">
                            <button
                                onClick={() => setShowReminders(false)}
                                className="w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 py-3 rounded-xl font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
