import { cn } from "@/lib/cn";

type RichTextContentProps = {
  html: string;
  className?: string;
};

export function RichTextContent({ html, className }: Readonly<RichTextContentProps>) {
  return (
    <div
      className={cn(
        "text-base leading-relaxed text-muted",
        "min-w-0 max-w-full break-words [overflow-wrap:anywhere]",
        "[&_*]:max-w-full [&_a]:break-all [&_div]:break-words",
        "[&_a]:text-primary [&_a]:underline [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
