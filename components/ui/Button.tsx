import Link from "next/link";
import { cn } from "@/lib/cn";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "outline" | "filled" | "ghost";
  className?: string;
  external?: boolean;
};

export function Button({
  href,
  children,
  variant = "outline",
  className,
  external,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full px-7 py-3 text-xs font-medium uppercase tracking-[0.12em] transition-all duration-200 hover:-translate-y-0.5 sm:text-sm";

  const variants = {
    outline:
      "border border-primary/30 bg-transparent text-primary hover:border-primary hover:bg-primary hover:text-white",
    filled: "bg-primary text-white hover:bg-primary/90",
    ghost: "text-primary underline-offset-4 hover:underline",
  };

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(base, variants[variant], className)}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cn(base, variants[variant], className)}>
      {children}
    </Link>
  );
}
