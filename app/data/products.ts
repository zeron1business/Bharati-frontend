export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  price: string;
  image: string;
  category: string;
  featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
}

export interface ProductFeature {
  number: string;
  title: string;
  description: string;
}

export const categories: Category[] = [
  {
    id: "cat-1",
    name: "Pressure Cookers",
    slug: "pressure-cookers",
    image: "/products/Cooker-front.jpg",
    description: "Engineered for everyday Indian cooking",
  },
  {
    id: "cat-2",
    name: "Steel Utensils",
    slug: "steel-utensils",
    image: "/products/Cooker-slight-left.jpg",
    description: "Crafted for a lifetime",
  },
  {
    id: "cat-3",
    name: "Kitchen Racks",
    slug: "kitchen-racks",
    image: "/products/Cooker-top.jpg",
    description: "Organised. Elevated.",
  },
  {
    id: "cat-4",
    name: "Kitchen Essentials",
    slug: "kitchen-essentials",
    image: "/products/Cooker-right.jpg",
    description: "The foundation of great cooking",
  },
  {
    id: "cat-5",
    name: "Cookware",
    slug: "cookware",
    image: "/products/cooker-left.jpg",
    description: "Performance meets design",
  },
  {
    id: "cat-6",
    name: "Storage",
    slug: "storage",
    image: "/products/Cooker-slightRight.jpg",
    description: "Everything in its place",
  },
];

export const products: Product[] = [
  {
    id: "prod-1",
    name: "Pressure Cooker",
    slug: "pressure-cooker",
    tagline: "Everyday pressure. Reimagined.",
    description:
      "Built for the way India cooks. Premium aluminium construction with precision pressure control.",
    price: "₹ XXXX",
    image: "/products/Cooker-front.jpg",
    category: "pressure-cookers",
    featured: true,
  },
  {
    id: "prod-2",
    name: "Kadhai",
    slug: "kadhai",
    tagline: "Deep flavours. Perfect form.",
    description:
      "The essential vessel for every Indian kitchen. Designed for high-heat cooking.",
    price: "₹ XXXX",
    image: "/products/Cooker-slight-left.jpg",
    category: "cookware",
  },
  {
    id: "prod-3",
    name: "Saucepan",
    slug: "saucepan",
    tagline: "Precision in every pour.",
    description:
      "From tempering spices to simmering sauces. Engineered for control.",
    price: "₹ XXXX",
    image: "/products/Cooker-right.jpg",
    category: "cookware",
  },
  {
    id: "prod-4",
    name: "Frypan",
    slug: "frypan",
    tagline: "Sear. Sizzle. Serve.",
    description:
      "Even heat distribution for the perfect sear. Every single time.",
    price: "₹ XXXX",
    image: "/products/cooker-left.jpg",
    category: "cookware",
  },
  {
    id: "prod-5",
    name: "Biryani Pot",
    slug: "biryani-pot",
    tagline: "Layer by layer. Perfection.",
    description:
      "Designed for slow-cooking and dum. The perfect vessel for every celebration.",
    price: "₹ XXXX",
    image: "/products/Cooker-slightRight.jpg",
    category: "cookware",
  },
  {
    id: "prod-6",
    name: "Thali",
    slug: "thali",
    tagline: "The complete experience.",
    description:
      "Mirror-finished stainless steel. Designed to elevate your everyday meal.",
    price: "₹ XXXX",
    image: "/products/Cooker-top.jpg",
    category: "steel-utensils",
  },
  {
    id: "prod-7",
    name: "Vati",
    slug: "vati",
    tagline: "Small vessel. Big character.",
    description:
      "Perfectly proportioned for sides, dips, and accompaniments.",
    price: "₹ XXXX",
    image: "/products/Cooker-front.jpg",
    category: "steel-utensils",
  },
  {
    id: "prod-8",
    name: "Glasses",
    slug: "glasses",
    tagline: "Clarity in every sip.",
    description:
      "Stainless steel glasses built to last generations. Timeless design.",
    price: "₹ XXXX",
    image: "/products/Cooker-right.jpg",
    category: "steel-utensils",
  },
  {
    id: "prod-9",
    name: "Racks & Baskets",
    slug: "racks-baskets",
    tagline: "Order. Beautifully.",
    description:
      "Kitchen organisation that looks as good as it works.",
    price: "₹ XXXX",
    image: "/products/Cooker-slight-left.jpg",
    category: "kitchen-racks",
  },
];

export const cookerFeatures: ProductFeature[] = [
  {
    number: "01",
    title: "Precision Pressure Control",
    description:
      "Engineered weight valve for consistent pressure regulation. Designed to deliver perfectly cooked meals, every time.",
  },
  {
    number: "02",
    title: "Ergonomic Handle",
    description:
      "Heat-resistant bakelite handle with a natural grip angle. Built for comfort during daily use.",
  },
  {
    number: "03",
    title: "Durable Aluminium Body",
    description:
      "Premium grade aluminium for superior heat distribution. Lightweight yet built to endure years of everyday cooking.",
  },
  {
    number: "04",
    title: "Safety Mechanism",
    description:
      "Inside-fitting safety lid with metallic safety plug. Multiple layers of protection for complete peace of mind.",
  },
];

export const navLinks = {
  categories: [
    { name: "Pressure Cookers", href: "/products?category=pressure-cookers" },
    { name: "Steel Utensils", href: "/products?category=steel-utensils" },
    { name: "Kitchen Racks", href: "/products?category=kitchen-racks" },
    { name: "Kitchen Essentials", href: "/products?category=kitchen-essentials" },
    { name: "Cookware", href: "/products?category=cookware" },
    { name: "Storage", href: "/products?category=storage" },
  ],
  products: [
    { name: "Pressure Cooker", href: "/products/pressure-cooker" },
    { name: "Kadhai", href: "/products/kadhai" },
    { name: "Saucepan", href: "/products/saucepan" },
    { name: "Frypan", href: "/products/frypan" },
    { name: "Biryani Pot", href: "/products/biryani-pot" },
    { name: "Thali", href: "/products/thali" },
    { name: "Vati", href: "/products/vati" },
    { name: "Glasses", href: "/products/glasses" },
    { name: "Racks & Baskets", href: "/products/racks-baskets" },
  ],
  support: [
    { name: "Track Order", href: "/track-order" },
    { name: "Return & Exchange", href: "/returns" },
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
  ],
};
