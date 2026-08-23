'use client';

import React, { useState } from 'react';
import { Product } from '../lib/products';
import { createApePayPayment, ApePayClientError } from '../lib/apepay-client';
import { X, Trash2, Plus, Minus, ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  apiKey: string;
  backendUrl: string;
  checkoutFrontendUrl: string;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  apiKey,
  backendUrl,
  checkoutFrontendUrl,
}: CartDrawerProps) {
  const [customerEmail, setCustomerEmail] = useState('alex.vance@example.com');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate totals
  const totalEth = items
    .reduce((sum, item) => sum + parseFloat(item.product.priceEth) * item.quantity, 0)
    .toFixed(4);

  const totalUsd = items
    .reduce((sum, item) => sum + item.product.priceUsd * item.quantity, 0)
    .toFixed(2);

  const handleCheckoutWithApePay = async () => {
    if (items.length === 0) return;

    setIsCheckingOut(true);
    setCheckoutError(null);

    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const storeBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';

    try {
      const response = await createApePayPayment(
        {
          amount: totalEth,
          currency: 'ETH',
          orderId: orderId,
          redirectUrl: `${storeBaseUrl}/order-success?orderId=${orderId}`,
          webhookUrl: `${storeBaseUrl}/api/webhooks/apepay`,
          metadata: {
            storeName: 'ApeGear Store',
            customerEmail,
            itemsCount: items.length,
            items: items.map((i) => ({
              id: i.product.id,
              name: i.product.name,
              sku: i.product.sku,
              quantity: i.quantity,
              priceEth: i.product.priceEth,
            })),
          },
        },
        {
          apiKey,
          backendUrl,
          checkoutFrontendUrl,
        }
      );

      console.log('[Cart] ApePay Payment session created:', response);

      // Redirect customer to ApePay hosted checkout URL
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        throw new Error('ApePay response did not return a valid checkoutUrl');
      }
    } catch (err: any) {
      console.error('[Cart] ApePay Checkout error:', err);
      setCheckoutError(err.message || 'Failed to initialize ApePay checkout session');
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-modal border-l border-[#ebebeb] flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#ebebeb] px-6 py-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-[#171717]">Shopping Cart</h2>
              <span className="rounded-full bg-[#fafafa] border border-[#ebebeb] px-2.5 py-0.5 font-mono-tech text-xs text-[#888888]">
                {items.length} items
              </span>
            </div>

            <button
              onClick={onClose}
              className="rounded-full border border-[#ebebeb] bg-[#fafafa] p-1.5 text-[#4d4d4d] hover:bg-[#ebebeb] hover:text-[#171717] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.length > 0 ? (
              items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex items-center space-x-4 rounded-xl border border-[#ebebeb] bg-[#fafafa]/50 p-3 shadow-stacked-sm"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-16 w-16 rounded-lg object-cover border border-[#ebebeb] shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-[#171717] truncate">
                      {product.name}
                    </h4>
                    <div className="mt-0.5 font-mono-tech text-xs font-bold text-[#171717]">
                      {product.priceEth} ETH
                    </div>

                    {/* Quantity Controls */}
                    <div className="mt-2 flex items-center space-x-2">
                      <button
                        onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                        className="flex h-5 w-5 items-center justify-center rounded border border-[#ebebeb] bg-white text-[#171717] hover:bg-[#fafafa]"
                      >
                        <Minus className="h-3 w-3" />
                      </button>

                      <span className="font-mono-tech text-xs font-medium text-[#171717] px-1">
                        {quantity}
                      </span>

                      <button
                        onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                        className="flex h-5 w-5 items-center justify-center rounded border border-[#ebebeb] bg-white text-[#171717] hover:bg-[#fafafa]"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(product.id)}
                    className="p-1 text-[#888888] hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <p className="text-sm font-medium text-[#171717]">Your cart is empty</p>
                <p className="mt-1 text-xs text-[#888888]">Add items from the store to test ApePay checkout.</p>
              </div>
            )}
          </div>

          {/* Footer & ApePay Checkout Section */}
          {items.length > 0 && (
            <div className="border-t border-[#ebebeb] bg-[#fafafa] px-6 py-5 space-y-4">
              {/* Customer Email Input */}
              <div>
                <label className="block text-[11px] font-semibold text-[#4d4d4d] uppercase tracking-wider font-mono-tech mb-1">
                  Customer Email (for receipt)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full rounded-lg border border-[#ebebeb] bg-white px-3 py-2 text-xs text-[#171717] focus:border-[#171717] focus:outline-none"
                />
              </div>

              {/* Subtotal & Total Display */}
              <div className="space-y-1.5 border-t border-[#ebebeb] pt-3">
                <div className="flex justify-between text-xs text-[#4d4d4d]">
                  <span>Subtotal</span>
                  <span className="font-mono-tech">{totalEth} ETH</span>
                </div>
                <div className="flex justify-between text-xs text-[#4d4d4d]">
                  <span>Network Fee (Estimated)</span>
                  <span className="font-mono-tech text-emerald-600">Free (Layer 2 zkBob)</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#171717] pt-1 border-t border-[#ebebeb]">
                  <span>Total Amount</span>
                  <div className="text-right">
                    <span className="font-mono-tech">{totalEth} ETH</span>
                    <div className="text-[10px] font-normal text-[#888888]">
                      ~${totalUsd} USD
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy Shield Banner */}
              <div className="flex items-start space-x-2.5 rounded-lg border border-[#ebebeb] bg-white p-3 text-xs text-[#4d4d4d]">
                <ShieldCheck className="h-4 w-4 text-[#0070f3] shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  <strong className="text-[#171717]">Privacy-Shielded Checkout</strong>
                  <p className="text-[#888888] mt-0.5">
                    ApePay generates a zero-knowledge commitment note to protect your transaction privacy.
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {checkoutError && (
                <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{checkoutError}</span>
                </div>
              )}

              {/* Primary ApePay Checkout CTA Button */}
              <button
                onClick={handleCheckoutWithApePay}
                disabled={isCheckingOut}
                className="w-full flex items-center justify-center space-x-2 rounded-full bg-[#171717] px-6 py-3.5 text-sm font-medium text-white shadow-stacked-md hover:bg-[#333333] active:scale-[0.99] transition-all disabled:opacity-75"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Connecting to ApePay...</span>
                  </>
                ) : (
                  <>
                    <span>Checkout with ApePay ({totalEth} ETH)</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="text-center text-[10px] text-[#888888] font-mono-tech">
                MERCHANT API KEY: {apiKey.slice(0, 12)}...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
