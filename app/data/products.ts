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
    id: "prod-regular-cooker",
    name: "Regular Cooker",
    slug: "bharati-regular-pressure-cooker",
    tagline: "Reliable Everyday Pressure Cooking",
    description:
      "Bharati Regular Pressure Cooker is designed for convenient and efficient everyday cooking. Built with durable aluminium construction.",
    price: "₹ 1,999",
    image: "/products/Cooker-front.jpg",
    category: "pressure-cookers",
    featured: true,
  },
  {
    id: "prod-triply-saucepan",
    name: "Saucepan",
    slug: "triply-saucepan",
    tagline: "Precise Heat for Everyday Cooking.",
    description:
      "A compact tri-ply stainless steel saucepan designed for boiling, heating, and everyday small-batch cooking.",
    price: "₹ 1,849",
    image: "/products/Cooker-right.jpg",
    category: "tri-ply-products",
    featured: true,
  },
  {
    id: "prod-triply-kadai",
    name: "Kadai",
    slug: "triply-kadhai",
    tagline: "Deep Cooking. Even Heat.",
    description:
      "A versatile tri-ply stainless steel kadhai designed for frying, sautéing, curries, and everyday Indian cooking.",
    price: "₹ 2,249",
    image: "/products/Cooker-slight-left.jpg",
    category: "tri-ply-products",
    featured: true,
  },
  {
    id: "prod-triply-casserole",
    name: "Casserole",
    slug: "triply-casserole",
    tagline: "Built for Slow, Even Cooking.",
    description:
      "A premium tri-ply stainless steel casserole designed for cooking, simmering, and serving everyday meals.",
    price: "₹ 2,399",
    image: "/products/Cooker-slightRight.jpg",
    category: "tri-ply-products",
    featured: true,
  },
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
    { name: "Tri-ply Products", href: "/products?category=tri-ply-products" },
  ],
  products: [
    { name: "Regular Cooker", href: "/products/bharati-regular-pressure-cooker" },
    { name: "Saucepan", href: "/products/triply-saucepan" },
    { name: "Kadai", href: "/products/triply-kadhai" },
    { name: "Casserole", href: "/products/triply-casserole" },
    { name: "See more...", href: "/products" },
  ],
  support: [
    { name: "Track Order", href: "/track-order" },
    { name: "Return & Exchange", href: "/returns" },
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
  ],
};
