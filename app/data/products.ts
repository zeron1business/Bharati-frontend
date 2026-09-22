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

export const products: Product[] = [
  {
    id: "prod-1",
    name: "Pressure Cooker",
    slug: "pressure-cooker",
    tagline: "Everyday pressure. Reimagined.",
    description:
      "Built for the way India cooks. Premium aluminium construction with precision pressure control.",
    price: "₹ 3,499",
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
    price: "₹ 2,199",
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
    price: "₹ 1,799",
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
    price: "₹ 1,899",
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
    price: "₹ 3,999",
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
    price: "₹ 899",
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
    price: "₹ 349",
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
    price: "₹ 499",
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
    price: "₹ 2,499",
    image: "/products/Cooker-slight-left.jpg",
    category: "kitchen-racks",
  },
];

export interface ProductFeature {
  number: string;
  title: string;
  description: string;
}

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
