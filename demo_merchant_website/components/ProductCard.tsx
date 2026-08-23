'use client';

import React from 'react';
import { Product } from '../lib/products';
import { ShoppingBag, Star, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  isAdded?: boolean;
}

export function ProductCard({ product, onAddToCart, onQuickView, isAdded }: ProductCardProps) {
  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-[#ebebeb] bg-white p-4 shadow-stacked-md hover:border-[#a1a1a1] hover:shadow-stacked-lg transition-all duration-200">
      <div>
        {/* Thumbnail Image Container */}
        <div 
          onClick={() => onQuickView(product)}
          className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-[#fafafa] cursor-pointer group-hover:opacity-95 transition-opacity"
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
          {product.tag && (
            <span className="absolute top-2 left-2 rounded-full bg-[#171717] px-2.5 py-0.5 text-[10px] font-medium text-white shadow-sm font-mono-tech uppercase">
              {product.tag}
            </span>
          )}
        </div>

        {/* Product Information */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-[#888888] font-mono-tech">
            <span>{product.sku}</span>
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </div>
          </div>

          <h3 
            onClick={() => onQuickView(product)}
            className="mt-1.5 text-base font-semibold text-[#171717] cursor-pointer hover:text-[#0070f3] transition-colors line-clamp-1"
          >
            {product.name}
          </h3>

          <p className="mt-1 text-xs text-[#4d4d4d] line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Footer Price & Add Button */}
      <div className="mt-5 flex items-center justify-between pt-3 border-t border-[#ebebeb]">
        <div>
          <div className="font-mono-tech text-base font-bold text-[#171717]">
            {product.priceEth} ETH
          </div>
          <div className="text-[11px] text-[#888888]">
            ~${product.priceUsd.toFixed(2)} USD
          </div>
        </div>

        <button
          onClick={() => onAddToCart(product)}
          disabled={isAdded}
          className={`inline-flex items-center space-x-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all ${
            isAdded
              ? 'bg-emerald-600 text-white cursor-default'
              : 'bg-[#171717] text-white hover:bg-[#333333] active:scale-95 shadow-sm'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
