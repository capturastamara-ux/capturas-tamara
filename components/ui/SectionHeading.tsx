import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  children,
  as: Tag = "h2",
  className,
  align = "center",
}: SectionHeadingProps) {
  return (
    <Tag
      className={cn(
        "whitespace-pre-line font-display text-[clamp(1.75rem,4vw,3rem)] font-normal leading-[1.15] tracking-[-0.01em] text-primary",
        align === "center" && "text-center",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
