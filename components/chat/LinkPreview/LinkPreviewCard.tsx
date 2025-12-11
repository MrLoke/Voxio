"use client";

import Image from "next/image";

interface Props {
  meta: {
    url: string;
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
    favicon?: string;
  };
}

export function LinkPreviewCard({ meta }: Props) {
  const domain = (() => {
    try {
      return new URL(meta.url).hostname.replace("www.", "");
    } catch {
      return "";
    }
  })();

  return (
    <a
      href={meta.url}
      target="_blank"
      rel="noopener noreferrer"
      className="
        block w-full rounded-xl border border-white/10 
        bg-white/5 backdrop-blur-sm
        hover:bg-white/10 transition 
        overflow-hidden shadow-lg
      "
    >
      {meta.image && (
        <div className="relative w-full h-48 bg-black/20 border-b border-white/10">
          <Image
            src={meta.image}
            alt={meta.title || "preview"}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      )}

      <div className="p-3 space-y-1">
        <div className="flex items-center gap-2 text-xs text-white/60">
          {meta.favicon && (
            <Image
              src={meta.favicon}
              alt="favicon"
              width={14}
              height={14}
              className="rounded-sm"
            />
          )}
          <span>{domain}</span>
        </div>

        <div className="font-semibold text-white leading-snug line-clamp-2">
          {meta.title || meta.url}
        </div>

        {meta.description && (
          <div className="text-sm text-white/70 line-clamp-2">
            {meta.description}
          </div>
        )}
      </div>
    </a>
  );
}
