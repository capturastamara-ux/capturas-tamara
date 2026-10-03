import Image from "next/image";
import { liveContentConfig } from "@/config/live-content";

type LiveEventPhotoStripProps = {
  images: ReadonlyArray<{ id: string; url: string }>;
  title: string;
};

const thumbClass =
  "relative h-[4.5rem] w-[6.75rem] shrink-0 overflow-hidden rounded-xl sm:h-[4.75rem] sm:w-[7.125rem]";

export function LiveEventPhotoStrip({
  images,
  title,
}: Readonly<LiveEventPhotoStripProps>) {
  if (images.length === 0) return null;

  const photos = images.slice(0, liveContentConfig.maxImages);

  return (
    <div className="mx-auto max-w-3xl">
      <div
        className="-mx-5 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:snap-none sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden"
        aria-label="Fotos del evento"
      >
        {photos.map((image, index) => (
          <div key={image.id} className={`${thumbClass} snap-start`}>
            <Image
              src={image.url}
              alt={`${title} ${index + 1}`}
              fill
              quality={70}
              sizes="108px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
