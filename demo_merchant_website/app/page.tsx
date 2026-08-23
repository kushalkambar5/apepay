'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { ProductGrid } from '../components/ProductGrid';
import { CartDrawer, CartItem } from '../components/CartDrawer';
import { SettingsModal } from '../components/SettingsModal';
import { WebhookLogsModal } from '../components/WebhookLogsModal';
import { Footer } from '../components/Footer';
import { Product } from '../lib/products';
import { Check } from 'lucide-react';

export default function Home() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWebhookLogsOpen, setIsWebhookLogsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ApePay API configuration state
  const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_MERCHANT_API_KEY || 'ape_live_769de3548d175ad468df920756399af2fe4f6223669b822b');
  const [backendUrl, setBackendUrl] = useState(process.env.NEXT_PUBLIC_APEPAY_API_URL || 'http://localhost:4000');
  const [checkoutFrontendUrl, setCheckoutFrontendUrl] = useState(process.env.NEXT_PUBLIC_APEPAY_CHECKOUT_URL || 'http://localhost:3000');
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'testing'>('testing');

  // Check API health on mount or settings update
  const checkApiHealth = async (): Promise<boolean> => {
    setApiStatus('testing');
    try {
      const res = await fetch(`${backendUrl}/v1/payments/health-check-fake-id`, {
        headers: { 'x-api-key': apiKey },
      });
      // If server responds with 200 or 404 (route exists), connection is online!
      if (res.status === 200 || res.status === 404 || res.status === 401) {
        setApiStatus('connected');
        return true;
      }
      setApiStatus('disconnected');
      return false;
    } catch {
      setApiStatus('disconnected');
      return false;
    }
  };

  useEffect(() => {
    checkApiHealth();
  }, [backendUrl, apiKey]);

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    setToastMessage(`Added "${product.name}" to cart`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const addedProductIds = cartItems.map((item) => item.product.id);

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 rounded-full border border-[#ebebeb] bg-[#171717] px-4 py-2.5 text-xs font-medium text-white shadow-modal animate-in fade-in slide-in-from-bottom-5">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenWebhookLogs={() => setIsWebhookLogsOpen(true)}
        apiStatus={apiStatus}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Hero Section */}
      <main className="flex-1">
        <Hero
          onBrowseClick={() => {
            const el = document.getElementById('products-catalog');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Product Catalog Grid */}
        <ProductGrid
          onAddToCart={handleAddToCart}
          addedProductIds={addedProductIds}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </main>

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        apiKey={apiKey}
        backendUrl={backendUrl}
        checkoutFrontendUrl={checkoutFrontendUrl}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={setApiKey}
        backendUrl={backendUrl}
        onSaveBackendUrl={setBackendUrl}
        checkoutFrontendUrl={checkoutFrontendUrl}
        onSaveCheckoutFrontendUrl={setCheckoutFrontendUrl}
        onTestConnection={checkApiHealth}
      />

      {/* Webhook Logs Modal */}
      <WebhookLogsModal
        isOpen={isWebhookLogsOpen}
        onClose={() => setIsWebhookLogsOpen(false)}
      />

      {/* Footer */}
      <Footer
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenWebhookLogs={() => setIsWebhookLogsOpen(true)}
      />
    </div>
  );
}
