import { catalogConfig } from "@/config/catalog";
import { siteConfig } from "@/config/site";
import { CatalogBand, CatalogHeading } from "@/components/sections/catalog-ui";
import { Button } from "@/components/ui/Button";
import { Reveal, RevealItem, RevealStagger } from "@/components/ui/Reveal";

function formatIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function CatalogConditionsSection() {
  const { conditions, payments } = catalogConfig;

  return (
    <>
      <CatalogBand
        id={conditions.id}
        className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12"
      >
        <div className="mx-auto max-w-[820px]">
          <Reveal>
            <CatalogHeading
              eyebrow={conditions.eyebrow}
              title={conditions.title}
            />
          </Reveal>

          <RevealStagger
            stagger={0.06}
            className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2"
          >
            {conditions.items.map((item, index) => (
              <RevealItem key={item.title}>
                <article className="border-t border-white/15 pt-5 text-center sm:text-left">
                  <p className="text-[0.62rem] uppercase tracking-[0.26em] text-catalog-gold">
                    {formatIndex(index)} — {item.title}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/80">
                    {item.body}
                  </p>
                </article>
              </RevealItem>
            ))}
          </RevealStagger>

          <Reveal className="mt-14 flex justify-center">
            <Button
              href={siteConfig.whatsapp.href}
              variant="outline"
              external
              className="border-white/35 text-white hover:border-catalog-gold hover:bg-catalog-gold hover:text-catalog-ink"
            >
              Enviar reserva por WhatsApp
            </Button>
          </Reveal>
        </div>
      </CatalogBand>

      <CatalogBand
        id={payments.id}
        className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12"
      >
        <div className="mx-auto max-w-[640px]">
          <Reveal>
            <CatalogHeading eyebrow={payments.eyebrow} title={payments.title} />
          </Reveal>

          <RevealStagger
            stagger={0.1}
            className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-5"
          >
            {payments.accounts.map((account) => (
              <RevealItem key={account.id}>
                <article className="border border-white/15 bg-white/[0.04] px-6 py-8 text-center backdrop-blur-[2px]">
                  <p className="text-[0.62rem] uppercase tracking-[0.26em] text-catalog-gold">
                    {account.label}
                  </p>
                  <p className="mt-3 font-display text-2xl tracking-[0.08em] text-white sm:text-[1.75rem]">
                    {account.number}
                  </p>
                </article>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </CatalogBand>
    </>
  );
}
