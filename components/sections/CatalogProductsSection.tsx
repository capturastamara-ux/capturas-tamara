import Image from "next/image";
import {
  catalogConfig,
  formatCop,
  type CatalogProduct,
} from "@/config/catalog";
import { CatalogBand, CatalogHeading } from "@/components/sections/catalog-ui";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

function PlaqueFan({ product }: Readonly<{ product: CatalogProduct }>) {
  const offsets = [
    { rotate: "-11deg", x: "-28%", z: 1 },
    { rotate: "2deg", x: "0%", z: 3 },
    { rotate: "10deg", x: "28%", z: 2 },
  ] as const;

  return (
    <div className="relative mx-auto h-56 w-full max-w-lg sm:h-72">
      {product.images.map((image, index) => {
        const offset = offsets[index] ?? offsets[1];
        return (
          <div
            key={image.src}
            className="absolute top-1/2 left-1/2 w-[44%] max-w-[180px] origin-center -translate-x-1/2 -translate-y-1/2 bg-[#1a120c] p-[9px] shadow-[0_22px_50px_rgb(0_0_0_/_0.4)] sm:p-[11px]"
            style={{
              transform: `translate(-50%, -50%) translateX(${offset.x}) rotate(${offset.rotate})`,
              zIndex: offset.z,
            }}
          >
            <div className="bg-[#f4efe8] p-[5px] sm:p-1.5">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="180px"
                />
              </div>
            </div>
          </div>
        );
      })}
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
              <td className="py-3 text-right font-display text-xl tabular-nums text-catalog-gold sm:text-2xl">
                {formatCop(row.price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CatalogProductsSection() {
  return (
    <div id="productos">
      {catalogConfig.products.map((product, index) => (
        <CatalogBand
          key={product.id}
          id={product.id}
          className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12"
        >
          <div
            className={cn(
              "mx-auto max-w-[1100px]",
              index > 0 && "border-t border-white/10 pt-16 sm:pt-20",
            )}
          >
            <Reveal>
              <CatalogHeading eyebrow={product.eyebrow} title={product.title} />
            </Reveal>

            <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
              <Reveal>
                <PlaqueFan product={product} />
                <p className="mt-10 text-center text-[0.72rem] uppercase tracking-[0.22em] text-white/70 lg:text-left">
                  {product.subtitle}
                </p>
              </Reveal>
              <Reveal delay={0.08}>
                <PriceTable product={product} />
              </Reveal>
            </div>
          </div>
        </CatalogBand>
      ))}
    </div>
  );
}
