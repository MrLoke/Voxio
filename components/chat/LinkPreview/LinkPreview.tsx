"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Loader2, Play } from "lucide-react";

type PreviewResp = {
  provider?: string;
  url: string;
  title?: string;
  description?: string;
  images?: string[];
  html?: string;
  mediaType?: string;
};

export function LinkPreview({
  href,
  children,
}: {
  href: string;
  children?: React.ReactNode;
}) {
  const [data, setData] = useState<PreviewResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  // IntersectionObserver lazy load
  useEffect(() => {
    const el = ref.current;
    if (!el) {
      // fetch immediately if no ref
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      });
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let ignore = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/preview?url=${encodeURIComponent(href)}`);
        const json = await res.json();
        if (!ignore) {
          if (!json || json.error) {
            setFailed(true);
          } else {
            setData(json);
          }
        }
      } catch (err) {
        setFailed(true);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [href, visible]);

  // fallback link
  if (failed) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:underline wrap-break-word"
      >
        {children ?? href}
      </a>
    );
  }

  if (loading || !data) {
    return (
      <div
        ref={ref}
        className="flex items-center gap-2 text-xs p-2 bg-gray-100 rounded-md"
      >
        <Loader2 className="animate-spin" size={16} />
        Ładowanie podglądu...
      </div>
    );
  }

  // provider-specific rendering
  const provider = data.provider;
  const title = data.title ?? "";
  const desc = data.description ?? "";
  const image = data.images && data.images.length > 0 ? data.images[0] : null;

  // Helper: safe domain label
  const domainLabel = (() => {
    try {
      return new URL(data.url).hostname.replace("www.", "");
    } catch {
      return data.url;
    }
  })();

  // YouTube embed: prefer iframe using video id
  if (provider === "youtube") {
    const ytId = (() => {
      try {
        const u = new URL(href);
        if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
        if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
      } catch {}
      return null;
    })();
    if (ytId) {
      return (
        <div className="border rounded-lg overflow-hidden shadow-sm max-w-[640px]">
          <div className="relative w-full h-56 bg-black">
            <iframe
              title={title || "YouTube"}
              src={`https://www.youtube.com/embed/${ytId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          <div className="p-3">
            <div className="text-xs uppercase text-gray-500">{domainLabel}</div>
            <div className="font-semibold mt-1">{title}</div>
            {desc && (
              <div className="text-xs text-slate-200 mt-1 line-clamp-2">
                {desc}
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  // Spotify embed (if html exists, embed; else attempt spotify embed url)
  if (provider === "spotify") {
    // oEmbed returns html usually, but we can build embed url:
    const embedUrl = href.replace("open.spotify.com", "open.spotify.com/embed");
    return (
      <div className="border rounded-lg overflow-hidden shadow-sm max-w-[640px]">
        <div className="relative w-full h-36 bg-black">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            frameBorder={0}
            allow="encrypted-media"
          />
        </div>
        <div className="p-3 bg-white">
          <div className="text-xs uppercase text-gray-500">{domainLabel}</div>
          <div className="font-semibold mt-1">{title}</div>
        </div>
      </div>
    );
  }

  // TikTok, SoundCloud, Twitter: if html present from oEmbed, render it
  if (
    (provider === "tiktok" ||
      provider === "soundcloud" ||
      provider === "twitter") &&
    data.html
  ) {
    return (
      <div className="border rounded-lg overflow-hidden shadow-sm max-w-[640px] p-0">
        <div
          className="p-3 bg-white"
          dangerouslySetInnerHTML={{ __html: data.html }}
        />
      </div>
    );
  }

  // Generic card fallback with image
  return (
    <div
      ref={ref}
      className="border rounded-lg overflow-hidden shadow-sm max-w-[640px]"
    >
      {image && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative w-full h-40"
        >
          {/*FIX IT*/}
          {/* Use native img to avoid Next/Image domain config issues for external dynamic urls; you can swap to next/image if domains configured */}
          <img
            src={image}
            alt={title || "preview"}
            className="object-cover w-full h-full"
          />
        </a>
      )}
      <div className="p-3 bg-white">
        <div className="text-xs uppercase text-gray-500">{domainLabel}</div>
        <div className="font-semibold mt-1 text-slate-600">{title}</div>
        {desc && (
          <div className="text-xs text-gray-600 mt-1 line-clamp-2">{desc}</div>
        )}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline mt-2 block"
        >
          {domainLabel}
        </a>
      </div>
    </div>
  );
}
