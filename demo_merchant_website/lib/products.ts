export interface Product {
  id: string;
  name: string;
  sku: string;
  category: 'Hardware' | 'Apparel' | 'Accessories' | 'Digital Goods';
  priceEth: string;
  priceUsd: number;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  tag?: string;
  description: string;
  features: string[];
  imageUrl: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 'prod_zk_keycard',
    name: 'zkBob Zero-Knowledge Hardware Keycard',
    sku: 'HW-ZK-001',
    category: 'Hardware',
    priceEth: '0.045',
    priceUsd: 135.0,
    rating: 4.9,
    reviewsCount: 42,
    inStock: true,
    tag: 'Best Seller',
    description:
      'Ultra-secure, air-gapped NFC smart card engineered to store private keys and execute zero-knowledge commitment signatures locally.',
    features: [
      'EAL6+ secure element chip',
      'NFC & USB-C dual connectivity',
      'zkBob commitment protocol native support',
      'Stainless steel casing',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'prod_neural_hoodie',
    name: 'Cypherpunk Encrypted Mesh Hoodie',
    sku: 'AP-HOOD-09',
    category: 'Apparel',
    priceEth: '0.025',
    priceUsd: 75.0,
    rating: 4.8,
    reviewsCount: 89,
    inStock: true,
    tag: 'Limited Edition',
    description:
      'Heavyweight 450GSM organic cotton hoodie featuring anti-surveillance signal-blocking inner pocket and reflective monospace typography.',
    features: [
      'RF Faraday signal-shielded pocket for phone/wallet',
      '450 GSM French Terry Cotton',
      'Embroidered ApePay & zkBob developer iconography',
      'Unisex architectural cut',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'prod_zk_signer',
    name: 'ApeVault Portable ZK Transaction Signer',
    sku: 'HW-SIGN-102',
    category: 'Hardware',
    priceEth: '0.088',
    priceUsd: 264.0,
    rating: 5.0,
    reviewsCount: 19,
    inStock: true,
    tag: 'New Flagship',
    description:
      'Standalone hardware wallet with embedded OLED display for verifying zkBob commitment proofs before broadcasting to EVM networks.',
    features: [
      '1.3-inch high-contrast monochrome OLED',
      'Dual ARM Cortex-M4 processors',
      'Encrypted USB-C interface',
      'Open-source firmware architecture',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1563770660941-20978e770fa3?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'prod_dev_mat',
    name: 'Geist Monospace Desk Mat (XL)',
    sku: 'AC-MAT-88',
    category: 'Accessories',
    priceEth: '0.012',
    priceUsd: 36.0,
    rating: 4.7,
    reviewsCount: 64,
    inStock: true,
    description:
      '900x400mm ultra-smooth desk mat featuring smart contract EVM bytecode print and stitched anti-fray edges.',
    features: [
      '900mm x 400mm x 4mm dimensions',
      'Water-resistant micro-texture surface',
      'Anti-slip natural rubber base',
      'High-density edge stitching',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1616469829941-c7200edec809?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'prod_zk_node_license',
    name: 'Private Relay Node Pro Pass (1 Year)',
    sku: 'DG-NODE-2026',
    category: 'Digital Goods',
    priceEth: '0.060',
    priceUsd: 180.0,
    rating: 4.9,
    reviewsCount: 31,
    inStock: true,
    tag: 'Digital NFT Pass',
    description:
      '12-month access license to high-throughput, zero-log RPC endpoints optimized for zkBob transactions and EVM privacy protocols.',
    features: [
      '10M requests / month RPC quota',
      '< 20ms global relay latency',
      'Zero-log privacy guarantee',
      'Automated webhook retry infrastructure',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'prod_privacy_beanie',
    name: 'Faraday Weave Stealth Beanie',
    sku: 'AP-BEAN-03',
    category: 'Apparel',
    priceEth: '0.009',
    priceUsd: 27.0,
    rating: 4.6,
    reviewsCount: 28,
    inStock: true,
    description:
      'Thermoregulating ribbed knit beanie infused with metallic conductive fibers for comfort and discreet style.',
    features: [
      '100% Merino wool blend',
      'Discreet woven ApePay logo tab',
      'One size fits all',
      'Windproof thermal lining',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?q=80&w=800&auto=format&fit=crop',
  },
];
