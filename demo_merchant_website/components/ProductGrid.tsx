'use client';

import React, { useState } from 'react';
import { Product, PRODUCTS } from '../lib/products';
import { ProductCard } from './ProductCard';
import { Search, X, Check, ShoppingBag, Shield } from 'lucide-react';

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
  addedProductIds: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function ProductGrid({
  onAddToCart,
  addedProductIds,
  selectedCategory,
  onSelectCategory,
}: ProductGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const categories = ['All', 'Hardware', 'Apparel', 'Accessories', 'Digital Goods'];

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="products-catalog" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Category Pills & Search Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ebebeb] pb-6">
        {/* Category Pill Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => onSelectCategory(category)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#171717] text-white shadow-sm'
                    : 'bg-white border border-[#ebebeb] text-[#4d4d4d] hover:bg-[#fafafa] hover:text-[#171717]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Search Input Box */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products or SKU..."
            className="w-full rounded-full border border-[#ebebeb] bg-white py-1.5 pl-9 pr-4 text-xs text-[#171717] placeholder-[#888888] focus:border-[#171717] focus:outline-none shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#171717]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Product Count Indicator */}
      <div className="mt-4 flex items-center justify-between text-xs text-[#888888]">
        <span>
          Showing <strong className="text-[#171717]">{filteredProducts.length}</strong> products
        </span>
        <span className="font-mono-tech text-[11px]">ALL PRICES IN ETH</span>
      </div>

      {/* Grid of Product Cards */}
      {filteredProducts.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onQuickView={(p) => setQuickViewProduct(p)}
              isAdded={addedProductIds.includes(product.id)}
            />
          ))}
        </div>
      ) : (
        <div className="mt-12 text-center py-16 rounded-xl border border-dashed border-[#ebebeb] bg-white p-8">
          <p className="text-base font-medium text-[#171717]">No products found</p>
          <p className="mt-1 text-xs text-[#888888]">Try adjusting your category filter or search term.</p>
          <button
            onClick={() => {
              onSelectCategory('All');
              setSearchQuery('');
            }}
            className="mt-4 rounded-full bg-[#171717] px-4 py-2 text-xs font-medium text-white shadow-sm"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Quick View Product Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[#ebebeb] bg-white p-6 shadow-modal">
            {/* Close Button */}
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute right-4 top-4 rounded-full border border-[#ebebeb] bg-[#fafafa] p-1.5 text-[#4d4d4d] hover:bg-[#ebebeb] hover:text-[#171717] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Product Thumbnail */}
              <div className="overflow-hidden rounded-xl bg-[#fafafa] border border-[#ebebeb]">
                <img
                  src={quickViewProduct.imageUrl}
                  alt={quickViewProduct.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Product Info */}
              <div>
                <div className="flex items-center space-x-2 text-xs text-[#888888] font-mono-tech">
                  <span>{quickViewProduct.sku}</span>
                  <span>•</span>
                  <span>{quickViewProduct.category}</span>
                </div>

                <h3 className="mt-2 text-xl font-semibold text-[#171717]">
                  {quickViewProduct.name}
                </h3>

                <div className="mt-3 font-mono-tech text-xl font-bold text-[#171717]">
                  {quickViewProduct.priceEth} ETH
                  <span className="ml-2 text-xs font-normal text-[#888888]">
                    (~${quickViewProduct.priceUsd.toFixed(2)} USD)
                  </span>
                </div>

                <p className="mt-3 text-xs text-[#4d4d4d] leading-relaxed">
                  {quickViewProduct.description}
                </p>

                {/* Features List */}
                <div className="mt-4 space-y-1.5 border-t border-[#ebebeb] pt-4">
                  <h4 className="text-xs font-semibold text-[#171717] uppercase tracking-wider font-mono-tech">
                    Specifications
                  </h4>
                  <ul className="space-y-1 text-xs text-[#4d4d4d]">
                    {quickViewProduct.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <Check className="h-3.5 w-3.5 text-[#0070f3] shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ApePay Badge */}
                <div className="mt-4 flex items-center space-x-2 rounded-lg bg-[#fafafa] p-2.5 border border-[#ebebeb] text-[11px] text-[#4d4d4d]">
                  <Shield className="h-4 w-4 text-[#0070f3] shrink-0" />
                  <span>Eligible for ApePay zkBob Privacy Checkout</span>
                </div>

                {/* Add to Cart CTA */}
                <button
                  onClick={() => {
                    onAddToCart(quickViewProduct);
                    setQuickViewProduct(null);
                  }}
                  className="mt-5 w-full flex items-center justify-center space-x-2 rounded-full bg-[#171717] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#333333] transition-all"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add to Cart ({quickViewProduct.priceEth} ETH)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
