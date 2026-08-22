import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

type SiteLogoProps = {
  size?: "sm" | "md" | "lg";
  linked?: boolean;
  showName?: boolean;
  stackedOnMobile?: boolean;
  nameClassName?: string;
  className?: string;
  priority?: boolean;
  onClick?: () => void;
};

const sizeMap = {
  sm: { dimension: 40, className: "h-10 w-10" },
  md: { dimension: 56, className: "h-14 w-14" },
  lg: { dimension: 72, className: "h-[4.5rem] w-[4.5rem]" },
} as const;

export function SiteLogo({
  size = "sm",
  linked = true,
  showName = false,
  stackedOnMobile = false,
  nameClassName,
  className,
  priority = false,
  onClick,
}: Readonly<SiteLogoProps>) {
  const { dimension, className: sizeClassName } = sizeMap[size];

  const image = (
    <Image
      src={siteConfig.logo.main}
      alt={showName ? "" : siteConfig.logo.alt}
      aria-hidden={showName ? true : undefined}
      width={dimension}
      height={dimension}
      priority={priority}
      className={cn("shrink-0 object-contain", sizeClassName, className)}
    />
  );

  const content = showName ? (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 sm:gap-3",
        stackedOnMobile && "max-lg:flex-col max-lg:gap-2.5 max-lg:text-center",
      )}
    >
      {image}
      <span
        className={cn(
          "font-display text-[0.72rem] font-normal uppercase tracking-[0.22em] sm:text-[0.85rem] sm:tracking-[0.28em]",
          nameClassName,
        )}
      >
        {siteConfig.logo.wordmark}
      </span>
    </span>
  ) : (
    image
  );

  if (!linked) return content;

  return (
    <Link
      href="/"
      aria-label={siteConfig.name}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 transition-opacity hover:opacity-85",
        stackedOnMobile && "max-lg:mx-auto",
      )}
    >
      {content}
    </Link>
  );
}
