import { RichTextContent } from "@/components/ui/RichTextContent";
import { formatPlanPrice } from "@/lib/format/price";
import { getComparisonColumnLayout } from "@/lib/cotizador/layout";
import { getComparisonSectionTitles } from "@/lib/cotizador/sections";
import type { ComparisonPlan } from "@/lib/cotizador/types";
import { cn } from "@/lib/cn";

type PlanComparisonTableProps = {
  plans: ComparisonPlan[];
  variant?: "admin" | "client";
  selectedGuestCount?: number | null;
};

const labelCellClass =
  "border-r border-primary/15 bg-background py-3 pl-2 pr-3 text-[0.62rem] font-semibold uppercase leading-tight tracking-[0.1em] text-primary sm:sticky sm:left-0 sm:z-10 sm:px-4 sm:py-4 sm:text-xs sm:font-normal sm:leading-normal sm:tracking-[0.14em] sm:text-muted";

const labelHeadClass =
  "border-r border-primary/15 bg-surface py-3 pl-2 pr-3 sm:sticky sm:left-0 sm:z-20 sm:bg-surface/60 sm:px-4 sm:py-3";

const planCellClass =
  "border-l border-primary/10 py-3 pl-4 pr-3 align-top sm:pl-5 sm:pr-4 sm:py-4";

const planHeadClass =
  "border-l border-primary/15 py-3 pl-4 pr-3 align-top sm:bg-surface/60 sm:pl-5 sm:pr-4 sm:py-3";

const cotizadorRichTextClass =
  "text-[0.8125rem] leading-relaxed sm:text-sm [&_ol]:my-2 [&_ol]:pl-4 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ul]:pl-4 sm:[&_ol]:pl-5 sm:[&_ul]:pl-5";

export function PlanComparisonTable({
  plans,
  variant = "client",
  selectedGuestCount = null,
}: Readonly<PlanComparisonTableProps>) {
  const sectionTitles = getComparisonSectionTitles(plans);
  const showDraftBadge = variant === "admin";
  const { tableMinWidth, labelWidthPx, planWidthPx } =
    getComparisonColumnLayout(plans.length);

  if (plans.length === 0) {
    return (
      <p className="rounded-sm border border-primary/10 bg-background p-6 text-sm text-muted">
        No hay planes publicados para mostrar en esta categoría.
      </p>
    );
  }

  return (
    <div className="cotizador-comparison-scroll relative overflow-x-auto rounded-sm border border-primary/15 bg-background shadow-[0_2px_12px_rgb(26_26_26_/_0.06)] print:overflow-visible print:border-0 print:shadow-none">
      <table
        className="w-full text-left text-sm print:min-w-0"
        style={{ minWidth: tableMinWidth }}
      >
        <thead className="border-b border-primary/15 bg-surface text-xs uppercase tracking-[0.12em] text-muted print:bg-transparent">
          <tr>
            <th
              className={cn(
                labelHeadClass,
                "text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-primary sm:text-xs sm:font-normal sm:tracking-[0.12em] sm:text-muted",
              )}
              style={{ minWidth: labelWidthPx, width: labelWidthPx }}
            >
              <span className="sm:hidden" aria-hidden="true">
                &nbsp;
              </span>
              <span className="hidden sm:inline">Comparar</span>
            </th>
            {plans.map((plan, index) => (
              <th
                key={plan.id}
                className={cn(
                  planHeadClass,
                  index % 2 === 1 && "bg-cream/70 sm:bg-cream/40",
                )}
                style={{ minWidth: planWidthPx }}
              >
                <p className="font-display text-[1.15rem] italic leading-tight text-primary sm:text-lg">
                  {plan.title}
                </p>
                {plan.tagline && (
                  <p className="mt-1.5 text-[0.7rem] normal-case leading-snug tracking-normal text-muted sm:text-xs">
                    {plan.tagline}
                  </p>
                )}
                {showDraftBadge && !plan.published && (
                  <p className="mt-2 text-[10px] text-accent">Borrador</p>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-primary/15 bg-cream/45 align-top">
            <td
              className={cn(labelCellClass, "bg-cream/95")}
              style={{ minWidth: labelWidthPx, width: labelWidthPx }}
            >
              Precio
            </td>
            {plans.map((plan, index) => (
              <td
                key={plan.id}
                className={cn(
                  planCellClass,
                  "bg-cream/45 text-base font-semibold tabular-nums text-primary sm:text-sm sm:font-medium",
                  index % 2 === 1 && "bg-cream/70",
                )}
                style={{ minWidth: planWidthPx }}
              >
                {plan.price != null ? (
                  formatPlanPrice(plan.price)
                ) : (
                  <span className="font-normal text-muted">—</span>
                )}
              </td>
            ))}
          </tr>
          <tr className="border-b border-primary/10 align-top">
            <td
              className={labelCellClass}
              style={{ minWidth: labelWidthPx, width: labelWidthPx }}
            >
              Descripción
            </td>
            {plans.map((plan, index) => (
              <td
                key={plan.id}
                className={cn(
                  planCellClass,
                  index % 2 === 1 && "bg-surface/50",
                )}
                style={{ minWidth: planWidthPx }}
              >
                {plan.description ? (
                  <RichTextContent
                    html={plan.description}
                    className={cotizadorRichTextClass}
                  />
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
            ))}
          </tr>

          {sectionTitles.map((title) => (
            <tr key={title} className="border-b border-primary/10 align-top">
              <td
                className={labelCellClass}
                style={{ minWidth: labelWidthPx, width: labelWidthPx }}
              >
                <span className="break-words">{title}</span>
              </td>
              {plans.map((plan, index) => {
                const section = plan.sections.find(
                  (item) => item.title === title,
                );
                return (
                  <td
                    key={plan.id}
                    className={cn(
                      planCellClass,
                      index % 2 === 1 && "bg-surface/50",
                    )}
                    style={{ minWidth: planWidthPx }}
                  >
                    {section ? (
                      <div>
                        {section.intro && (
                          <p className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-primary/70 sm:text-xs sm:font-normal sm:text-muted">
                            {section.intro}
                          </p>
                        )}
                        {section.note ? (
                          <RichTextContent
                            html={section.note}
                            className={cn("mt-1.5 sm:mt-2", cotizadorRichTextClass)}
                          />
                        ) : (
                          <p className="mt-1.5 text-sm font-medium text-primary">
                            Incluido
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
