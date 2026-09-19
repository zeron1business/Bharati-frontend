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
