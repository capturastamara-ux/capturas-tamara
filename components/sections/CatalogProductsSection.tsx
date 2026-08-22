import Image from "next/image";
import {
  catalogConfig,
  formatCop,
  type CatalogProduct,
} from "@/config/catalog";
import { CatalogBand, CatalogHeading } from "@/components/sections/catalog-ui";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

type ProductImage = {
  src: string;
  alt: string;
};

type CatalogProductsSectionProps = {
  imagesByProduct: Readonly<Record<string, ReadonlyArray<ProductImage>>>;
};

function PlaqueFan({
  images,
}: Readonly<{ images: ReadonlyArray<ProductImage> }>) {
  const rotations = ["-10deg", "1deg", "10deg"] as const;
  const layers = [1, 3, 2] as const;

  return (
    <div className="flex w-full justify-center lg:justify-start">
      <div className="flex items-center justify-center">
        {images.slice(0, 3).map((image, index) => (
          <div
            key={`${image.src}-${index}`}
            className={cn(
              "relative w-[6.6rem] shrink-0 bg-[#1a120c] p-1.5 shadow-[0_18px_40px_rgb(0_0_0_/_0.4)] sm:w-[7.5rem] sm:p-2",
              index > 0 && "-ml-7 sm:-ml-8",
            )}
            style={{
              transform: `rotate(${rotations[index] ?? "0deg"})`,
              zIndex: layers[index] ?? 1,
            }}
          >
            <div className="bg-[#f4efe8] p-1">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="140px"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PriceTable({ product }: Readonly<{ product: CatalogProduct }>) {
  return (
    <div className="border-y border-white/15">
      <table className="w-full border-collapse text-white">
        <caption className="sr-only">{product.subtitle}</caption>
        <tbody>
          {product.rows.map((row) => (
            <tr
              key={row.size}
              className="border-b border-white/10 last:border-b-0 transition-colors hover:bg-white/5"
            >
              <th
                scope="row"
                className="py-3 pr-4 text-left text-sm font-medium tracking-[0.08em] text-white/80 sm:py-3.5 sm:text-base"
              >
                {row.size}
                <span className="ml-1.5 text-[0.65rem] uppercase tracking-[0.16em] text-white/45">
                  cm
                </span>
              </th>
              <td className="py-3 text-right font-display text-lg tabular-nums text-catalog-gold sm:text-xl">
                {formatCop(row.price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CatalogProductsSection({
  imagesByProduct,
}: Readonly<CatalogProductsSectionProps>) {
  return (
    <div id="productos">
      {catalogConfig.products.map((product, index) => {
        const images = imagesByProduct[product.id] ?? product.images;

        return (
        <CatalogBand
          key={product.id}
          id={product.id}
          className="px-5 py-14 sm:px-8 sm:py-16 lg:px-12"
        >
          <div
            className={cn(
              "mx-auto flex w-full max-w-[820px] flex-col items-center",
              index > 0 && "border-t border-white/10 pt-14 sm:pt-16",
            )}
          >
            <Reveal className="w-full">
              <CatalogHeading eyebrow={product.eyebrow} title={product.title} />
            </Reveal>

            <div className="mt-10 flex w-full flex-col items-center gap-8 lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-12">
              <Reveal className="flex w-full flex-col items-center lg:items-start">
                <PlaqueFan images={images} />
                <p className="mt-8 w-full text-center text-[0.68rem] uppercase tracking-[0.22em] text-white/70">
                  {product.subtitle}
                </p>
              </Reveal>
              <Reveal delay={0.08} className="w-full max-w-md lg:max-w-none">
                <PriceTable product={product} />
              </Reveal>
            </div>
          </div>
        </CatalogBand>
        );
      })}
    </div>
  );
}
