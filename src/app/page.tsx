'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Product, CartItem, getProducts, processSale } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Cart from '@/components/Cart';
import Receipt from '@/components/Receipt';
import ManualItem from '@/components/ManualItem';
import UpdateNotification from '@/components/UpdateNotification';
import InventoryView from '@/components/InventoryView';
import { Search, PenLine, Package, Barcode, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

interface HeldOrder {
  id: string;
  items: CartItem[];
  clientName: string;
  timestamp: Date;
}

export default function Home() {
  const [view, setView] = useState<'POS' | 'INVENTORY'>('POS');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showReceipt, setShowReceipt] = useState(false);
  const [showManualItem, setShowManualItem] = useState(false);
  const [lastOrderId, setLastOrderId] = useState('');
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
  const [skuInput, setSkuInput] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const skuInputRef = useRef<HTMLInputElement>(null);

  const [checkoutDetails, setCheckoutDetails] = useState({
    clientName: '',
    clientPhone: '',
    clientOdo: '',
    serviceCharge: 0,
    paymentMethod: 'Cash',
    discount: 0
  });

  useEffect(() => {
    getProducts().then(data => {
      setProducts(data);
      setFilteredProducts(data);
    });
  }, []);

  useEffect(() => {
    let result = products;
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    }
    setFilteredProducts(result);
  }, [products, selectedCategory, searchQuery]);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const updatePrice = (id: string, newPrice: number) => {
    setCart(prev => prev.map(item =>
      item.id === id ? { ...item, price: newPrice } : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const holdOrder = () => {
    if (cart.length === 0) return;
    const heldOrder: HeldOrder = {
      id: `HOLD-${Date.now()}`,
      items: [...cart],
      clientName: 'Customer',
      timestamp: new Date()
    };
    setHeldOrders(prev => [...prev, heldOrder]);
    setCart([]);
  };

  const recallOrder = () => {
    if (heldOrders.length === 0) return;
    const lastHeld = heldOrders[heldOrders.length - 1];
    setCart(lastHeld.items);
    setHeldOrders(prev => prev.slice(0, -1));
  };

  const handleSkuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skuInput.trim()) return;

    const product = products.find(p =>
      p.id.toLowerCase() === skuInput.toLowerCase() ||
      p.name.toLowerCase().includes(skuInput.toLowerCase())
    );

    if (product) {
      addToCart(product);
      setSkuInput('');
    }
  };

  const handleCheckout = async (details: { clientName: string; clientPhone: string; clientOdo: string; serviceCharge: number; paymentMethod: string; discount: number }) => {
    if (cart.length === 0) return;
    setCheckoutDetails(details);
    await processSale(cart);

    // Auto-create reminders for follow-up products
    if (details.clientName && details.clientPhone) {
      const followupProducts = [
        { keyword: 'oil', days: 60 },
        { keyword: 'filter', days: 90 },
        { keyword: 'brake', days: 180 },
        { keyword: 'chain', days: 120 },
        { keyword: 'service', days: 60 },
      ];

      const existingReminders = JSON.parse(localStorage.getItem('ovro_reminders') || '[]');
      const newReminders: Array<{ id: string; clientName: string; clientPhone: string; product: string; saleDate: string; dueDate: string; status: 'pending' }> = [];

      cart.forEach(item => {
        const matchedProduct = followupProducts.find(fp =>
          item.name.toLowerCase().includes(fp.keyword)
        );

        if (matchedProduct) {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + matchedProduct.days);

          newReminders.push({
            id: `REM-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            clientName: details.clientName,
            clientPhone: details.clientPhone,
            product: item.name,
            saleDate: new Date().toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
            status: 'pending'
          });
        }
      });

      if (newReminders.length > 0) {
        localStorage.setItem('ovro_reminders', JSON.stringify([...existingReminders, ...newReminders]));
      }
    }

    setLastOrderId(Math.random().toString(36).substr(2, 9).toUpperCase());
    setShowReceipt(true);
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setCart([]);
    setCheckoutDetails({ clientName: '', clientPhone: '', clientOdo: '', serviceCharge: 0, paymentMethod: 'Cash', discount: 0 });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      if (e.key === 'F1' || e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      if (e.key === 'F2') {
        e.preventDefault();
        setShowManualItem(true);
      }

      if (e.key === 'F3') {
        e.preventDefault();
        skuInputRef.current?.focus();
      }

      if (e.key === 'F8') {
        e.preventDefault();
        holdOrder();
      }

      if (e.key === 'F9') {
        e.preventDefault();
        recallOrder();
      }

      if (e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        const checkoutBtn = document.querySelector('[data-checkout-btn]') as HTMLButtonElement;
        checkoutBtn?.click();
      }

      if (e.key === 'Escape') {
        setShowManualItem(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart]);

  if (view === 'INVENTORY') {
    return <InventoryView onBackToPos={() => setView('POS')} />;
  }

  return (
    <div className="flex h-screen bg-zinc-100 dark:bg-black overflow-hidden font-sans text-zinc-900 dark:text-zinc-100">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="px-4 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center gap-3">
          <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white flex-shrink-0">
            Ovro<span className="text-blue-600">POS</span>
          </span>

          {/* SKU Quick Add */}
          <form onSubmit={handleSkuSubmit} className="relative w-36">
            <Barcode className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              ref={skuInputRef}
              type="text"
              placeholder="SKU (F3)"
              value={skuInput}
              onChange={(e) => setSkuInput(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </form>

          {/* Search */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products... (F1)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowManualItem(true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <PenLine size={16} /> Manual (F2)
            </button>
            <button
              onClick={() => setView('INVENTORY')}
              className="flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors"
            >
              <Package size={16} /> Stock
            </button>
            {/* Dashboard button - opens WebView in Electron */}
            {typeof window !== 'undefined' && (window as any).electronAPI?.isElectron ? (
              <button
                onClick={() => (window as any).electronAPI.openDashboard()}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <LayoutDashboard size={16} /> Dashboard
              </button>
            ) : (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>
            )}
          </div>
        </header>

        {/* Category Filters */}
        <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 flex gap-2 overflow-x-auto no-scrollbar bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-black'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid - BIGGER */}
        <main className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        </main>
      </div>

      {/* Sidebar Cart - WIDER */}
      <div className="w-96 flex-shrink-0">
        <Cart
          items={cart}
          onUpdateQuantity={updateQuantity}
          onUpdatePrice={updatePrice}
          onRemove={removeFromCart}
          onCheckout={handleCheckout}
          onClearCart={clearCart}
          onHoldOrder={holdOrder}
          heldOrdersCount={heldOrders.length}
          onRecallOrder={recallOrder}
        />
      </div>

      {/* Modals */}
      {showManualItem && (
        <ManualItem
          onAddItem={addToCart}
          onClose={() => setShowManualItem(false)}
        />
      )}

      {showReceipt && (
        <Receipt
          items={cart}
          subtotal={cart.reduce((s, i) => s + (i.price * i.quantity), 0)}
          serviceCharge={checkoutDetails.serviceCharge}
          discount={checkoutDetails.discount}
          total={cart.reduce((s, i) => s + (i.price * i.quantity), 0) - checkoutDetails.discount + checkoutDetails.serviceCharge}
          clientDetails={checkoutDetails}
          date={new Date().toLocaleDateString()}
          orderId={lastOrderId}
          onClose={handleCloseReceipt}
        />
      )}

      {/* Update Notification for Electron */}
      <UpdateNotification />
    </div>
  );
}
