import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products, cookerFeatures } from "@/app/data/products";
import { ArrowLeft } from "lucide-react";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) return { title: "Product Not Found — BHARATI" };
  return {
    title: `${product.name} — BHARATI`,
    description: product.description,
  };
}

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen pt-[var(--header-height)]">
      <div className="section-container section-spacing">
        {/* Back link */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-[0.75rem] tracking-[0.12em] uppercase text-bharati-ash hover:text-bharati-black transition-colors duration-300 mb-12"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          All Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Product Image */}
          <div className="relative aspect-square bg-bharati-ivory">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-12"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <span className="text-label text-bharati-mint-dark mb-4 block font-medium">
              {product.category.replace("-", " ")}
            </span>
            <h1 className="text-headline text-bharati-black mb-4">
              {product.name}
            </h1>
            <p className="text-body-large text-bharati-ash mb-3">
              {product.tagline}
            </p>
            <p className="text-[0.95rem] text-bharati-silver font-light leading-relaxed mb-8 max-w-md">
              {product.description}
            </p>
            <p className="text-[1.75rem] font-medium text-bharati-mint-dark mb-8">
              {product.price}
            </p>

            {/* CTA */}
            <button className="btn-primary w-fit mb-6">Add to Cart</button>

            {/* Features (show for pressure cooker) */}
            {product.slug === "pressure-cooker" && (
              <div className="mt-10 pt-10 border-t border-bharati-mist">
                <span className="text-label text-bharati-mint-dark mb-6 block font-medium">
                  Features
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {cookerFeatures.map((feature) => (
                    <div key={feature.number}>
                      <span className="text-[0.7rem] tracking-[0.2em] text-bharati-mint-dark font-semibold bg-bharati-mint/15 px-3 py-0.5 rounded-full border border-bharati-mint/25 inline-block mb-1.5">
                        {feature.number}
                      </span>
                      <h3 className="text-[0.95rem] font-medium text-bharati-charcoal mt-1 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-[0.8rem] text-bharati-silver font-light leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
