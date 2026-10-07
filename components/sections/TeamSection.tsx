import Image from "next/image";
import { teamConfig } from "@/config/team";
import { CatalogBand, CatalogHeading } from "@/components/sections/catalog-ui";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

type TeamSectionProps = {
  className?: string;
  showPageIntro?: boolean;
};

function splitDisplayName(fullName: string): { first: string; rest: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) {
    return { first: fullName, rest: "" };
  }
  return { first: parts[0] ?? fullName, rest: parts.slice(1).join(" ") };
}

export function TeamSection({
  className,
  showPageIntro = false,
}: Readonly<TeamSectionProps>) {
  const { sectionId, eyebrow, heading, pageIntro, members } = teamConfig;

  return (
    <CatalogBand
      id={sectionId}
      className={cn(
        "bg-gradient-to-b from-catalog via-catalog to-catalog-mid/95 px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24",
        className,
      )}
    >
      <div className="mx-auto max-w-[1100px]">
        <Reveal>
          <CatalogHeading eyebrow={eyebrow} title={heading} />
          {showPageIntro ? (
            <p className="mx-auto mt-8 max-w-xl text-center text-sm leading-relaxed text-white/80 sm:text-base">
              {pageIntro}
            </p>
          ) : null}
        </Reveal>

        <ul
          className={cn(
            "mt-12 flex flex-wrap items-start justify-center gap-x-10 gap-y-12 sm:mt-14 sm:gap-x-14 lg:gap-x-16",
            members.length === 1 && "sm:gap-x-0",
          )}
        >
          {members.map((member, index) => {
            const { first, rest } = splitDisplayName(member.name);
            return (
              <li key={member.id} className="w-[min(100%,11.5rem)] shrink-0">
                <Reveal delay={index * 0.08}>
                  <figure className="flex flex-col items-center text-center">
                    <div className="relative size-[clamp(7.5rem,22vw,10.5rem)] overflow-hidden rounded-full bg-black/30 shadow-[0_12px_40px_rgb(0_0_0_/_0.35)]">
                      <Image
                        src={member.photo}
                        alt={member.photoAlt}
                        fill
                        sizes="(max-width: 640px) 40vw, 168px"
                        className="object-cover object-center"
                      />
                    </div>
                    <figcaption className="mt-5 font-sans text-sm leading-snug text-white sm:text-[0.95rem]">
                      <span className="block">{first}</span>
                      {rest ? <span className="block">{rest}</span> : null}
                      {member.role ? (
                        <span className="mt-1 block text-xs text-white/70">
                          {member.role}
                        </span>
                      ) : null}
                    </figcaption>
                  </figure>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </CatalogBand>
  );
}
