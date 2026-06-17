"use client";

interface Props {
  imgKey: string;
  label: string;
  bg: string;
}

export function EventCard({ imgKey, label, bg }: Props) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden aspect-[3/4] group shadow-sm hover:shadow-md transition-shadow"
      style={{ background: bg }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/events/${imgKey}.webp`}
        alt={label}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
      <p className="absolute bottom-0 left-0 right-0 px-3 pb-4 text-center text-white font-bold text-sm leading-snug drop-shadow-sm">
        {label}
      </p>
    </div>
  );
}
